import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    userId: id,
    privileges: [
      { id: "priv-1", name: "dashboard:view", grantedAt: "2025-06-01T10:00:00Z" },
      { id: "priv-2", name: "reports:view", grantedAt: "2025-06-01T10:00:00Z" },
      { id: "priv-3", name: "profile:edit", grantedAt: "2025-06-01T10:00:00Z" },
    ],
  });
}
