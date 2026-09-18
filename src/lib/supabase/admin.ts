import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export function createAdminClient() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://ztgwpyoztzpvqnwoixuy.supabase.co";

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    "";

  if (!serviceRoleKey) {
    console.warn("SUPABASE_SERVICE_ROLE_KEY is not set in environment.");
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey || "service_role_key_placeholder", {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
