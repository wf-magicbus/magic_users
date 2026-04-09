import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
// GET /api/lockout-policy
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    // Fetch the singleton lockout policy record
    const { data, error } = await supabase
      .from("account_lockout_policy")
      .select(`
        id,
        lockout_duration_minutes,
        lockout_threshold_attempts,
        reset_counter_after_minutes,
        updated_at,
        updated_by,
        singleton,
        gpo_object_id
      `)
      .eq("singleton", true)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch lockout policy" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Lockout policy not configured" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching lockout policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
// PUT /api/lockout-policy/[id]
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received request body for updating lockout policy:", body);
    // Validate input fields
    const {
      lockout_duration_minutes,
      lockout_threshold_attempts,
      reset_counter_after_minutes,
      updated_by,
    } = body;

    // Validate constraints
    if (lockout_duration_minutes !== undefined && lockout_duration_minutes < 0) {
      return NextResponse.json(
        { error: "lockout_duration_minutes must be >= 0" },
        { status: 400 }
      );
    }

    if (
      lockout_threshold_attempts !== undefined &&
      (lockout_threshold_attempts < 1 || lockout_threshold_attempts > 100)
    ) {
      return NextResponse.json(
        { error: "lockout_threshold_attempts must be between 1 and 100" },
        { status: 400 }
      );
    }

    if (
      reset_counter_after_minutes !== undefined &&
      reset_counter_after_minutes < 1
    ) {
      return NextResponse.json(
        { error: "reset_counter_after_minutes must be >= 1" },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (lockout_duration_minutes !== undefined)
      updateData.lockout_duration_minutes = lockout_duration_minutes;
    if (lockout_threshold_attempts !== undefined)
      updateData.lockout_threshold_attempts = lockout_threshold_attempts;
    if (reset_counter_after_minutes !== undefined)
      updateData.reset_counter_after_minutes = reset_counter_after_minutes;
    if (updated_by !== undefined) updateData.updated_by = updated_by;
    console.log("Update data for lockout policy:", updateData);
    // Update the singleton policy record
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("account_lockout_policy")
      .update(updateData)
      .eq("singleton", true)
      .select(`
        id,
        lockout_duration_minutes,
        lockout_threshold_attempts,
        reset_counter_after_minutes,
        updated_at,
        updated_by,
        singleton,
        gpo_object_id
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update lockout policy" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Lockout policy not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating lockout policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
