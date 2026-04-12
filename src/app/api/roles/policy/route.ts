import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

// GET /api/roles/policy?role=X&table=Y — fetch existing config for a role+policy
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const table = searchParams.get("table");

  if (!role || !table) {
    return NextResponse.json({ error: "role and table required" }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("role", role)
      .limit(10);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
