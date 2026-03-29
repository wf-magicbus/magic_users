import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// POST /api/users/[id]/force-password-reset
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify user exists
    const { data: userProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("user_id")
      .eq("user_id", id)
      .single();

    if (fetchError || !userProfile) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // TODO: Implement password reset token generation in auth service
    // This would typically involve:
    // 1. Generating a password reset token
    // 2. Storing it with expiration
    // 3. Sending reset email to user

    return NextResponse.json({
      user_id: id,
      passwordResetRequired: true,
      forcedAt: new Date().toISOString(),
      message: "User will be required to reset their password on next login.",
    });
  } catch (error) {
    console.error("Error forcing password reset:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
