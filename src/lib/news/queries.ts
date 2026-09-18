import { createClient } from "@/lib/supabase/client";
import { NewsArticle, NewsStats, NewsFilterParams } from "./types";
import { idbGet, idbSet, safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage/idb-storage";

const LOCAL_STORAGE_KEY = "lab_news_articles_override_v2";

export function cleanNewsList(items: any[]): NewsArticle[] {
  if (!Array.isArray(items)) return [];
  return items.filter((n) => {
    if (!n || typeof n !== "object") return false;
    const id = String(n.id || "");
    const title = String(n.title || "");
    if (
      id.startsWith("news-00") ||
      ["news-1", "news-2", "news-3", "news-4", "news-5", "news-6"].includes(id)
    ) {
      return false;
    }
    if (
      title.includes("Lab Director Delivers Keynote") ||
      title.includes("Research Team Discovers Elevated") ||
      title.includes("Department Expands Ultra-Trace")
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Get local in-browser news override storage
 */
export function getLocalNews(): NewsArticle[] {
  if (typeof window === "undefined") return [];
  try {
    const cached = safeLocalStorageGet<NewsArticle[]>(LOCAL_STORAGE_KEY);
    if (cached && Array.isArray(cached)) {
      const cleaned = cleanNewsList(cached);
      if (cleaned.length !== cached.length) {
        saveLocalNews(cleaned, false);
      }
      return cleaned;
    }
    return [];
  } catch {
    return [];
  }
}

export function saveLocalNews(items: NewsArticle[], dispatchUpdate: boolean = true) {
  if (typeof window === "undefined") return;
  try {
    const cleaned = cleanNewsList(items);
    idbSet(LOCAL_STORAGE_KEY, cleaned);
    safeLocalStorageSet(LOCAL_STORAGE_KEY, cleaned);
    if (dispatchUpdate) {
      window.dispatchEvent(new Event("lab_news_updated"));
    }
  } catch (err) {
    console.error("Failed to save local news articles:", err);
  }
}

/**
 * Fetch all published news articles with filters
 */
export async function getPublishedNews(
  filters: NewsFilterParams = {},
  includeDrafts = false
): Promise<NewsArticle[]> {
  let localList: NewsArticle[] = [];

  if (typeof window !== "undefined") {
    try {
      const idbData = await idbGet<NewsArticle[]>(LOCAL_STORAGE_KEY);
      if (Array.isArray(idbData)) {
        localList = idbData;
      } else {
        const lsData = safeLocalStorageGet<NewsArticle[]>(LOCAL_STORAGE_KEY);
        if (Array.isArray(lsData)) {
          localList = lsData;
          idbSet(LOCAL_STORAGE_KEY, lsData);
        }
      }
    } catch {
      localList = getLocalNews();
    }
  }

  try {
    const supabase = createClient();
    let query = (supabase as any)
      .from("news")
      .select("*")
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (!includeDrafts) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query;

    let items: NewsArticle[] = [];

    if (!error && data && data.length > 0) {
      items = data.map((d: any) => {
        const localMatch = localList.find((l) => l.id === d.id || l.slug === d.slug);
        return {
          id: d.id,
          title: d.title,
          slug: d.slug || (d.title ? d.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "article"),
          summary: d.summary || "",
          content: d.content || (localMatch?.content || ""),
          category: d.category || "lab_update",
          cover_image_url: d.cover_image_url || localMatch?.cover_image_url || null,
          image_caption: d.image_caption || localMatch?.image_caption || null,
          image_credit: d.image_credit || localMatch?.image_credit || null,
          author_name: d.author_name || (localMatch?.author_name || "Lab Editorial Team"),
          author_role: d.author_role || localMatch?.author_role || null,
          author_avatar: d.author_avatar || localMatch?.author_avatar || null,
          published_at: d.published_at || (d.created_at ? d.created_at.split("T")[0] : new Date().toISOString().split("T")[0]),
          read_time_minutes: d.read_time_minutes || localMatch?.read_time_minutes || 4,
          is_featured: !!d.is_featured,
          is_published: d.is_published !== false,
          display_order: d.display_order || 0,
          tags: d.tags || localMatch?.tags || [],
          research_areas: localMatch?.research_areas || [],
          projects: localMatch?.projects || [],
          created_at: d.created_at || new Date().toISOString(),
          updated_at: d.updated_at || new Date().toISOString(),
        };
      });
      items = cleanNewsList(items);
      saveLocalNews(items, false);
    } else if (!error && data && data.length === 0) {
      items = [];
      saveLocalNews([], false);
    } else {
      items = cleanNewsList(localList);
    }

    return applyFilters(items, filters, includeDrafts);
  } catch (err) {
    return applyFilters(cleanNewsList(localList), filters, includeDrafts);
  }
}

/**
 * Filter and sort helper
 */
function applyFilters(
  items: NewsArticle[],
  filters: NewsFilterParams,
  includeDrafts: boolean
): NewsArticle[] {
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
        p.summary.toLowerCase().includes(q) ||
        p.content.toLowerCase().includes(q) ||
        p.author_name.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Filter: Category
  if (filters.category && filters.category !== "all") {
    result = result.filter((p) => p.category === filters.category);
  }

  // Filter: Year
  if (filters.year) {
    if (Array.isArray(filters.year) && filters.year.length > 0) {
      const yearNums = filters.year.map((y) => parseInt(y.toString(), 10)).filter((n) => !isNaN(n));
      if (yearNums.length > 0) {
        result = result.filter((p) => {
          const itemYear = new Date(p.published_at).getFullYear();
          return yearNums.includes(itemYear);
        });
      }
    } else if (typeof filters.year === "string" && filters.year !== "all") {
      const yr = parseInt(filters.year, 10);
      if (!isNaN(yr)) {
        result = result.filter((p) => new Date(p.published_at).getFullYear() === yr);
      }
    }
  }

  // Filter: Author
  if (filters.author && filters.author !== "all") {
    const auth = filters.author.toLowerCase();
    result = result.filter((p) => p.author_name.toLowerCase().includes(auth));
  }

  // Filter: Tag
  if (filters.tag && filters.tag !== "all") {
    result = result.filter((p) => p.tags?.some((t) => t.toLowerCase() === filters.tag?.toLowerCase()));
  }

  return result.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
}

/**
 * Get single article by slug
 */
export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const localList = getLocalNews();
  const matched = localList.find((p) => p.slug === slug || p.id === slug);

  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from("news")
      .select("*")
      .or(`slug.eq.${slug},id.eq.${slug}`)
      .single();

    if (!error && data) {
      return {
        ...data,
        content: data.content || matched?.content || "",
        tags: data.tags || matched?.tags || [],
        research_areas: matched?.research_areas || [],
        projects: matched?.projects || [],
      };
    }
    return matched || null;
  } catch {
    return matched || null;
  }
}

/**
 * Calculate dynamic statistics
 */
export async function getNewsStats(): Promise<NewsStats> {
  const items = await getPublishedNews({}, false);

  return {
    totalArticles: items.length,
    breakthroughCount: items.filter((a) => a.category === "breakthrough").length,
    expeditionCount: items.filter((a) => a.category === "expedition").length,
    grantCount: items.filter((a) => a.category === "grant_award").length,
    symposiumCount: items.filter((a) => a.category === "symposium").length,
  };
}

/**
 * Extract available distinct publication years
 */
export function getAvailableNewsYears(items: NewsArticle[]): number[] {
  const years = items
    .map((item) => new Date(item.published_at).getFullYear())
    .filter((yr) => !isNaN(yr));
  return Array.from(new Set(years)).sort((a, b) => b - a);
}
