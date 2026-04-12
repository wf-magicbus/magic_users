import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase/admin";

// GET /api/roles/infra — returns all admin roles with their infra access flags
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("admin_roles")
      .select("role_name, access_terminal, access_network")
      .eq("is_dedicated_admin", true);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/roles/infra?role=<name>&field=access_terminal|access_network&value=true|false
export async function PATCH(req: Request) {
  try {
    const url = new URL(req.url);
    const role = url.searchParams.get("role");
    const field = url.searchParams.get("field");
    const value = url.searchParams.get("value") === "true";

    if (!role || !field) {
      return NextResponse.json({ error: "role and field required" }, { status: 400 });
    }

    if (field !== "access_terminal" && field !== "access_network") {
      return NextResponse.json({ error: "field must be access_terminal or access_network" }, { status: 400 });
    }

    const { error } = await supabase
      .from("admin_roles")
      .update({ [field]: value })
      .eq("role_name", role);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ role, field, value });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
