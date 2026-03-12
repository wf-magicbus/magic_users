import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database update
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return NextResponse.json({
    id,
    status: "active",
    enabledAt: new Date().toISOString(),
    message: "User account has been enabled.",
  });
}
