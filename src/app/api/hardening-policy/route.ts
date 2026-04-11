import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role");
    let query = supabase.from("hardening_policy").select("*");
    if (role) query = query.eq("role", role);
    else query = query.limit(1);

    const { data, error } = await query.maybeSingle();
    if (error) return NextResponse.json({ error: "Failed to fetch hardening policy" }, { status: 500 });
    return NextResponse.json(data ?? null);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, created_at, updated_at, ...updateFields } = body;
    const role = updateFields.role ?? request.nextUrl.searchParams.get("role");

    if (!role) return NextResponse.json({ error: "role is required" }, { status: 400 });

    const { data: existing } = await supabase.from("hardening_policy").select("id").eq("role", role).maybeSingle();
    let result, error;
    if (existing?.id) {
      ({ data: result, error } = await supabase.from("hardening_policy").update({ ...updateFields, role, updated_at: new Date().toISOString() }).eq("id", existing.id).select("*").maybeSingle());
    } else {
      ({ data: result, error } = await supabase.from("hardening_policy").insert({ ...updateFields, role, updated_at: new Date().toISOString() }).select("*").maybeSingle());
    }

    if (error) return NextResponse.json({ error: "Failed to update hardening policy" }, { status: 500 });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
