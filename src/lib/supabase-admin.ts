import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin: any =
  supabaseUrl && serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey)
    : {
        from: () => ({ select: async () => ({ data: null, error: new Error('Supabase admin not configured') }) }),
        auth: {
          getUser: async () => ({ data: { user: null }, error: new Error('Supabase admin not configured') }),
        },
      };
