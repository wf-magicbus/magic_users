import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

// GET /api/admin-roles
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("*")
      .order("role_name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch admin roles" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin-roles
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { role_name, description, is_admin, is_dedicated_admin, max_members } = body;

    if (!role_name?.trim()) {
      return NextResponse.json({ error: "role_name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("admin_roles")
      .insert({
        role_name: role_name.trim().toLowerCase().replace(/\s+/g, "_"),
        description: description?.trim() || null,
        is_admin: is_admin ?? false,
        is_dedicated_admin: is_dedicated_admin ?? false,
        max_members: max_members ?? 0,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ error: "A role with this name already exists" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
