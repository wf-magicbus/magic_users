import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
// GET /api/admin-roles/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Update admin role in Supabase
    const { data, error } = await supabase
      .from("admin_roles")
      .update({
        role_name: body.role_name,
        description: body.description,
        is_dedicated_admin: body.is_dedicated_admin,
        max_members: body.max_members,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update admin role" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Admin role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating admin role:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
