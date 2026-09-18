import { createClient } from "@/lib/supabase/client";
import { adminMutate } from "@/lib/supabase/admin-mutate";
import { PublicationWithRelations, PublicationFormData } from "./types";
import { getLocalPublications, saveLocalPublications } from "./queries";
import { getAllResearchAreas } from "@/lib/research-areas/store";

/**
 * Generate clean URL-safe slug from title
 */
export function generatePublicationSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Helper to log admin activity
 */
async function logPublicationActivity(action: string, publicationId: string, details?: Record<string, any>) {
  try {
    const supabase = createClient();
    await (supabase as any).from("admin_activity").insert([
      {
        action,
        resource_type: "publication",
        resource_id: publicationId,
        details: details || {},
        created_at: new Date().toISOString(),
      },
    ]);
  } catch {
    // Non-blocking log failure
  }
}

/**
 * Format DOI to clean standard and build direct DOI URL
 */
export function formatDoi(inputDoi?: string): { doi: string | null; doi_url: string | null } {
  if (!inputDoi || !inputDoi.trim()) return { doi: null, doi_url: null };
  let cleaned = inputDoi.trim();
  if (cleaned.startsWith("https://doi.org/")) {
    cleaned = cleaned.replace("https://doi.org/", "");
  } else if (cleaned.startsWith("http://doi.org/")) {
    cleaned = cleaned.replace("http://doi.org/", "");
  } else if (cleaned.startsWith("doi:")) {
    cleaned = cleaned.replace("doi:", "").trim();
  }
  return {
    doi: cleaned,
    doi_url: `https://doi.org/${cleaned}`,
  };
}

/**
 * Create a new publication
 */
export async function createPublication(formData: PublicationFormData): Promise<{ success: boolean; id?: string; error?: string }> {
  let newId = formData.id || "pub-" + Date.now();
  const slug = formData.slug?.trim() || generatePublicationSlug(formData.title);
  const { doi, doi_url } = formatDoi(formData.doi);

  const publicationPayload: any = {
    id: newId,
    title: formData.title,
    slug,
    abstract: formData.abstract || "",
    publication_type: formData.publication_type || "journal_article",
    journal: formData.journal,
    volume: formData.volume || null,
    issue: formData.issue || null,
    pages: formData.pages || null,
    publication_year: Number(formData.publication_year) || new Date().getFullYear(),
    publication_date: formData.publication_date || null,
    doi,
    doi_url,
    pdf_url: formData.pdf_url || null,
    external_url: formData.external_url || null,
    impact_factor: formData.impact_factor ? parseFloat(formData.impact_factor) : null,
    citation_count: formData.citation_count ? parseInt(formData.citation_count, 10) : 0,
    quartile: formData.quartile || (formData.impact_factor && parseFloat(formData.impact_factor) >= 6 ? "Q1" : "Q2"),
    is_featured: formData.is_featured,
    is_published: formData.is_published,
    display_order: formData.display_order ?? 0,
    authors_text: formData.authors_text || "",
    bibtex: formData.bibtex || null,
  };

  // Attempt remote Supabase insert via server mutation (bypasses RLS)
  try {
    const res = await adminMutate("publication", "create", { publicationPayload });
    if (res?.data?.id) {
      newId = res.data.id;
    }
    await logPublicationActivity("Publication created", newId, { title: publicationPayload.title, doi: publicationPayload.doi });
  } catch (err) {
    console.warn("Supabase publication insert failed:", err);
  }

  // Update local memory and localStorage store
  const allAreas = getAllResearchAreas();
  const matchedAreas = allAreas.filter((a) => formData.research_area_ids?.includes(a.id));
  const fullPub: PublicationWithRelations = {
    id: newId,
    ...publicationPayload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    authors: [
      { name: "Lab Researchers", is_lab_member: true, is_corresponding: true, display_order: 1 },
    ],
    research_areas: matchedAreas,
    projects: [],
  };

  const currentList = getLocalPublications();
  saveLocalPublications([fullPub, ...currentList.filter((p) => p.id !== newId)]);

  return { success: true, id: newId };
}

/**
 * Update an existing publication
 */
export async function updatePublication(
  id: string,
  formData: PublicationFormData
): Promise<{ success: boolean; error?: string }> {
  const slug = formData.slug?.trim() || generatePublicationSlug(formData.title);
  const { doi, doi_url } = formatDoi(formData.doi);

  const publicationPayload: any = {
    title: formData.title,
    slug,
    abstract: formData.abstract || "",
    publication_type: formData.publication_type || "journal_article",
    journal: formData.journal,
    volume: formData.volume || null,
    issue: formData.issue || null,
    pages: formData.pages || null,
    publication_year: Number(formData.publication_year) || new Date().getFullYear(),
    publication_date: formData.publication_date || null,
    doi,
    doi_url,
    pdf_url: formData.pdf_url || null,
    external_url: formData.external_url || null,
    impact_factor: formData.impact_factor ? parseFloat(formData.impact_factor) : null,
    citation_count: formData.citation_count ? parseInt(formData.citation_count, 10) : 0,
    quartile: formData.quartile || (formData.impact_factor && parseFloat(formData.impact_factor) >= 6 ? "Q1" : "Q2"),
    is_featured: formData.is_featured,
    is_published: formData.is_published,
    display_order: formData.display_order ?? 0,
    authors_text: formData.authors_text || "",
    bibtex: formData.bibtex || null,
    updated_at: new Date().toISOString(),
  };

  // Attempt remote Supabase update via server mutation (bypasses RLS)
  try {
    await adminMutate("publication", "update", { publicationPayload }, id);
    await logPublicationActivity("Publication updated", id, { title: formData.title });
  } catch (err) {
    console.warn("Supabase publication update failed:", err);
  }

  // Update local storage
  const currentList = getLocalPublications();
  const existing = currentList.find((p) => p.id === id);
  const allAreas = getAllResearchAreas();
  const matchedAreas = formData.research_area_ids?.length
    ? allAreas.filter((a) => formData.research_area_ids?.includes(a.id))
    : existing?.research_areas || [];

  const updatedList = currentList.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        ...publicationPayload,
        research_areas: matchedAreas,
        projects: existing?.projects || [],
        authors: existing?.authors || [
          { name: "Lab Researchers", is_lab_member: true, is_corresponding: true, display_order: 1 },
        ],
      };
    }
    return p;
  });

  saveLocalPublications(updatedList);
  return { success: true };
}

