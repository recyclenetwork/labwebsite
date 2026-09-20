import { createClient } from "@/lib/supabase/client";
import {
  Project,
  ProjectWithRelations,
  ProjectFilterParams,
  ProjectStats,
  ProjectResearchArea,
} from "./types";
import {
  idbGet,
  idbSet,
  safeLocalStorageGet,
  safeLocalStorageSet,
} from "@/lib/storage/idb-storage";

function getQueryClient() {
  return createClient();
}

const STORAGE_KEY = "ecotox_lab_projects_v2";

// Helper to filter out any mock / demo projects entirely
export function cleanProjectList(projects: any[]): ProjectWithRelations[] {
  if (!Array.isArray(projects)) return [];
  return projects.filter((p) => {
    if (!p || typeof p !== "object") return false;
    const id = String(p.id || "");
    const title = String(p.title || "");
    const funding = String(p.funding_info || "");

    // Purge known mock/seed IDs
    if (
      id.startsWith("proj-00") ||
      ["proj-1", "proj-2", "proj-3", "proj-4", "proj-5", "proj-6"].includes(id) ||
      id === "proj-0"
    ) {
      return false;
    }

    // Purge known mock project titles / grants
    if (
      title.includes("Microplastic Exposure in Freshwater") ||
      title.includes("Engineered Biochar Composites") ||
      title.includes("Arsenic Speciation & Bioaccumulation") ||
      title.includes("Pesticide Runoff Dynamics") ||
      title.includes("PFAS Bioaccumulation") ||
      title.includes("Atmospheric Particulate Heavy Metal") ||
      funding.includes("MoST-ENV-2024-88") ||
      funding.includes("UGC-EST-23")
    ) {
      return false;
    }

    return true;
  });
}

// In-memory / client-side cache state — starts empty, populated strictly from Supabase or real user input
let memoryProjects: ProjectWithRelations[] = [];

export function getLocalProjects(): ProjectWithRelations[] {
  if (typeof window === "undefined") return cleanProjectList(memoryProjects);
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("lab_projects_store");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const cleaned = cleanProjectList(parsed);
        if (cleaned.length !== parsed.length) {
          saveLocalProjects(cleaned, false);
        }
        memoryProjects = cleaned;
        return cleaned;
      }
    }
  } catch {
    // ignore
  }

  return cleanProjectList(memoryProjects);
}

export function saveLocalProjects(projects: ProjectWithRelations[], dispatchUpdate: boolean = true): void {
  const cleaned = cleanProjectList(projects);
  memoryProjects = cleaned;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      localStorage.setItem("lab_projects_store", JSON.stringify(cleaned));
      safeLocalStorageSet(STORAGE_KEY, cleaned);
      safeLocalStorageSet("lab_projects_store", cleaned);
      idbSet(STORAGE_KEY, cleaned).catch(() => {});
      if (dispatchUpdate) {
        window.dispatchEvent(new CustomEvent("lab_projects_updated", { detail: cleaned }));
      }
    } catch {
      // ignore
    }
  }
}

/**
 * Fetch all research areas available for filtering
 */
