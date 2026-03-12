import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    userId: id,
    entries: [
      {
        id: "log-1",
        timestamp: "2026-03-12T09:00:00Z",
        adminId: "admin-1",
        adminName: "Alice Johnson",
        action: "user.unlock",
        details: "Unlocked user account after failed login attempts",
      },
      {
        id: "log-2",
        timestamp: "2026-03-10T11:20:00Z",
        adminId: "admin-2",
        adminName: "Bob Smith",
        action: "user.privilege.grant",
        details: "Granted reports:export privilege",
      },
    ],
  });
}
