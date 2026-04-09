import { createBrowserClient } from "@supabase/ssr";
const NEXT_PUBLIC_SUPABASE_URL = "https://cyhzdpgmrrmqxzkcmboy.supabase.co";
const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_ZekUhybe8n7XLAxkH_1XXw_HZFa8hNg";

export function createClient() {
  return createBrowserClient(
    NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
