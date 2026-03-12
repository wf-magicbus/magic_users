import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database update
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    id,
    passwordResetRequired: true,
    forcedAt: new Date().toISOString(),
    message: "User will be required to reset their password on next login.",
  });
}