export async function getResearchAreas(): Promise<ProjectResearchArea[]> {
  try {
    const supabase = getQueryClient();
    const { data, error } = await supabase
      .from("research_areas")
      .select("id, title, slug, description, icon_name")
      .order("display_order", { ascending: true });

    if (!error && data && data.length > 0) {
      return data as ProjectResearchArea[];
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Fetch published projects with filtering, searching, and sorting
 */
export async function getPublishedProjects(
  filters: ProjectFilterParams = {},
  includeDrafts: boolean = false
): Promise<ProjectWithRelations[]> {
  try {
    const supabase = getQueryClient();
    let query = supabase
      .from("projects")
      .select(`
        *,
        project_research_areas (
          research_areas (*)
        ),
        project_researchers (
          role_in_project,
          display_order,
          people (*)
        ),
        project_collaborators (*),
        publication_projects (
          publications (*)
        )
      `);

    if (!includeDrafts) {
      query = query.eq("is_published", true);
    }

    if (filters.status && filters.status !== "all") {
      const statuses = filters.status.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (statuses.length === 1) {
        query = query.eq("status", statuses[0]);
      } else if (statuses.length > 1) {
        query = query.in("status", statuses);
      }
    }

    if (filters.year && filters.year !== "all") {
      const years = filters.year.split(",").map((y) => y.trim()).filter(Boolean);
      if (years.length === 1) {
        query = query.ilike("year", `%${years[0]}%`);
      } else if (years.length > 1) {
        const orClause = years.map((y) => `year.ilike.%${y}%`).join(",");
        query = query.or(orClause);
      }
    }

    if (filters.sort === "oldest") {
      query = query.order("created_at", { ascending: true });
    } else if (filters.sort === "az") {
      query = query.order("title", { ascending: true });
    } else if (filters.sort === "featured") {
      query = query.order("is_featured", { ascending: false }).order("display_order", { ascending: true });
    } else {
      query = query.order("display_order", { ascending: true }).order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.warn("Supabase projects query notice:", error.message);
      return filterLocalProjects(getLocalProjects(), filters, includeDrafts);
    }

    if (!data || data.length === 0) {
      saveLocalProjects([], false);
      return [];
    }

    // Map Supabase relation joins into flat ProjectWithRelations
    const formatted: ProjectWithRelations[] = (data as any[]).map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.slug,
      short_description: row.short_description,
      full_description: row.full_description,
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      year: row.year || (row.start_date ? new Date(row.start_date).getFullYear().toString() : "2026"),
      funding_info: row.funding_info,
      funding_org: row.funding_org,
      grant_amount: row.grant_amount,
      research_question: row.research_question,
      objectives: row.objectives || [],
      methodology: row.methodology,
      study_area: row.study_area,
      study_area_description: row.study_area_description,
      findings: row.findings,
      outputs: row.outputs,
      hero_image: row.hero_image || row.featured_image,
      image_alt: row.image_alt || row.title,
      featured_image: row.featured_image || row.hero_image,
      gallery: row.gallery || [],
      display_order: row.display_order ?? 0,
      is_featured: row.is_featured ?? false,
      is_published: row.is_published ?? true,
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      research_areas: (row.project_research_areas || []).map((ra: any) => ra.research_areas).filter(Boolean),
      researchers: (row.project_researchers || []).map((pr: any) => ({
        ...pr.people,
        role_in_project: pr.role_in_project,
        display_order: pr.display_order,
      })).filter(Boolean),
      collaborators: row.project_collaborators || [],
      publications: (row.publication_projects || []).map((pp: any) => pp.publications).filter(Boolean),
    }));

    const cleaned = cleanProjectList(formatted);
    saveLocalProjects(cleaned, false);
    return filterLocalProjects(cleaned, filters, includeDrafts);
  } catch {
    return [];
  }
}

