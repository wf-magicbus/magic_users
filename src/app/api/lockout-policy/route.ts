import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(_request: NextRequest) {
  return NextResponse.json({
    maxAttempts: 5,
    lockoutDurationMinutes: 30,
    resetAttemptsAfterMinutes: 15,
    notifyAdmin: true,
  });
}

// TODO: Replace with real database update
export async function PUT(request: NextRequest) {
  const body = await request.json();

  return NextResponse.json({
    ...body,
    updatedAt: new Date().toISOString(),
  });
}
