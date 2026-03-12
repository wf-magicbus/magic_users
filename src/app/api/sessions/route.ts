import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(_request: NextRequest) {
  return NextResponse.json([
    {
      id: "session-1",
      userId: "user-1",
      userName: "Jane Doe",
      ipAddress: "192.168.1.10",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      createdAt: "2026-03-12T08:00:00Z",
      lastActiveAt: "2026-03-12T09:30:00Z",
    },
    {
      id: "session-2",
      userId: "user-2",
      userName: "John Smith",
      ipAddress: "10.0.0.42",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      createdAt: "2026-03-12T07:15:00Z",
      lastActiveAt: "2026-03-12T09:25:00Z",
    },
  ]);
}
