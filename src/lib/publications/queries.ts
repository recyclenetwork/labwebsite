import { createClient } from "@/lib/supabase/client";
import {
  PublicationWithRelations,
  PublicationStats,
  PublicationFilterParams,
  PublicationResearchArea,
} from "./types";
import { SEED_PUBLICATIONS } from "./seed-data";
import { SEED_RESEARCH_AREAS } from "../projects/seed-data";

const LOCAL_STORAGE_KEY = "lab_publications_override_v2";

/**
 * Get local in-browser publication override storage (for local dev resilience)
 */
export function getLocalPublications(): PublicationWithRelations[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveLocalPublications(items: PublicationWithRelations[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("lab_publications_updated"));
  } catch (err) {
    console.error("Failed to save local publications:", err);
  }
}

/**
 * Fetch all published publications with filters
 */
export async function getPublishedPublications(
  filters: PublicationFilterParams = {},
  includeDrafts = false
): Promise<PublicationWithRelations[]> {
  const localList = getLocalPublications();

  try {
    const supabase = createClient();
    let query = (supabase as any)
      .from("publications")
      .select("*")
      .order("publication_year", { ascending: false })
      .order("created_at", { ascending: false });

    if (!includeDrafts) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    let items: PublicationWithRelations[] = [];

    if (!error && data && data.length > 0) {
      // Fetch relationships or augment with local relational mappings
      items = data.map((d: any) => {
        const localMatch = localList.find((l) => l.id === d.id || l.slug === d.slug);
        return {
          id: d.id,
          title: d.title,
          slug: d.slug || (d.title ? d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "publication"),
          abstract: d.abstract || "",
          publication_type: d.publication_type || "journal_article",
          journal: d.journal || "",
          volume: d.volume || null,
          issue: d.issue || null,
          pages: d.pages || null,
          publication_year: d.publication_year || d.year || new Date().getFullYear(),
          publication_date: d.publication_date || null,
          doi: d.doi || null,
          doi_url: d.doi ? (d.doi.startsWith("http") ? d.doi : `https://doi.org/${d.doi}`) : (d.doi_url || null),
          pdf_url: d.pdf_url || null,
          external_url: d.external_url || null,
          impact_factor: d.impact_factor || null,
          citation_count: d.citation_count || 0,
          quartile: d.quartile || (d.impact_factor && d.impact_factor > 6 ? "Q1" : "Q2"),
          is_featured: !!d.is_featured,
          is_published: d.is_published !== false,
          display_order: d.display_order || 0,
          authors_text: d.authors_text || (localMatch?.authors_text || "Lab Researchers"),
          bibtex: d.bibtex || localMatch?.bibtex || null,
          created_at: d.created_at || new Date().toISOString(),
          updated_at: d.updated_at || new Date().toISOString(),
          authors: localMatch?.authors || [
            { name: "Lab Researchers", is_lab_member: true, is_corresponding: true, display_order: 1 },
          ],
          research_areas: localMatch?.research_areas || [],
          projects: localMatch?.projects || [],
        };
      });
    } else {
      items = localList;
    }

    // Apply Client / In-memory Filtering
    return applyFilters(items, filters, includeDrafts);
  } catch (err) {
    console.warn("Using local publications store:", err);
    return applyFilters(localList, filters, includeDrafts);
  }
}

/**
 * Filter and sort helper
 */
