import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function valueLooksConfigured(value: string | undefined, blocked: string[]) {
  if (!value) return false;
  return !blocked.some((item) => value.includes(item));
}

export function isSupabaseServiceConfigured() {
  return (
    valueLooksConfigured(process.env.NEXT_PUBLIC_SUPABASE_URL, ["example.supabase.co", "your-project", "localhost"]) &&
    valueLooksConfigured(process.env.SUPABASE_SERVICE_ROLE_KEY, ["dummy", "your-service-role-key", "replace"])
  );
}

export function createServiceClient(): SupabaseClient | null {
  if (!isSupabaseServiceConfigured()) return null;

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
