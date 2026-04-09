import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PUT /api/password-policy/[id]
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await request.json();
        console.log(`Updating password policy with ID: ${id}`, body);

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

        console.log("Update data for password policy:", updateData);

        const supabase = await createClient();
        // Update policy by ID
        const { data, error } = await supabase
            .from("password_policy")
            .update(updateData)
            .eq("id", id)
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
                { error: "Password policy not found" },
                { status: 404 }
            );
        }

        console.log("Successfully updated password policy:", data);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Error updating password policy:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
