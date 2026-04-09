import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

// GET /api/logon-restrictions?role=student
export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");
  try {
    if (role) {
      const { data, error } = await supabaseAdmin
        .from("logon_restrictions")
        .select("*")
        .eq("role", role)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }
    const { data, error } = await supabaseAdmin
      .from("logon_restrictions")
      .select("*")
      .in("role", ["student", "user_admin", "auditor", "super_admin"])
      .order("role");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/logon-restrictions?role=student
export async function PUT(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role");
  if (!role) return NextResponse.json({ error: "role param required" }, { status: 400 });
  if (role === "super_admin") return NextResponse.json({ error: "super_admin policy is protected" }, { status: 403 });
  try {
    const body = await request.json();
    const { id, role: _r, ...fields } = body;
    const { data, error } = await supabaseAdmin
      .from("logon_restrictions")
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq("role", role)
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
