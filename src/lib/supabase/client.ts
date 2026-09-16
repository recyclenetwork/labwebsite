import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

const FALLBACK_SUPABASE_URL = "https://ztgwpyoztzpvqnwoixuy.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "sb_publishable_9y2S6BL9Zlfd-qZCr4ui7Q_0h76uko4";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
