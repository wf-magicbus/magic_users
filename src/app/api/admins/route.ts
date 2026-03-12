import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(_request: NextRequest) {
  return NextResponse.json([
    {
      id: "admin-1",
      name: "Alice Johnson",
      email: "alice@example.com",
      role: "super_admin",
      status: "active",
      createdAt: "2025-01-15T10:00:00Z",
    },
    {
      id: "admin-2",
      name: "Bob Smith",
      email: "bob@example.com",
      role: "admin",
      status: "active",
      createdAt: "2025-02-20T14:30:00Z",
    },
  ]);
}

// TODO: Replace with real database insert
export async function POST(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json(
    {
      id: "admin-3",
      ...body,
      status: "active",
      createdAt: new Date().toISOString(),
    },
    { status: 201 }
  );
}
