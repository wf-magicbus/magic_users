import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real database query
export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get("role") ?? "user";

  return NextResponse.json({
    role,
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAgeDays: 90,
    historyCount: 5,
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
