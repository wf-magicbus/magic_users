import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function GET(_request: NextRequest) {
  try {
    const { data: sessions, error } = await supabaseAdmin
      .from("user_sessions")
      .select("id, user_id, ip_address, device, location, started_at, is_active")
      .eq("is_active", true)
      .order("started_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const userIds = [...new Set((sessions ?? []).map((s) => s.user_id))];
    let profileMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("user_profiles")
        .select("user_id, name")
        .in("user_id", userIds);
      (profiles ?? []).forEach((p) => { profileMap[p.user_id] = p.name; });
    }

    const result = (sessions ?? []).map((s) => ({
      ...s,
      user_name: profileMap[s.user_id] ?? "Unknown",
    }));

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
