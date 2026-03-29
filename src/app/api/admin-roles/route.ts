import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
// GET /api/admin-roles
export async function GET(_request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch admin roles" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching admin roles:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
