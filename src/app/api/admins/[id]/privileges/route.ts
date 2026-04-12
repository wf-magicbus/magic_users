import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
// GET /api/admins/[id]/privileges
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get admin account with role privileges
    const { data: adminAccount, error: adminError } = await supabase
      .from("admin_accounts")
      .select(`
        id,
        role_id,
        admin_roles:role_id(
          id,
          role_name,
          privileges(
            id,
            privilege_name,
            description
          )
        )
      `)
      .eq("id", id)
      .single();

    if (adminError) {
      console.error("Supabase error:", adminError);
      return NextResponse.json(
        { error: "Failed to fetch admin privileges" },
        { status: 500 }
      );
    }

    if (!adminAccount) {
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 404 }
      );
    }
    const adminRoles = Array.isArray(adminAccount.admin_roles)
      ? adminAccount.admin_roles[0]
      : adminAccount.admin_roles;

    return NextResponse.json({
      id: adminAccount.id,
      role_id: adminAccount.role_id,
      role: adminRoles,
      privileges: adminRoles?.privileges ?? [],
    });
  } catch (error) {
    console.error("Error fetching admin privileges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// PATCH /api/admins/[id]/privileges
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify admin account exists
    const { data: adminAccount, error: fetchError } = await supabase
      .from("admin_accounts")
      .select("id, role_id")
      .eq("id", id)
      .single();

    if (fetchError || !adminAccount) {
      return NextResponse.json(
        { error: "Admin account not found" },
        { status: 404 }
      );
    }

    // Update role_id if provided (which determines privileges through admin_roles)
    if (body.role_id) {
      const { data: updatedAdmin, error: updateError } = await supabase
        .from("admin_accounts")
        .update({ role_id: body.role_id })
        .eq("id", id)
        .select(`
          id,
          role_id,
          admin_roles:role_id(
            id,
            role_name,
            description,
            privileges(
              id,
              privilege_name,
              description
            )
          )
        `)
        .single();

      if (updateError) {
        console.error("Supabase error:", updateError);
        return NextResponse.json(
          { error: "Failed to update admin privileges" },
          { status: 500 }
        );
      }

      const updatedAdminRole = Array.isArray(updatedAdmin.admin_roles)
        ? updatedAdmin.admin_roles[0]
        : updatedAdmin.admin_roles;

      return NextResponse.json({
        id: updatedAdmin.id,
        role_id: updatedAdmin.role_id,
        role: updatedAdminRole,
        privileges: updatedAdminRole?.privileges ?? [],
      });
    }

    // If no role_id provided, return current privileges
    const { data: currentAdmin, error: currentError } = await supabase
      .from("admin_accounts")
      .select(`
        id,
        role_id,
        admin_roles:role_id(
          id,
          role_name,
          description,
          privileges(
            id,
            privilege_name,
            description
          )
        )
      `)
      .eq("id", id)
      .single();

    if (currentError) {
      console.error("Supabase error:", currentError);
      return NextResponse.json(
        { error: "Failed to fetch admin privileges" },
        { status: 500 }
      );
    }

    const currentAdminRole = Array.isArray(currentAdmin.admin_roles)
      ? currentAdmin.admin_roles[0]
      : currentAdmin.admin_roles;

    return NextResponse.json({
      id: currentAdmin.id,
      role_id: currentAdmin.role_id,
      role: currentAdminRole,
      privileges: currentAdminRole?.privileges ?? [],
    });
  } catch (error) {
    console.error("Error updating admin privileges:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
