import { ProjectResearchArea } from "@/lib/projects/types";
import { SEED_RESEARCH_AREAS } from "@/lib/projects/seed-data";
import { createClient } from "@/lib/supabase/client";

const LOCAL_STORAGE_KEY = "lab_research_areas_custom";

/**
 * Generate URL-friendly slug
 */
export function generateAreaSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get all combined research areas (Seed + Custom from LocalStorage or Supabase)
 */
export function getAllResearchAreas(): ProjectResearchArea[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const customList: ProjectResearchArea[] = JSON.parse(raw);
    return Array.isArray(customList) ? customList : [];
  } catch {
    return [];
  }
}

/**
 * Create a new thematic research area
 */
export async function createResearchArea(
  title: string,
  description?: string,
  icon_name?: string
): Promise<ProjectResearchArea> {
  const cleanTitle = title.trim();
  const slug = generateAreaSlug(cleanTitle);
  const id = `area-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const newArea: ProjectResearchArea = {
    id,
    title: cleanTitle,
    slug,
    description: description?.trim() || `Investigation and scientific methodologies in ${cleanTitle}.`,
    icon_name: icon_name || "FlaskConical",
  };

  // Attempt Supabase insert if table exists
  try {
    const supabase = createClient();
    await (supabase as any).from("research_areas").insert([newArea]);
  } catch (err) {
    console.warn("Supabase research area insert fallback to local store:", err);
  }

  // Save to local storage
  if (typeof window !== "undefined") {
    try {
      const current = getAllResearchAreas();
      const customOnly = current.filter((a) => a.id.startsWith("area-custom-") || !SEED_RESEARCH_AREAS.some((s) => s.id === a.id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([...customOnly, newArea]));
      window.dispatchEvent(new CustomEvent("lab_research_areas_updated"));
    } catch (e) {
      console.error("Failed to save research area locally", e);
    }
  }

  return newArea;
}

/**
 * Update an existing research area (title, description, icon)
 */
export async function updateResearchArea(
  id: string,
  updates: Partial<ProjectResearchArea>
): Promise<ProjectResearchArea | null> {
  const current = getAllResearchAreas();
  const target = current.find((a) => a.id === id);
  if (!target) return null;

  const updated: ProjectResearchArea = {
    ...target,
    ...updates,
    slug: updates.title ? generateAreaSlug(updates.title) : target.slug,
  };

  // Attempt Supabase update
  try {
    const supabase = createClient();
    await (supabase as any).from("research_areas").update(updated).eq("id", id);
  } catch (err) {
    console.warn("Supabase research area update fallback to local store:", err);
  }

  // Update in localStorage
  if (typeof window !== "undefined") {
    try {
      const allCustom = current.filter(
        (a) => a.id.startsWith("area-custom-") || !SEED_RESEARCH_AREAS.some((s) => s.id === a.id)
      );
      const isCustom = allCustom.some((a) => a.id === id);
      let newCustomList: ProjectResearchArea[];
      if (isCustom) {
        newCustomList = allCustom.map((a) => (a.id === id ? updated : a));
      } else {
        newCustomList = [...allCustom, updated];
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCustomList));
      window.dispatchEvent(new CustomEvent("lab_research_areas_updated"));
    } catch (e) {
      console.error("Failed to update research area locally", e);
    }
  }

  return updated;
}

/**
 * Delete a custom research area
 */
export async function deleteResearchArea(id: string): Promise<boolean> {
  // Attempt Supabase delete
  try {
    const supabase = createClient();
    await (supabase as any).from("research_areas").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase research area delete fallback to local store:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const current = getAllResearchAreas();
      const newCustomList = current
        .filter((a) => a.id !== id)
        .filter((a) => a.id.startsWith("area-custom-") || !SEED_RESEARCH_AREAS.some((s) => s.id === a.id));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCustomList));
      window.dispatchEvent(new CustomEvent("lab_research_areas_updated"));
    } catch (e) {
      console.error("Failed to delete research area locally", e);
    }
  }

  return true;
}
