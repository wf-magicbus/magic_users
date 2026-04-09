import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

// GET /api/policy-roles
// Returns all distinct roles that have policy rows, ordered consistently
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("password_policy")
      .select("role")
      .order("role", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch policy roles" }, { status: 500 });
    }

    const roles = (data ?? []).map((r: { role: string }) => r.role);
    return NextResponse.json(roles);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
