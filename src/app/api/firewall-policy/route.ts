import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("firewall_policy")
      .select("*")
      .order("profile", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to fetch firewall policy" }, { status: 500 });
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching firewall policy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile, id, created_at, ...updateFields } = body;

    if (!profile) {
      return NextResponse.json({ error: "profile is required" }, { status: 400 });
    }

    const updateData = {
      ...updateFields,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("firewall_policy")
      .update(updateData)
      .eq("profile", profile)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: "Failed to update firewall policy" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating firewall policy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
