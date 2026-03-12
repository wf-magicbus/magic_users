import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    id,
    name: "Jane Doe",
    email: "jane@example.com",
    status: "active",
    role: "user",
    createdAt: "2025-03-01T08:00:00Z",
    lastLoginAt: "2026-03-10T12:00:00Z",
    failedLoginAttempts: 0,
    lockedAt: null,
    passwordChangedAt: "2026-01-15T10:00:00Z",
  });
}
