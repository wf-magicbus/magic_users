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
    name: body.name ?? "admin",
    description: body.description ?? "Standard admin access",
    privileges: body.privileges ?? ["users:read", "users:write"],
    updatedAt: new Date().toISOString(),
  });
}
