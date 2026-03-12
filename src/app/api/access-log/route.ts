import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(request: NextRequest) {
  const action = request.nextUrl.searchParams.get("action") ?? "all";
  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);

  void action;

  return NextResponse.json({
    entries: [
      {
        id: "log-1",
        timestamp: "2026-03-12T09:00:00Z",
        adminId: "admin-1",
        adminName: "Alice Johnson",
        action: "user.unlock",
        targetUserId: "user-2",
        targetUserName: "John Smith",
        details: "Unlocked user account after failed login attempts",
      },
      {
        id: "log-2",
        timestamp: "2026-03-12T08:45:00Z",
        adminId: "admin-1",
        adminName: "Alice Johnson",
        action: "password_policy.update",
        targetUserId: null,
        targetUserName: null,
        details: "Updated minimum password length from 8 to 12",
      },
      {
        id: "log-3",
        timestamp: "2026-03-11T16:30:00Z",
        adminId: "admin-2",
        adminName: "Bob Smith",
        action: "user.disable",
        targetUserId: "user-5",
        targetUserName: "Eve Williams",
        details: "Disabled user account due to policy violation",
      },
    ],
    pagination: {
      page,
      limit,
      total: 150,
      totalPages: Math.ceil(150 / limit),
    },
  });
}
