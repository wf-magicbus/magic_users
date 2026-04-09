import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/admins
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("admin_accounts")
      .select(`
        id,
        user_id,
        name,
        email,
        role_id,
        created_at,
        created_by,
        admin_roles:role_id(
          role_name
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch admin accounts" },
        { status: 500 }
      );
    }

    // Transform response to match design document
    const formattedData = (data ?? []).map((admin: any) => ({
      id: admin.id,
      user_id: admin.user_id,
      name: admin.name,
      email: admin.email,
      role: admin.admin_roles?.role_name || null,
      created_at: admin.created_at,
      created_by: admin.created_by,
    }));

    return NextResponse.json({
      count: formattedData.length,
      admins: formattedData,
    });
  } catch (error) {
    console.error("Error fetching admin accounts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admins
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name, email, role_id, created_by } = body;

    // Validate required fields
    if (!user_id || !name || !email || !role_id) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, name, email, role_id" },
        { status: 400 }
      );
    }
    const supabase = await createClient();
    // Check if email already exists
    const { data: existingAdmin } = await supabase
      .from("admin_accounts")
      .select("id")
      .eq("email", email)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin account with this email already exists" },
        { status: 409 }
      );
    }

    // Insert new admin account
    const { data, error } = await supabase
      .from("admin_accounts")
      .insert({
        user_id,
        name,
        email,
        role_id,
        created_by: created_by || null,
        created_at: new Date().toISOString(),
      })
      .select(`
        id,
        user_id,
        name,
        email,
        role_id,
        created_at,
        created_by,
        admin_roles:role_id(
          role_name
        )
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create admin account" },
        { status: 500 }
      );
    }

    // Transform response to match design document
    const formattedData = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      role: data.admin_roles?.role_name || null,
      created_at: data.created_at,
      created_by: data.created_by,
    };

    return NextResponse.json(formattedData, { status: 201 });
  } catch (error) {
    console.error("Error creating admin account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
