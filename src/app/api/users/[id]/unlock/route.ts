import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/users/[id]/unlock
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("user_profiles")
      .update({ status: "active" })
      .eq("user_id", id)
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
        { error: "Failed to unlock user" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user_id: data.user_id,
      status: data.status,
      unlocked_at: new Date().toISOString(),
      unlocked_by: "system",
    });
  } catch (error) {
    console.error("Error unlocking user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
