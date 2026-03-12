import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database update
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  return NextResponse.json({
    userId: id,
    revoked: body.privileges ?? ["reports:export"],
    revokedAt: new Date().toISOString(),
    message: "Privileges have been revoked.",
  });
}
