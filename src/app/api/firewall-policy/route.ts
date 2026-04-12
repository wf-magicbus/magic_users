import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role");
    let query = supabase.from("firewall_policy").select("*").order("profile", { ascending: true });
    if (role) query = query.eq("role", role);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: "Failed to fetch firewall policy" }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, created_at, updated_at, profile, ...updateFields } = body;
    const role = updateFields.role ?? request.nextUrl.searchParams.get("role");

    if (!profile) return NextResponse.json({ error: "profile is required" }, { status: 400 });
    if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 });

    const { data: existing } = await supabase.from("firewall_policy").select("id").eq("role", role).eq("profile", profile).maybeSingle();
    let result, error;
    if (existing?.id) {
      ({ data: result, error } = await supabase.from("firewall_policy").update({ ...updateFields, profile, role, updated_at: new Date().toISOString() }).eq("id", existing.id).select("*").maybeSingle());
    } else {
      ({ data: result, error } = await supabase.from("firewall_policy").insert({ ...updateFields, profile, role, updated_at: new Date().toISOString() }).select("*").maybeSingle());
    }

    if (error) return NextResponse.json({ error: "Failed to update firewall policy" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
