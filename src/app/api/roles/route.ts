import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase-admin";

const POLICY_TABLES = [
  "password_policy",
  "lockout_policy",
  "url_filter_rules",
  "endpoint_protection",
  "firewall_policy",
  "hardening_policy",
  "logon_restrictions",
  "removable_storage_policy",
] as const;

// GET /api/roles — returns all roles with their policy assignments
export async function GET() {
  try {
    // Collect all unique roles across all policy tables
    const roleSet = new Set<string>();
    const assignments: Record<string, Record<string, boolean>> = {};

    for (const table of POLICY_TABLES) {
      const { data } = await supabase.from(table).select("role").order("role");
      for (const row of data ?? []) {
        if (row.role) {
          roleSet.add(row.role);
          if (!assignments[row.role]) assignments[row.role] = {};
          assignments[row.role][table] = true;
        }
      }
    }

    const roles = Array.from(roleSet).sort().map((role) => ({
      name: role,
      policies: assignments[role] ?? {},
    }));

    return NextResponse.json({ roles, policyTables: POLICY_TABLES });
  } catch {
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

// POST /api/roles — create a new role by seeding a default row in all policy tables
export async function POST(req: Request) {
  try {
    const { name } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Role name required" }, { status: 400 });
    }
    const role = name.trim().toLowerCase().replace(/\s+/g, "_");

    // Seed a minimal row in password_policy so the role exists
    const { error } = await supabase.from("password_policy").upsert(
      { role, min_password_length: 8, max_password_age_days: 90, min_password_age_days: 1, password_history_depth: 5 },
      { onConflict: "role" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ role });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/roles — remove a role from all policy tables
export async function DELETE(req: Request) {
  try {
    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Role name required" }, { status: 400 });

    for (const table of POLICY_TABLES) {
      await supabase.from(table).delete().eq("role", name);
    }

    return NextResponse.json({ deleted: name });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
