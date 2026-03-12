import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(_request: NextRequest) {
  return NextResponse.json([
    {
      id: "role-1",
      name: "super_admin",
      description: "Full system access",
      privileges: ["*"],
    },
    {
      id: "role-2",
      name: "admin",
      description: "Standard admin access",
      privileges: ["users:read", "users:write", "sessions:read"],
    },
    {
      id: "role-3",
      name: "viewer",
      description: "Read-only access",
      privileges: ["users:read", "sessions:read"],
    },
  ]);
}
