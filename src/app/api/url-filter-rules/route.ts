import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

// GET /api/url-filter-rules?role=student&rule_type=blocked_url
export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role") ?? "student";
  const rule_type = request.nextUrl.searchParams.get("rule_type");
  try {
    let query = supabaseAdmin
      .from("url_filter_rules")
      .select("*")
      .eq("role", role)
      .order("created_at", { ascending: false });

    if (rule_type) query = query.eq("rule_type", rule_type);

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/url-filter-rules
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { value, rule_type, role, description, target_browser, is_active } = body;
    if (!value || !rule_type || !role) {
      return NextResponse.json({ error: "value, rule_type, and role are required" }, { status: 400 });
    }
    if (role === "super_admin") {
      return NextResponse.json({ error: "super_admin has no URL restrictions" }, { status: 403 });
    }
    const { data, error } = await supabaseAdmin
      .from("url_filter_rules")
      .insert({ value, rule_type, role, description: description || null, target_browser: target_browser || "all", is_active: is_active ?? true })
      .select("*")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
