import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(_request: NextRequest) {
  return NextResponse.json([
    {
      id: "group-1",
      name: "System Administrators",
      description: "Core system admin accounts that cannot be deleted",
      memberCount: 3,
    },
    {
      id: "group-2",
      name: "Service Accounts",
      description: "Automated service accounts",
      memberCount: 5,
    },
  ]);
}
