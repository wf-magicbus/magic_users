import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

// GET /api/users?search=<name>&status=<active|locked|disabled>&page=<num>&limit=<num>
export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get("search") ?? "";
    const status = request.nextUrl.searchParams.get("status") ?? "all";
    const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase.from("user_profiles").select(`
      user_id,
      name,
      status,
      role,
      last_login,
      created_at
    `, { count: "exact" });

    // Apply status filter
    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    // Apply search filter on name
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Apply pagination
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
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      users: data ?? [],
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
    const { user_id, name, status, role } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Missing required field: name" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !["active", "locked", "disabled"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: active, locked, disabled" },
        { status: 400 }
      );
    }

    // Check if user profile with this name already exists
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("name", name)
      .single();

    if (existingProfile) {
      return NextResponse.json(
        { error: "User profile with this name already exists" },
        { status: 409 }
      );
    }

    // If user_id is not provided, generate a new UUID
    const finalUserId = user_id || crypto.randomUUID();

    // Create new user profile
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        user_id: finalUserId,
        name,
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

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
