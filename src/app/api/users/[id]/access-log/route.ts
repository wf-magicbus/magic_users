import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";


// GET /api/users/[id]/access-log
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("access_log ")
      .select(`
          user_id,
          action,
          item,
          performed_by ,
          timestamp
        `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch user" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Transform to match design document
    return NextResponse.json({
      user_id: data.user_id,
      action: data.action,
      item: data.item,
      performed_by: data.performed_by,
      timestamp: data.timestamp,
    });
  } catch (error) {
    console.error("Error fetching access log:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

