import { createClient } from "@/lib/supabase/server";
import { DEFAULT_GALLERY_ITEMS, GalleryItem } from "./gallery-store";

/**
 * Server-side loader for Gallery / Media Showcase Items
 * Reads directly from Supabase gallery_events table on SSR to guarantee
 * consistent, zero-flicker rendering across all browsers, devices, and sessions.
 */
export async function getGalleryItemsServer(): Promise<GalleryItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("gallery_events")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: String(d.id),
        title: d.title || "",
        category: d.category || "Field Expedition",
        location: d.location || "",
        date_text: d.date_text || "",
        description: d.description || "",
        image_url: d.image_url || "",
        badge_color: d.badge_color || undefined,
      }));
    }
  } catch (err) {
    console.warn("Failed to load gallery items on server:", err);
  }

  return DEFAULT_GALLERY_ITEMS;
}
