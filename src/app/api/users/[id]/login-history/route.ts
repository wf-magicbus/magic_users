import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);

  return NextResponse.json({
    userId: id,
    entries: [
      {
        id: "login-1",
        timestamp: "2026-03-12T08:00:00Z",
        ipAddress: "192.168.1.10",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        success: true,
      },
      {
        id: "login-2",
        timestamp: "2026-03-11T22:15:00Z",
        ipAddress: "192.168.1.10",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        success: true,
      },
      {
        id: "login-3",
        timestamp: "2026-03-10T14:30:00Z",
        ipAddress: "203.0.113.50",
        userAgent: "Mozilla/5.0 (Linux; Android 13)",
        success: false,
        failureReason: "Invalid password",
      },
    ],
    pagination: {
      page,
      limit,
      total: 25,
      totalPages: Math.ceil(25 / limit),
    },
  });
}
