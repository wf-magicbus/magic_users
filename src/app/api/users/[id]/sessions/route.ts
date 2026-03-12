import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json([
    {
      id: "session-1",
      userId: id,
      ipAddress: "192.168.1.10",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      createdAt: "2026-03-12T08:00:00Z",
      lastActiveAt: "2026-03-12T09:30:00Z",
    },
  ]);
}
