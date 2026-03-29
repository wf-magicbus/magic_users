import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
// GET /api/protected-groups/[id]
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data, error } = await supabase
            .from("protected_groups")
            .select(`
        id,
        group_name,
        description,
        created_at,
        updated_at
      `)
            .eq("id", id)
            .single();

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to fetch protected group" },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Protected group not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching protected group:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

// PATCH /api/protected-groups/[id]
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Build update object with only provided fields
        const updateData: Record<string, any> = {
            updated_at: new Date().toISOString(),
        };

        if (body.group_name !== undefined) updateData.group_name = body.group_name;
        if (body.description !== undefined)
            updateData.description = body.description || null;

        if (
            Object.keys(updateData).length === 1 &&
            updateData.updated_at !== undefined
        ) {
            return NextResponse.json(
                { error: "No fields to update" },
                { status: 400 }
            );
        }

        // Check if new group name already exists (if group_name is being updated)
        if (body.group_name) {
            const { data: existingGroup } = await supabase
                .from("protected_groups")
                .select("id")
                .eq("group_name", body.group_name)
                .neq("id", id)
                .single();

            if (existingGroup) {
                return NextResponse.json(
                    { error: "Protected group with this name already exists" },
                    { status: 409 }
                );
            }
        }

        const { data, error } = await supabase
            .from("protected_groups")
            .update(updateData)
            .eq("id", id)
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
                { error: "Failed to update protected group" },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { error: "Protected group not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating protected group:", error);
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

        // Delete protected group
        const { error } = await supabase
            .from("protected_groups")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase error:", error);
            return NextResponse.json(
                { error: "Failed to delete protected group" },
                { status: 500 }
            );
        }

        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error("Error deleting protected group:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
