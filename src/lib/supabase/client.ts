import { createBrowserClient } from "@supabase/ssr";

function sanitizeEnvValue(value: string) {
  return value.trim().replace(/^['"]|['"]$/g, "").replace(/;$/, "");
}

function getRequiredEnvVar(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing ${name} environment variable`);
  }

  return sanitizeEnvValue(value);
}

const NEXT_PUBLIC_SUPABASE_URL = getRequiredEnvVar(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  "NEXT_PUBLIC_SUPABASE_URL"
);
const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = getRequiredEnvVar(
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
);

export const supabase = createBrowserClient(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export function createClient() {
  return createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
