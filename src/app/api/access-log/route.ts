import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";


export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get("action");
    const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "50", 10);
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("access_log")
      .select("*", { count: "exact" });

    if (action && action !== "all") {
      query = query.eq("action", action);
    }

    query = query.order("timestamp", { ascending: false }).range(offset, offset + limit - 1);

    const { data: entries, count, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const allEntries = entries ?? [];
    const userIds = [...new Set([
      ...allEntries.map((e) => e.user_id),
      ...allEntries.map((e) => e.performed_by),
    ].filter(Boolean))];

    let profileMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("user_profiles")
        .select("user_id, name")
        .in("user_id", userIds);
      (profiles ?? []).forEach((p) => { profileMap[p.user_id] = p.name; });
    }

    const result = allEntries.map((e) => ({
      ...e,
      user_name: profileMap[e.user_id] ?? "Unknown",
      performed_by_name: profileMap[e.performed_by] ?? "Unknown",
    }));

    return NextResponse.json({
      entries: result,
      pagination: { page, limit, total: count ?? 0, totalPages: Math.ceil((count ?? 0) / limit) },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
