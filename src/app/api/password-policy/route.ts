import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// GET /api/password-policy?role=<role>
export async function GET(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role");

    // If role is specified, fetch that specific policy
    if (role) {
      const { data, error } = await supabase
        .from("password_policy")
        .select(`
          id,
          role,
          min_password_length,
          require_uppercase,
          require_lowercase,
          require_digit,
          require_special_char,
          password_history_depth,
          max_password_age_days,
          min_password_age_days,
          store_reversible_encryption,
          updated_at,
          updated_by,
          gpo_object_id
        `)
        .eq("role", role)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        return NextResponse.json(
          { error },
          { status: 500 }
        );
      }

      if (!data) {
        return NextResponse.json(
          { error: "Password policy not found for this role" },
          { status: 404 }
        );
      }

      return NextResponse.json(data);
    }

    // If no role specified, fetch all policies
    const { data, error } = await supabase
      .from("password_policy")
      .select(`
        id,
        role,
        min_password_length,
        require_uppercase,
        require_lowercase,
        require_digit,
        require_special_char,
        password_history_depth,
        max_password_age_days,
        min_password_age_days,
        store_reversible_encryption,
        updated_at,
        updated_by,
        gpo_object_id
      `)
      .order("role", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to fetch password policies" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error("Error fetching password policies:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/password-policy
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      role,
      min_password_length,
      require_uppercase,
      require_lowercase,
      require_digit,
      require_special_char,
      password_history_depth,
      max_password_age_days,
      min_password_age_days,
      store_reversible_encryption,
      updated_by,
    } = body;

    // Validate required fields
    if (!role) {
      return NextResponse.json(
        { error: "Missing required field: role" },
        { status: 400 }
      );
    }

    // Validate constraints
    if (
      min_password_length !== undefined &&
      (min_password_length < 4 || min_password_length > 128)
    ) {
      return NextResponse.json(
        { error: "min_password_length must be between 4 and 128" },
        { status: 400 }
      );
    }

    if (
      password_history_depth !== undefined &&
      (password_history_depth < 0 || password_history_depth > 50)
    ) {
      return NextResponse.json(
        { error: "password_history_depth must be between 0 and 50" },
        { status: 400 }
      );
    }

    if (
      min_password_age_days !== undefined &&
      min_password_age_days < 0
    ) {
      return NextResponse.json(
        { error: "min_password_age_days must be >= 0" },
        { status: 400 }
      );
    }

    if (
      max_password_age_days !== undefined &&
      max_password_age_days < 0
    ) {
      return NextResponse.json(
        { error: "max_password_age_days must be >= 0" },
        { status: 400 }
      );
    }

    if (
      store_reversible_encryption !== undefined &&
      store_reversible_encryption !== false
    ) {
      return NextResponse.json(
        { error: "store_reversible_encryption must be false" },
        { status: 400 }
      );
    }

    // Check if policy already exists for this role
    const { data: existingPolicy } = await supabase
      .from("password_policy")
      .select("id")
      .eq("role", role)
      .single();

    if (existingPolicy) {
      return NextResponse.json(
        { error: "Password policy already exists for this role" },
        { status: 409 }
      );
    }

    // Create new policy
    const { data, error } = await supabase
      .from("password_policy")
      .insert({
        role,
        min_password_length: min_password_length ?? 12,
        require_uppercase: require_uppercase ?? true,
        require_lowercase: require_lowercase ?? true,
        require_digit: require_digit ?? true,
        require_special_char: require_special_char ?? true,
        password_history_depth: password_history_depth ?? 5,
        max_password_age_days: max_password_age_days ?? 90,
        min_password_age_days: min_password_age_days ?? 1,
        store_reversible_encryption: store_reversible_encryption ?? false,
        updated_by: updated_by || null,
        updated_at: new Date().toISOString(),
      })
      .select(`
        id,
        role,
        min_password_length,
        require_uppercase,
        require_lowercase,
        require_digit,
        require_special_char,
        password_history_depth,
        max_password_age_days,
        min_password_age_days,
        store_reversible_encryption,
        updated_at,
        updated_by,
        gpo_object_id
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create password policy" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating password policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/password-policy
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: "Missing required field: role" },
        { status: 400 }
      );
    }

    // Validate constraints
    if (
      body.min_password_length !== undefined &&
      (body.min_password_length < 4 || body.min_password_length > 128)
    ) {
      return NextResponse.json(
        { error: "min_password_length must be between 4 and 128" },
        { status: 400 }
      );
    }

    if (
      body.password_history_depth !== undefined &&
      (body.password_history_depth < 0 || body.password_history_depth > 50)
    ) {
      return NextResponse.json(
        { error: "password_history_depth must be between 0 and 50" },
        { status: 400 }
      );
    }

    if (
      body.min_password_age_days !== undefined &&
      body.min_password_age_days < 0
    ) {
      return NextResponse.json(
        { error: "min_password_age_days must be >= 0" },
        { status: 400 }
      );
    }

    if (
      body.max_password_age_days !== undefined &&
      body.max_password_age_days < 0
    ) {
      return NextResponse.json(
        { error: "max_password_age_days must be >= 0" },
        { status: 400 }
      );
    }

    if (
      body.store_reversible_encryption !== undefined &&
      body.store_reversible_encryption !== false
    ) {
      return NextResponse.json(
        { error: "store_reversible_encryption must be false" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.min_password_length !== undefined)
      updateData.min_password_length = body.min_password_length;
    if (body.require_uppercase !== undefined)
      updateData.require_uppercase = body.require_uppercase;
    if (body.require_lowercase !== undefined)
      updateData.require_lowercase = body.require_lowercase;
    if (body.require_digit !== undefined)
      updateData.require_digit = body.require_digit;
    if (body.require_special_char !== undefined)
      updateData.require_special_char = body.require_special_char;
    if (body.password_history_depth !== undefined)
      updateData.password_history_depth = body.password_history_depth;
    if (body.max_password_age_days !== undefined)
      updateData.max_password_age_days = body.max_password_age_days;
    if (body.min_password_age_days !== undefined)
      updateData.min_password_age_days = body.min_password_age_days;
    if (body.store_reversible_encryption !== undefined)
      updateData.store_reversible_encryption = body.store_reversible_encryption;
    if (body.updated_by !== undefined) updateData.updated_by = body.updated_by;

    // Update policy
    const { data, error } = await supabase
      .from("password_policy")
      .update(updateData)
      .eq("role", role)
      .select(`
        id,
        role,
        min_password_length,
        require_uppercase,
        require_lowercase,
        require_digit,
        require_special_char,
        password_history_depth,
        max_password_age_days,
        min_password_age_days,
        store_reversible_encryption,
        updated_at,
        updated_by,
        gpo_object_id
      `)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to update password policy" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Password policy not found for this role" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating password policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/password-policy?role=<role>
export async function DELETE(request: NextRequest) {
  try {
    const role = request.nextUrl.searchParams.get("role");

    if (!role) {
      return NextResponse.json(
        { error: "Missing required query parameter: role" },
        { status: 400 }
      );
    }

    // Check if policy exists before deleting
    const { data: existingPolicy } = await supabase
      .from("password_policy")
      .select("id")
      .eq("role", role)
      .single();

    if (!existingPolicy) {
      return NextResponse.json(
        { error: "Password policy not found for this role" },
        { status: 404 }
      );
    }

    // Delete the policy
    const { error } = await supabase
      .from("password_policy")
      .delete()
      .eq("role", role);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to delete password policy" },
        { status: 500 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting password policy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
