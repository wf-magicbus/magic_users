import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/access-log?action=<action>&page=<num>&limit=<num>
export async function GET(request: NextRequest) {
  try {
    const action = request.nextUrl.searchParams.get("action");
    const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
    const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from("access_log")
      .select("*", { count: "exact" });

    // Filter by action if provided and not "all"
    if (action && action !== "all") {
      query = query.eq("action", action);
    }

    // Add pagination
    query = query.order("timestamp", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch access logs" },
        { status: 500 }
      );
    }

    const total = count ?? 0;
    const entries = data ?? [];

    return NextResponse.json({
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching access logs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
