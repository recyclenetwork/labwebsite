import { createClient } from "@/lib/supabase/server";
import { DEFAULT_LANDING_DATA, sanitizeLandingData, deepMerge, LandingContentData } from "./landing-store";

/**
 * Server-side loader for Homepage / Landing Content
 * Reads directly from Supabase site_settings table on SSR to guarantee
 * consistent, zero-flicker rendering across all browsers, devices, and sessions.
 */
export async function getLandingDataServer(): Promise<LandingContentData> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "landing_content")
      .maybeSingle();

    if (!error && data?.value && typeof data.value === "object") {
      return sanitizeLandingData(deepMerge(DEFAULT_LANDING_DATA, data.value));
    }
  } catch (err) {
    // Fallback gracefully to DEFAULT_LANDING_DATA
  }

  return DEFAULT_LANDING_DATA;
}
