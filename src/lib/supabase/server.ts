import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function sanitizeEnvValue(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "").replace(/;$/, "");
}

function getRequiredEnvVar(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return sanitizeEnvValue(value);
}

/**
 * Especially important if using Fluid compute: Don't put this client in a
 * global variable. Always create a new client within each function when using
 * it.
 */
const NEXT_PUBLIC_SUPABASE_URL = getRequiredEnvVar(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL"
);
const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = getRequiredEnvVar(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
);

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have proxy refreshing
            // user sessions.
          }
        },
      },
    },
  );
}
