import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// Without both keys the site runs in demo mode and saves progress in the browser.
export const accountsEnabled = Boolean(url && key);

let client: SupabaseClient | null = null;

// Only used in the browser, where the login session is kept.
export function getSupabase(): SupabaseClient | null {
  if (!accountsEnabled || typeof window === "undefined") return null;
  client ??= createClient(url!, key!);
  return client;
}
