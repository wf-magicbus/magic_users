import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search") ?? "";
  const status = request.nextUrl.searchParams.get("status") ?? "all";
  const page = parseInt(request.nextUrl.searchParams.get("page") ?? "1", 10);
  const limit = parseInt(request.nextUrl.searchParams.get("limit") ?? "20", 10);

  void search;
  void status;

  return NextResponse.json({
    users: [
      {
        id: "user-1",
        name: "Jane Doe",
        email: "jane@example.com",
        status: "active",
        role: "user",
        createdAt: "2025-03-01T08:00:00Z",
        lastLoginAt: "2026-03-10T12:00:00Z",
      },
      {
        id: "user-2",
        name: "John Smith",
        email: "john@example.com",
        status: "locked",
        role: "user",
        createdAt: "2025-04-10T09:30:00Z",
        lastLoginAt: "2026-03-08T16:45:00Z",
      },
    ],
    pagination: {
      page,
      limit,
      total: 42,
      totalPages: Math.ceil(42 / limit),
    },
  });
}
