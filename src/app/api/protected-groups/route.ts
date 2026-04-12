import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  normalizeProtectedGroupMembers,
  serializeProtectedGroups,
  serializeProtectedGroup,
} from "@/lib/protected-groups";

// GET /api/protected-groups
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabaseAdmin
      .from("protected_groups")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch protected groups" },
        { status: 500 }
      );
    }

    return NextResponse.json(await serializeProtectedGroups(data ?? []));
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
    const groupName = typeof body.group_name === "string" ? body.group_name.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const members = normalizeProtectedGroupMembers(body.members);

    // Validate required fields
    if (!groupName) {
      return NextResponse.json(
        { error: "Missing required field: group_name" },
        { status: 400 }
      );
    }

    // Check if group name already exists
    const { data: existingGroup } = await supabaseAdmin
      .from("protected_groups")
      .select("id")
      .eq("group_name", groupName)
      .single();

    if (existingGroup) {
      return NextResponse.json(
        { error: "Protected group with this name already exists" },
        { status: 409 }
      );
    }

    // Create new protected group
    const insertData: Record<string, unknown> = {
      group_name: groupName,
      description: description || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (body.members !== undefined) {
      insertData.members = members;
    }

    const { data, error } = await supabaseAdmin
      .from("protected_groups")
      .insert(insertData)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create protected group" },
        { status: 500 }
      );
    }

    return NextResponse.json(await serializeProtectedGroup(data), { status: 201 });
  } catch (error) {
    console.error("Error creating protected group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