/**
 * Delete a publication
 */
export async function deletePublication(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await adminMutate("publication", "delete", undefined, id);
    await logPublicationActivity("Publication deleted", id);
  } catch (err) {
    console.warn("Supabase publication delete failed:", err);
  }

  const currentList = getLocalPublications();
  saveLocalPublications(currentList.filter((p) => p.id !== id));
  return { success: true };
}

/**
 * Toggle featured state
 */
export async function togglePublicationFeatured(id: string, is_featured: boolean): Promise<boolean> {
  try {
    await adminMutate("publication", "toggle_featured", { is_featured }, id);
  } catch {
    // ignore
  }

  const currentList = getLocalPublications();
  const updated = currentList.map((p) => (p.id === id ? { ...p, is_featured } : p));
  saveLocalPublications(updated);
  return true;
}

/**
 * Toggle published state
 */
export async function togglePublicationPublish(id: string, is_published: boolean): Promise<boolean> {
  try {
    await adminMutate("publication", "toggle_publish", { is_published }, id);
  } catch {
    // ignore
  }

  const currentList = getLocalPublications();
  const updated = currentList.map((p) => (p.id === id ? { ...p, is_published } : p));
  saveLocalPublications(updated);
  return true;
}

/**
 * Batch insert multiple publications at once
 */
export async function batchCreatePublications(
  records: PublicationFormData[]
): Promise<{ success: boolean; insertedCount: number; errors: string[] }> {
  const currentList = getLocalPublications();
  const existingSlugs = new Set(currentList.map((p) => p.slug));
  const existingDois = new Set(currentList.map((p) => p.doi?.toLowerCase()).filter(Boolean));

  const newPubs: PublicationWithRelations[] = [];
  const payloads: any[] = [];
  const errors: string[] = [];

  for (let i = 0; i < records.length; i++) {
    const formData = records[i];
    const newId = formData.id || `pub-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`;
    let slug = formData.slug?.trim() || generatePublicationSlug(formData.title || `publication-${i}`);
    if (existingSlugs.has(slug)) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }
    existingSlugs.add(slug);

    const { doi, doi_url } = formatDoi(formData.doi);

    const publicationPayload: any = {
      id: newId,
      title: formData.title || "Untitled Publication",
      slug,
      abstract: formData.abstract || "",
      publication_type: formData.publication_type || "journal_article",
      journal: formData.journal || "Scientific Journal",
      volume: formData.volume || null,
      issue: formData.issue || null,
      pages: formData.pages || null,
      publication_year: Number(formData.publication_year) || new Date().getFullYear(),
      publication_date: formData.publication_date || null,
      doi,
      doi_url,
      pdf_url: formData.pdf_url || null,
      external_url: formData.external_url || null,
      impact_factor: formData.impact_factor ? parseFloat(formData.impact_factor) : null,
      citation_count: formData.citation_count ? parseInt(formData.citation_count, 10) : 0,
      quartile: formData.quartile || (formData.impact_factor && parseFloat(formData.impact_factor) >= 6 ? "Q1" : "Q2"),
      is_featured: formData.is_featured || false,
      is_published: formData.is_published !== undefined ? formData.is_published : true,
      display_order: formData.display_order ?? 0,
      authors_text: formData.authors_text || "Lab Researchers",
      bibtex: formData.bibtex || null,
    };

    payloads.push(publicationPayload);

    const allAreas = getAllResearchAreas();
    const matchedAreas = allAreas.filter((a) => formData.research_area_ids?.includes(a.id));
    const fullPub: PublicationWithRelations = {
      id: newId,
      ...publicationPayload,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      authors: [
        { name: "Lab Researchers", is_lab_member: true, is_corresponding: true, display_order: 1 },
      ],
      research_areas: matchedAreas,
      projects: [],
    };

    newPubs.push(fullPub);
  }

  // Attempt remote Supabase batch insert via server mutation
  try {
    const res = await adminMutate("publication", "batch_create", { payloads });
    if (!res?.success && res?.error) {
      errors.push(res.error);
    } else {
      await logPublicationActivity("Batch publications created", "batch", { count: payloads.length });
    }
  } catch (err: any) {
    console.warn("Supabase batch insert exception:", err);
  }

  // Update local store
  saveLocalPublications([...newPubs, ...currentList]);

  return {
    success: true,
    insertedCount: newPubs.length,
    errors,
  };
}

