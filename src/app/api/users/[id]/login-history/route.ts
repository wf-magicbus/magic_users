import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/users/[id]/login-history?page=<num>&limit=<num>
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from("login_history")
      .select(`
        id,
        user_id,
        success,
        ip_address,
        device,
        timestamp
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch login history" },
        { status: 500 }
      );
    }


    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching login history:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
