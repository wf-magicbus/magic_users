import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";
// GET /api/protected-groups
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("protected_groups")
      .select(`
        id,
        group_name,
        description,
        created_at,
        updated_at
      `)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch protected groups" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching protected groups:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// POST /api/protected-groups
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { group_name, description } = body;

    // Validate required fields
    if (!group_name) {
      return NextResponse.json(
        { error: "Missing required field: group_name" },
        { status: 400 }
      );
    }

    // Check if group name already exists
    const { data: existingGroup } = await supabase
      .from("protected_groups")
      .select("id")
      .eq("group_name", group_name)
      .single();

    if (existingGroup) {
      return NextResponse.json(
        { error: "Protected group with this name already exists" },
        { status: 409 }
      );
    }

    // Create new protected group
    const { data, error } = await supabase
      .from("protected_groups")
      .insert({
        group_name,
        description: description || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        id,
        group_name,
        description,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create protected group" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating protected group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
