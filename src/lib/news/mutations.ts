import { createClient } from "@/lib/supabase/client";
import { adminMutate } from "@/lib/supabase/admin-mutate";
import { NewsArticle, NewsFormData } from "./types";
import { getLocalNews, saveLocalNews } from "./queries";
import { getAllResearchAreas } from "@/lib/research-areas/store";

/**
 * Clean URL-safe slug generator
 */
export function generateNewsSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Estimate reading time in minutes based on word count
 */
export function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 180));
}

/**
 * Helper to log admin activity
 */
async function logNewsActivity(action: string, newsId: string, details?: Record<string, any>) {
  try {
    const supabase = createClient();
    await (supabase as any).from("admin_activity").insert([
      {
        action,
        resource_type: "news",
        resource_id: newsId,
        details: details || {},
        created_at: new Date().toISOString(),
      },
    ]);
  } catch {
    // non-blocking
  }
}

/**
 * Create a new article
 */
export async function createNewsArticle(
  formData: NewsFormData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const newId = formData.id || "news-" + Date.now();
  const slug = formData.slug?.trim() || generateNewsSlug(formData.title);
  const readTime =
    formData.read_time_minutes && Number(formData.read_time_minutes) > 0
      ? Number(formData.read_time_minutes)
      : estimateReadTime(formData.content || formData.summary || "");

  const tagsArray = Array.isArray(formData.tags)
    ? formData.tags
    : typeof formData.tags === "string" && formData.tags.trim()
    ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const allAreas = getAllResearchAreas();
  const matchedAreas = allAreas.filter((a) => formData.research_area_ids?.includes(a.id));
  const matchedProjects: { id: string; title: string; slug: string }[] = [];

  const payload: any = {
    id: newId,
    title: formData.title,
    slug,
    summary: formData.summary,
    content: formData.content || "",
    category: formData.category || "lab_update",
    cover_image_url: formData.cover_image_url || null,
    image_caption: formData.image_caption || null,
    image_credit: formData.image_credit || null,
    author_name: formData.author_name || "Lab Editorial Team",
    author_role: formData.author_role || null,
    author_avatar: formData.author_avatar || null,
    published_at: formData.published_at || new Date().toISOString().split("T")[0],
    read_time_minutes: readTime,
    is_featured: formData.is_featured,
    is_published: formData.is_published,
    display_order: formData.display_order ?? 0,
    tags: tagsArray,
  };

  // Supabase insert attempt via server mutation (bypasses RLS)
  try {
    const res = await adminMutate("news", "create", { newsPayload: payload });
    if (res?.data?.id) {
      payload.id = res.data.id;
    }
    await logNewsActivity("News article created", payload.id, { title: payload.title });
  } catch (err) {
    console.warn("Supabase news insert failed:", err);
  }

  // Local store update
  const fullArticle: NewsArticle = {
    ...payload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    research_areas: matchedAreas,
    projects: matchedProjects.map((p) => ({ id: p.id, title: p.title, slug: p.slug })),
  };

  const currentList = getLocalNews();
  saveLocalNews([fullArticle, ...currentList.filter((n) => n.id !== newId)]);

  return { success: true, id: newId };
}

/**
 * Update an existing article
 */
export async function updateNewsArticle(
  id: string,
  formData: NewsFormData
): Promise<{ success: boolean; error?: string }> {
  const slug = formData.slug?.trim() || generateNewsSlug(formData.title);
  const readTime =
    formData.read_time_minutes && Number(formData.read_time_minutes) > 0
      ? Number(formData.read_time_minutes)
      : estimateReadTime(formData.content || formData.summary || "");

  const tagsArray = Array.isArray(formData.tags)
    ? formData.tags
    : typeof formData.tags === "string" && formData.tags.trim()
    ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  const payload: any = {
    title: formData.title,
    slug,
    summary: formData.summary,
    content: formData.content || "",
    category: formData.category || "lab_update",
    cover_image_url: formData.cover_image_url || null,
    image_caption: formData.image_caption || null,
    image_credit: formData.image_credit || null,
    author_name: formData.author_name || "Lab Editorial Team",
    author_role: formData.author_role || null,
    author_avatar: formData.author_avatar || null,
    published_at: formData.published_at || new Date().toISOString().split("T")[0],
    read_time_minutes: readTime,
    is_featured: formData.is_featured,
    is_published: formData.is_published,
    display_order: formData.display_order ?? 0,
    tags: tagsArray,
    updated_at: new Date().toISOString(),
  };

  // Supabase update attempt via server mutation (bypasses RLS)
  try {
    await adminMutate("news", "update", { newsPayload: payload }, id);
    await logNewsActivity("News article updated", id, { title: formData.title });
  } catch (err) {
    console.warn("Supabase news update failed:", err);
  }

  // Local storage update
  const currentList = getLocalNews();
  const existing = currentList.find((n) => n.id === id);
  const allAreas = getAllResearchAreas();
  const matchedAreas = formData.research_area_ids?.length
    ? allAreas.filter((a) => formData.research_area_ids?.includes(a.id))
    : existing?.research_areas || [];
  const matchedProjects = existing?.projects || [];

  const updatedList = currentList.map((n) => {
    if (n.id === id) {
      return {
        ...n,
        ...payload,
        research_areas: matchedAreas,
        projects: matchedProjects,
      };
    }
    return n;
  });

  saveLocalNews(updatedList);
  return { success: true };
}

/**
 * Delete an article
 */
export async function deleteNewsArticle(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminMutate("news", "delete", undefined, id);
    await logNewsActivity("News article deleted", id);
  } catch (err) {
    console.warn("Supabase news delete failed:", err);
  }

  const currentList = getLocalNews();
  saveLocalNews(currentList.filter((n) => n.id !== id));
  return { success: true };
}

/**
 * Toggle featured state
 */
export async function toggleNewsFeatured(id: string, is_featured: boolean): Promise<boolean> {
  try {
    await adminMutate("news", "toggle_featured", { is_featured }, id);
  } catch {
    // ignore
  }

  const currentList = getLocalNews();
  const updated = currentList.map((n) => (n.id === id ? { ...n, is_featured } : n));
  saveLocalNews(updated);
  return true;
}

/**
 * Toggle published state
 */
export async function toggleNewsPublished(id: string, is_published: boolean): Promise<boolean> {
  try {
    await adminMutate("news", "toggle_publish", { is_published }, id);
  } catch {
    // ignore
  }

  const currentList = getLocalNews();
  const updated = currentList.map((n) => (n.id === id ? { ...n, is_published } : n));
  saveLocalNews(updated);
  return true;
}
