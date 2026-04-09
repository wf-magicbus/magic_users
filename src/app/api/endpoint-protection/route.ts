import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("endpoint_protection")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch endpoint protection" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching endpoint protection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, created_at, ...updateFields } = body;

    const updateData = {
      ...updateFields,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("endpoint_protection")
      .update(updateData)
      .not("id", "is", null)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to update endpoint protection" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating endpoint protection:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
