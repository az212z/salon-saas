import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

function valueLooksConfigured(value: string | undefined, blocked: string[]) {
  if (!value) return false;
  return !blocked.some((item) => value.includes(item));
}

export function isSupabaseConfigured() {
  return (
    valueLooksConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL, ["example.supabase.co", "your-project", "localhost"]) &&
    valueLooksConfigured(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, ["dummy", "your-anon-key"])
  );
}

export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

let client: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!isSupabaseConfigured()) return null;
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
