import { NextRequest, NextResponse } from "next/server";

// TODO: Replace with real session termination
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  void id;

  return new NextResponse(null, { status: 204 });
}
