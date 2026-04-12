import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  status: "active" | "locked" | "disabled" | null;
  role: string | null;
  mfa_enabled: boolean | null;
  last_login: string | null;
  created_at?: string | null;
  failed_attempts?: number | null;
  user_profiles?: {
    user_id: string;
    name: string | null;
    status: "active" | "locked" | "disabled" | null;
    role: string | null;
    mfa_enabled: boolean | null;
    last_login: string | null;
    created_at?: string | null;
  } | {
    user_id: string;
    name: string | null;
    status: "active" | "locked" | "disabled" | null;
    role: string | null;
    mfa_enabled: boolean | null;
    last_login: string | null;
    created_at?: string | null;
  }[] | null;
};

function getUserProfile(row: UserRow) {
  if (!row.user_profiles) return null;
  return Array.isArray(row.user_profiles) ? row.user_profiles[0] : row.user_profiles;
}

function serializeUser(row: UserRow) {
  const profile = getUserProfile(row);

  return {
    id: row.id,
    name: profile?.name ?? row.name ?? "",
    email: row.email ?? "",
    status: profile?.status ?? row.status ?? "active",
    role: profile?.role ?? row.role,
    mfa_enabled: profile?.mfa_enabled ?? row.mfa_enabled ?? false,
    last_login: profile?.last_login ?? row.last_login,
    failed_attempts: row.failed_attempts ?? 0,
    created_at: profile?.created_at ?? row.created_at ?? null,
    profile: profile ?? null,
  };
}

async function getSerializedUserById(id: string) {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select(`
      user_id,
      name,
      status,
      role,
      mfa_enabled,
      last_login,
      created_at
    `)
    .eq("user_id", id)
    .single();

  if (profileError) {
    return { error: profileError, user: null };
  }

  if (!profile) {
    return { error: null, user: null };
  }

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(id);

  if (authError) {
    return { error: authError, user: null };
  }

  const mergedUser: UserRow = {
    id,
    name: profile.name,
    email: authData.user?.email ?? null,
    status: profile.status,
    role: profile.role,
    mfa_enabled: profile.mfa_enabled,
    last_login: profile.last_login ?? authData.user?.last_sign_in_at ?? null,
    created_at: profile.created_at ?? null,
    failed_attempts: 0,
    user_profiles: {
      user_id: profile.user_id,
      name: profile.name,
      status: profile.status,
      role: profile.role,
      mfa_enabled: profile.mfa_enabled,
      last_login: profile.last_login,
      created_at: profile.created_at ?? null,
    },
  };

  return { error: null, user: serializeUser(mergedUser) };
}

async function updateUser(request: NextRequest, paramsPromise: Promise<{ id: string }>) {
  const { id } = await paramsPromise;
  const body = await request.json();
  const supabase = supabaseAdmin;

  if (body.email !== undefined) {
    return NextResponse.json(
      { error: "Email address cannot be edited" },
      { status: 400 }
    );
  }

  const usersUpdate: Record<string, unknown> = {};
  const profileUpdate: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    usersUpdate.name = name;
    profileUpdate.name = name;
  }
  if (body.status !== undefined) {
    usersUpdate.status = body.status;
    profileUpdate.status = body.status;
  }
  if (body.role !== undefined) {
    usersUpdate.role = body.role || null;
    profileUpdate.role = body.role || null;
  }
  if (body.mfa_enabled !== undefined) {
    usersUpdate.mfa_enabled = body.mfa_enabled;
    profileUpdate.mfa_enabled = body.mfa_enabled;
  }
  if (body.failed_attempts !== undefined) usersUpdate.failed_attempts = body.failed_attempts;

  const password = typeof body.password === "string" ? body.password.trim() : "";
  const hasPasswordUpdate = password.length > 0;

  if (Object.keys(usersUpdate).length === 0 && Object.keys(profileUpdate).length === 0 && !hasPasswordUpdate) {
    return NextResponse.json(
      { error: "No fields to update" },
      { status: 400 }
    );
  }

  if (
    usersUpdate.status !== undefined &&
    !["active", "locked", "disabled"].includes(String(usersUpdate.status))
  ) {
    return NextResponse.json(
      { error: "Invalid status. Must be one of: active, locked, disabled" },
      { status: 400 }
    );
  }

  if (hasPasswordUpdate) {
    const { error: passwordError } = await supabase.auth.admin.updateUserById(id, {
      password,
    });

    if (passwordError) {
      console.error("Supabase auth error:", passwordError);
      return NextResponse.json(
        { error: "Failed to update user password" },
        { status: 500 }
      );
    }
  }

  // if (Object.keys(usersUpdate).length > 0) {
  //   const { error: usersError } = await supabase
  //     .from("user_profiles")
  //     .update(usersUpdate)
  //     .eq("id", id);

  //   if (usersError) {
  //     console.error("Supabase error:", usersError);
  //     return NextResponse.json(
  //       { error: "Failed to update users table" },
  //       { status: 500 }
  //     );
  //   }
  // }

  if (Object.keys(profileUpdate).length > 0) {
    const { error: profileError } = await supabase
      .from("user_profiles")
      .update(profileUpdate)
      .eq("user_id", id);

    if (profileError) {
      console.error("Supabase error:", profileError);
      return NextResponse.json(
        { error: "Failed to update user_profiles table" },
        { status: 500 }
      );
    }
  }
  const { user, error } = await getSerializedUserById(id);

  if (error) {
    console.error("Supabase error:", error);
    return NextResponse.json(
      { error: "Failed to fetch updated user" },
      { status: 500 }
    );
  }

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(user);
}

// GET /api/users/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { user, error } = await getSerializedUserById(id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return await updateUser(request, params);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return await updateUser(request, params);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { error } = await supabase.from("users").delete().eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete user" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id, deleted: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
