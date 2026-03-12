import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database update
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  return NextResponse.json({
    id,
    name: "Alice Johnson",
    email: "alice@example.com",
    role: body.role ?? "admin",
    privileges: body.privileges ?? ["users:read", "users:write"],
    updatedAt: new Date().toISOString(),
  });
}
