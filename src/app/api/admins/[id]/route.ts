import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// GET /api/admins/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
          id,
          role_name,
          description,
          is_dedicated_admin,
          max_members
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch admin account" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 404 }
      );
    }

    const adminRole = Array.isArray(data.admin_roles)
      ? data.admin_roles[0]
      : data.admin_roles;

    // Transform response to match design document
    const formattedData = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      role: adminRole?.role_name || null,
      created_at: data.created_at,
      created_by: data.created_by,
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error fetching admin account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// PATCH /api/admins/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role_id !== undefined) updateData.role_id = body.role_id;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }
    const supabase = await createClient();
    // Check if new email already exists (if email is being updated)
    if (body.email) {
      const { data: existingAdmin } = await supabase
        .from("admin_accounts")
        .select("id")
        .eq("email", body.email)
        .neq("id", id)
        .single();

      if (existingAdmin) {
        return NextResponse.json(
          { error: "Admin account with this email already exists" },
          { status: 409 }
        );
      }
    }

    const { data, error } = await supabase
      .from("admin_accounts")
      .update(updateData)
      .eq("id", id)
      .select(`
        id,
        user_id,
        name,
        email,
        role_id,
        created_at,
        created_by,
        admin_roles:role_id(
          id,
          role_name,
          description,
          is_dedicated_admin,
          max_members
        )
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update admin account" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 404 }
      );
    }

    const updatedAdminRole = Array.isArray(data.admin_roles)
      ? data.admin_roles[0]
      : data.admin_roles;

    // Transform response to match design document
    const formattedData = {
      id: data.id,
      user_id: data.user_id,
      name: data.name,
      email: data.email,
      role: updatedAdminRole?.role_name || null,
      created_at: data.created_at,
      created_by: data.created_by,
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error("Error updating admin account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// PATCH /api/admins/[id]/privileges
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    // Delete admin account
    const { error } = await supabase
      .from("admin_accounts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete admin account" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting admin account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
