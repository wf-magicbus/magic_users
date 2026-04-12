import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type UserRow = {
  user_id: string;
  name: string | null;
  status: "active" | "locked" | "disabled" | null;
  role: string | null;
  last_login: string | null;
  created_at?: string | null;
  failed_attempts?: number | null;
};

function serializeUser(row: UserRow, authUser?: { email?: string | null; last_sign_in_at?: string | null } | null) {

  return {
    id: row.user_id,
    name: row.name ?? "",
    email: authUser?.email ?? "",
    status: row.status ?? "active",
    role: row.role,
    last_login: row.last_login ?? authUser?.last_sign_in_at ?? null,
    failed_attempts: row.failed_attempts ?? 0,
    created_at: row.created_at ?? null,
  };
}

// GET /api/users?search=<name>&status=<active|locked|disabled>&page=<num>&limit=<num>
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search") ?? "";
    const status = request.nextUrl.searchParams.get("status") ?? "all";
    const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);

    const offset = (page - 1) * limit;
    const supabase = supabaseAdmin;

    let query = supabase
      .from("user_profiles")
      .select(
        `
          user_id,
          name,
          status,
          role,
          last_login,
          created_at
        `,
        { count: "exact" }
      );

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (search) {
      const escapedSearch = search.replace(/,/g, "\\,");
      query = query.ilike("name", `%${escapedSearch}%`);
    }

    query = query.order("created_at", { ascending: false }).range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    const total = count ?? 0;

    const profileRows = (data ?? []) as UserRow[];

    const authUsers = await Promise.all(
      profileRows.map(async (row) => {
        const { data: authData } = await supabase.auth.admin.getUserById(row.user_id);
        return authData.user
          ? {
            id: row.user_id,
            email: authData.user.email ?? null,
            last_sign_in_at: authData.user.last_sign_in_at ?? null,
          }
          : { id: row.user_id, email: null, last_sign_in_at: null };
      })
    );

    const authById = new Map(authUsers.map((u) => [u.id, u]));

    return NextResponse.json({
      users: profileRows.map((row) => serializeUser(row, authById.get(row.user_id))),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, status, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: name, email and password" },
        { status: 400 }
      );
    }

    if (status && !["active", "locked", "disabled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: active, locked, disabled" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin;
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedName = String(name).trim();

    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("name", trimmedName)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "User profile with this name already exists" },
        { status: 409 }
      );
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: String(password),
    });

    if (authError || !authData.user) {
      console.error("Supabase auth error:", authError);
      return NextResponse.json(
        { error: authError?.message ?? "Failed to create auth user" },
        { status: 500 }
      );
    }

    const authUserId = authData.user.id;

    const { data: profileData, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        user_id: authUserId,
        name: trimmedName,
        status: status || "active",
        role: role || null,
        last_login: null,
      })
      .select(`
        user_id,
        name,
        status,
        role,
        last_login,
        created_at
      `)
      .single();

    if (profileError) {
      console.error("Supabase profile error:", profileError);
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: authUserId,
        name: profileData?.name ?? trimmedName,
        email: trimmedEmail,
        status: profileData?.status ?? "active",
        role: profileData?.role ?? null,
        last_login: profileData?.last_login ?? null,
        created_at: profileData?.created_at ?? null,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