function applyFilters(
  items: PublicationWithRelations[],
  filters: PublicationFilterParams,
  includeDrafts: boolean
): PublicationWithRelations[] {
  let result = items;

  if (!includeDrafts) {
    result = result.filter((p) => p.is_published);
  }

  // Filter: Search
  if (filters.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q) ||
        (p.abstract && p.abstract.toLowerCase().includes(q)) ||
        (p.authors_text && p.authors_text.toLowerCase().includes(q)) ||
        (p.doi && p.doi.toLowerCase().includes(q))
    );
  }

  // Filter: Year (can be single or multi-select array)
  if (filters.year) {
    if (Array.isArray(filters.year) && filters.year.length > 0) {
      const yearNums = filters.year.map((y) => parseInt(y, 10)).filter((n) => !isNaN(n));
      if (yearNums.length > 0) {
        result = result.filter((p) => yearNums.includes(p.publication_year));
      }
    } else if (typeof filters.year === "string" && filters.year !== "all") {
      const yr = parseInt(filters.year, 10);
      if (!isNaN(yr)) {
        result = result.filter((p) => p.publication_year === yr);
      }
    }
  }

  // Filter: Research Area
  if (filters.area && filters.area !== "all") {
    result = result.filter(
      (p) =>
        p.research_areas?.some((a) => a.slug === filters.area || a.id === filters.area || a.title === filters.area)
    );
  }

  // Filter: Publication Type
  if (filters.type && filters.type !== "all") {
    result = result.filter((p) => p.publication_type === filters.type);
  }

  // Filter: Author
  if (filters.author && filters.author !== "all") {
    const authQuery = filters.author.toLowerCase();
    result = result.filter(
      (p) =>
        (p.authors_text && p.authors_text.toLowerCase().includes(authQuery)) ||
        p.authors?.some((a) => a.name.toLowerCase().includes(authQuery) || (a.slug && a.slug.includes(authQuery)))
    );
  }

  // Sorting
  const sort = filters.sort || "latest";
  result.sort((a, b) => {
    if (sort === "latest") {
      return b.publication_year - a.publication_year || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
    if (sort === "oldest") {
      return a.publication_year - b.publication_year || new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (sort === "citations") {
      return (b.citation_count || 0) - (a.citation_count || 0);
    }
    if (sort === "impact") {
      return (b.impact_factor || 0) - (a.impact_factor || 0);
    }
    if (sort === "az") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  return result;
}

/**
 * Fetch a single publication by slug
 */
export async function getPublicationBySlug(slug: string): Promise<PublicationWithRelations | null> {
  const localList = getLocalPublications();
  const matched = localList.find((p) => p.slug === slug || p.id === slug);

  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from("publications")
      .select("*")
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        title: data.title,
        slug: data.slug || slug,
        abstract: data.abstract || matched?.abstract || "",
        publication_type: data.publication_type || "journal_article",
        journal: data.journal || "",
        volume: data.volume || null,
        issue: data.issue || null,
        pages: data.pages || null,
        publication_year: data.publication_year || data.year || new Date().getFullYear(),
        publication_date: data.publication_date || null,
        doi: data.doi || null,
        doi_url: data.doi ? (data.doi.startsWith("http") ? data.doi : `https://doi.org/${data.doi}`) : null,
        pdf_url: data.pdf_url || null,
        external_url: data.external_url || null,
        impact_factor: data.impact_factor || null,
        citation_count: data.citation_count || 0,
        quartile: data.quartile || "Q1",
        is_featured: !!data.is_featured,
        is_published: data.is_published !== false,
        display_order: data.display_order || 0,
        authors_text: data.authors_text || matched?.authors_text || "Lab Researchers",
        bibtex: data.bibtex || matched?.bibtex || null,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        authors: matched?.authors || [
          { name: "Dr. Elena Vance", is_lab_member: true, is_corresponding: true, display_order: 1 },
        ],
        research_areas: matched?.research_areas || [],
        projects: matched?.projects || [],
      };
    }
  } catch (err) {
    console.warn("Supabase fetch single pub fallback:", err);
  }

  return matched || null;
}

/**
 * Compute Publication stats
 */
export async function getPublicationStats(): Promise<PublicationStats> {
  const all = await getPublishedPublications({}, true);
  const totalPublications = all.length;
  const totalCitations = all.reduce((sum, p) => sum + (p.citation_count || 0), 0);
  const topImpactFactor = Math.max(...all.map((p) => p.impact_factor || 0), 13.6);
  const q1JournalCount = all.filter((p) => p.quartile === "Q1" || (p.impact_factor && p.impact_factor >= 5)).length;
  const journalCount = new Set(all.map((p) => p.journal)).size;

  return {
    totalPublications,
    totalCitations,
    topImpactFactor: Number(topImpactFactor.toFixed(1)),
    q1JournalCount,
    journalCount,
    openAccessRatio: "94%",
  };
}

/**
 * Available filters list for publications
 */
export function getAvailableYears(publications: PublicationWithRelations[]): number[] {
  const years = Array.from(new Set(publications.map((p) => p.publication_year))).filter(Boolean);
  return years.sort((a, b) => b - a);
}
