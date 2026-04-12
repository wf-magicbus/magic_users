import { createClient } from "@supabase/supabase-js";

function sanitizeEnvValue(value: string) {
    return value.trim().replace(/^['"]|['"]$/g, "").replace(/;$/, "");
}

const SUPABASE_URL_RAW = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY_RAW = process.env.SUPABASE_SERVICE_ROLE_KEY;

const SUPABASE_URL = SUPABASE_URL_RAW ? sanitizeEnvValue(SUPABASE_URL_RAW) : undefined;
const SUPABASE_SERVICE_ROLE_KEY = SUPABASE_SERVICE_ROLE_KEY_RAW ? sanitizeEnvValue(SUPABASE_SERVICE_ROLE_KEY_RAW) : undefined;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables");
}

/**
 * Create admin client with service role key for privileged operations
 * This should only be used on the server side
 */
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

/**
 * Create a new user in Supabase Auth and add to user_profiles table
 * @param email - User email address
 * @param password - User password
 * @param userData - Additional user metadata (name, role, etc.)
 * @returns Created user object with profile or error
 */
export async function createUser(
    email: string,
    password: string,
    userData?: {
        name?: string;
        role?: string;
        status?: string;
        [key: string]: any;
    }
) {
    try {
        // Step 1: Create user in Supabase Auth
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false,
            user_metadata: userData || {},
        });

        if (error) {
            throw new Error(`Failed to create user: ${error.message}`);
        }

        const userId = data.user.id;

        // Step 2: Create corresponding profile in user_profiles table
        const { data: profileData, error: profileError } = await supabaseAdmin
            .from("user_profiles")
            .insert([
                {
                    id: userId,
                    email: email,
                    name: userData?.name || "",
                    role: userData?.role || "user",
                    status: userData?.status || "active",
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
            ])
            .select()
            .single();

        if (profileError) {
            console.warn(`Warning: Profile creation failed: ${profileError.message}. User was created but profile record was not added.`);
        }

        return {
            success: true,
            user: data.user,
            profile: profileData || null,
            message: profileError ? "User created but profile creation had issues" : "User and profile created successfully",
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get a single user by ID
 * @param userId - Supabase user ID
 * @returns User object or error
 */
export async function getUserById(userId: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (error) {
            throw new Error(`Failed to get user: ${error.message}`);
        }

        return {
            success: true,
            user: data.user,
        };
    } catch (error) {
        console.error("Error getting user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get a single user by email
 * @param email - User email address
 * @returns User object or error
 */
export async function getUserByEmail(email: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            throw new Error(`Failed to list users: ${error.message}`);
        }

        const user = data.users.find((u) => u.email === email);

        if (!user) {
            return {
                success: false,
                error: "User not found",
            };
        }

        return {
            success: true,
            user,
        };
    } catch (error) {
        console.error("Error getting user by email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get all users with optional pagination
 * @param limit - Maximum number of users to return (default: 100, max: 1000)
 * @param offset - Number of users to skip (for pagination)
 * @returns Array of users or error
 */
export async function getAllUsers(limit: number = 100, offset: number = 0) {
    try {
        // Ensure limits are within Supabase constraints
        const validLimit = Math.min(Math.max(limit, 1), 1000);

        const { data, error } = await supabaseAdmin.auth.admin.listUsers({
            perPage: validLimit,
            page: Math.floor(offset / validLimit) + 1,
        });

        if (error) {
            throw new Error(`Failed to list users: ${error.message}`);
        }

        return {
            success: true,
            users: data.users,
            total: data.total,
        };
    } catch (error) {
        console.error("Error getting users:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Update user information
 * @param userId - Supabase user ID
 * @param updates - Fields to update (email, password, user_metadata, etc.)
 * @returns Updated user object or error
 */
export async function updateUser(
    userId: string,
    updates: {
        email?: string;
        password?: string;
        user_metadata?: Record<string, any>;
        attributes?: Record<string, any>;
    }
) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
            userId,
            updates
        );

        if (error) {
            throw new Error(`Failed to update user: ${error.message}`);
        }

        return {
            success: true,
            user: data.user,
        };
    } catch (error) {
        console.error("Error updating user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Delete a user
 * @param userId - Supabase user ID
 * @param shouldSoftDelete - If true, only deletes auth data (default: false for hard delete)
 * @returns Success status or error
 */
export async function deleteUser(userId: string, shouldSoftDelete: boolean = false) {
    try {
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId, shouldSoftDelete);

        if (error) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }

        return {
            success: true,
            message: "User deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Send password reset email to user
 * @param email - User email address
 * @param redirectTo - URL to redirect to after reset (optional)
 * @returns Success status or error
 */
export async function sendPasswordResetEmail(email: string, redirectTo?: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.generateLink({
            type: "recovery",
            email,
            options: redirectTo ? { redirectTo } : undefined,
        });

        if (error) {
            throw new Error(`Failed to generate reset link: ${error.message}`);
        }

        return {
            success: true,
            data,
        };
    } catch (error) {
        console.error("Error sending reset email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Confirm user email
 * @param userId - Supabase user ID
 * @returns Success status or error
 */
export async function confirmUserEmail(userId: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            email_confirm: true,
        });

        if (error) {
            throw new Error(`Failed to confirm email: ${error.message}`);
        }

        return {
            success: true,
            user: data.user,
        };
    } catch (error) {
        console.error("Error confirming email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Disable/Ban a user account
 * @param userId - Supabase user ID
 * @returns Updated user object or error
 */
export async function disableUser(userId: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            ban_duration: "none",
        });

        if (error) {
            throw new Error(`Failed to disable user: ${error.message}`);
        }

        return {
            success: true,
            user: data.user,
        };
    } catch (error) {
        console.error("Error disabling user:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Search users by various criteria
 * @param query - Search term (email, name, etc.)
 * @returns Array of matching users or error
 */
export async function searchUsers(query: string) {
    try {
        const { data, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            throw new Error(`Failed to list users: ${error.message}`);
        }

        const searchTerm = query.toLowerCase();
        const filteredUsers = data.users.filter(
            (user) =>
                user.email?.toLowerCase().includes(searchTerm) ||
                user.user_metadata?.name?.toLowerCase().includes(searchTerm)
        );

        return {
            success: true,
            users: filteredUsers,
            total: filteredUsers.length,
        };
    } catch (error) {
        console.error("Error searching users:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Get user with their additional profile data from a public profiles table
 * @param userId - Supabase user ID
 * @param tableName - Name of the profiles table (default: 'profiles')
 * @returns User with profile data or error
 */
export async function getUserWithProfile(userId: string, tableName: string = "profiles") {
    try {
        const userResult = await getUserById(userId);

        if (!userResult.success) {
            return userResult;
        }

        const { data: profileData, error: profileError } = await supabaseAdmin
            .from(tableName)
            .select("*")
            .eq("id", userId)
            .single();

        if (profileError && profileError.code !== "PGRST116") {
            // PGRST116 = "not found", which is acceptable
            console.warn(`Warning: Could not fetch profile data: ${profileError.message}`);
        }

        return {
            success: true,
            user: userResult.user,
            profile: profileData || null,
        };
    } catch (error) {
        console.error("Error getting user with profile:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}
