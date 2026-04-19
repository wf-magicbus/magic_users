import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Create a real Supabase client when env vars are available. Otherwise export
// a lightweight stub that prevents module-evaluation crashes during local
// development or when Supabase credentials live in another repository.
export const supabase: any =
	supabaseUrl && supabaseAnonKey
		? createClient(supabaseUrl, supabaseAnonKey)
		: {
				auth: {
					getSession: async () => ({ data: { session: null } }),
					getUser: async () => ({ data: { user: null } }),
					signOut: async () => ({ error: null }),
				},
			};