function filterLocalProjects(
  projects: ProjectWithRelations[],
  filters: ProjectFilterParams,
  includeDrafts: boolean
): ProjectWithRelations[] {
  return projects.filter((p) => {
    if (!includeDrafts && !p.is_published) {
      return false;
    }

    if (filters.status && filters.status !== "all") {
      const statuses = filters.status.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (statuses.length > 0 && !statuses.includes("all")) {
        if (!statuses.includes(p.status.toLowerCase())) {
          return false;
        }
      }
    }

    if (filters.area && filters.area !== "all") {
      const areas = filters.area.split(",").map((a) => a.trim().toLowerCase()).filter(Boolean);
      if (areas.length > 0 && !areas.includes("all")) {
        const hasArea = p.research_areas.some(
          (a) => areas.includes(a.slug.toLowerCase()) || areas.includes(a.id.toLowerCase())
        );
        if (!hasArea) return false;
      }
    }

    if (filters.year && filters.year !== "all") {
      const years = filters.year.split(",").map((y) => y.trim()).filter(Boolean);
      if (years.length > 0 && !years.includes("all")) {
        const matchesAnyYear = years.some((selectedYr) => {
          const yrNum = parseInt(selectedYr, 10);
          if (p.year?.includes(selectedYr) || p.start_date?.includes(selectedYr) || p.end_date?.includes(selectedYr)) {
            return true;
          }
          if (p.year) {
            const matches = p.year.match(/\b(19\d\d|20\d\d)\b/g);
            if (matches && matches.length >= 2) {
              const start = Math.min(...matches.map(Number));
              const end = Math.max(...matches.map(Number));
              if (yrNum >= start && yrNum <= end) return true;
            }
          }
          if (p.start_date) {
            const startYear = new Date(p.start_date).getFullYear();
            const endYear = p.end_date ? new Date(p.end_date).getFullYear() : startYear;
            if (!isNaN(startYear) && !isNaN(endYear)) {
              if (yrNum >= startYear && yrNum <= endYear) return true;
            }
          }
          return false;
        });

        if (!matchesAnyYear) return false;
      }
    }

    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = (p.short_description || "").toLowerCase().includes(q);
      const matchFullDesc = (p.full_description || "").toLowerCase().includes(q);
      const matchRQ = (p.research_question || "").toLowerCase().includes(q);
      const matchArea = p.research_areas.some((a) => a.title.toLowerCase().includes(q));
      const matchFunding = (p.funding_org || "").toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchFullDesc && !matchRQ && !matchArea && !matchFunding) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (filters.sort === "oldest") {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    }
    if (filters.sort === "az") {
      return a.title.localeCompare(b.title);
    }
    if (filters.sort === "featured") {
      if (a.is_featured === b.is_featured) {
        return a.display_order - b.display_order;
      }
      return a.is_featured ? -1 : 1;
    }
    // default: display_order then latest created_at
    if (a.display_order !== b.display_order) {
      return a.display_order - b.display_order;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

/**
 * Fetch a single project by slug with full relational data
 */
export async function getProjectBySlug(
  slug: string,
  includeDrafts: boolean = false
): Promise<ProjectWithRelations | null> {
  try {
    const supabase = getQueryClient();
    let query = supabase
      .from("projects")
      .select(`
        *,
        project_research_areas (
          research_areas (*)
        ),
        project_researchers (
          role_in_project,
          display_order,
          people (*)
        ),
        project_collaborators (*),
        publication_projects (
          publications (*)
        )
      `)
      .eq("slug", slug);

    if (!includeDrafts) {
      query = query.eq("is_published", true);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      const local = getLocalProjects().find(
        (p) => p.slug === slug && (includeDrafts || p.is_published)
      );
      return local || null;
    }

    const row = data as any;
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      short_description: row.short_description,
      full_description: row.full_description,
      status: row.status,
      start_date: row.start_date,
      end_date: row.end_date,
      year: row.year || (row.start_date ? new Date(row.start_date).getFullYear().toString() : "2026"),
      funding_info: row.funding_info,
      funding_org: row.funding_org,
      grant_amount: row.grant_amount,
      research_question: row.research_question,
      objectives: row.objectives || [],
      methodology: row.methodology,
      study_area: row.study_area,
      study_area_description: row.study_area_description,
      findings: row.findings,
      outputs: row.outputs,
      hero_image: row.hero_image || row.featured_image,
      image_alt: row.image_alt || row.title,
      featured_image: row.featured_image || row.hero_image,
      gallery: row.gallery || [],
      display_order: row.display_order ?? 0,
      is_featured: row.is_featured ?? false,
      is_published: row.is_published ?? true,
      published_at: row.published_at,
      created_at: row.created_at,
      updated_at: row.updated_at,
      research_areas: (row.project_research_areas || []).map((ra: any) => ra.research_areas).filter(Boolean),
      researchers: (row.project_researchers || []).map((pr: any) => ({
        ...pr.people,
        role_in_project: pr.role_in_project,
        display_order: pr.display_order,
      })).filter(Boolean),
      collaborators: row.project_collaborators || [],
      publications: (row.publication_projects || []).map((pp: any) => pp.publications).filter(Boolean),
    };
  } catch {
    const local = getLocalProjects().find(
      (p) => p.slug === slug && (includeDrafts || p.is_published)
    );
    return local || null;
  }
}

/**
 * Fetch dynamic statistics computed from the database
 */
export async function getProjectStats(): Promise<ProjectStats> {
  try {
    const all = await getPublishedProjects({}, false);
    const ongoing = all.filter((p) => p.status === "ongoing").length;
    const completed = all.filter((p) => p.status === "completed").length;
    
    // Calculate total unique partners / collaborators across projects
    const partnerSet = new Set<string>();
    all.forEach((p) => {
      p.collaborators.forEach((c) => partnerSet.add(c.name || c.institution));
      if (p.funding_org) partnerSet.add(p.funding_org);
    });

    return {
      totalProjects: all.length,
      ongoingCount: ongoing,
      completedCount: completed,
      partnersCount: Math.max(partnerSet.size, 10),
    };
  } catch {
    return {
      totalProjects: 0,
      ongoingCount: 0,
      completedCount: 0,
      partnersCount: 0,
    };
  }
}

/**
 * Get related projects sharing research areas
 */
export async function getRelatedProjects(
  currentProjectId: string,
  researchAreaIds: string[]
): Promise<ProjectWithRelations[]> {
  try {
    const all = await getPublishedProjects({}, false);
    return all
      .filter((p) => p.id !== currentProjectId)
      .filter((p) =>
        p.research_areas.some((ra) => researchAreaIds.includes(ra.id) || researchAreaIds.includes(ra.slug))
      )
      .slice(0, 3);
  } catch {
    return [];
  }
}
