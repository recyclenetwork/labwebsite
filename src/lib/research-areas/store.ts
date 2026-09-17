import { ProjectResearchArea } from "@/lib/projects/types";
import { createClient } from "@/lib/supabase/client";
import { idbGet, idbSet, safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage/idb-storage";

export interface ResearchPillar {
  id: string;
  index: string;
  code?: string;
  title: string;
  shortTitle: string;
  slug: string;
  description: string;
  imageSrc: string;
  imageAlt?: string;
  icon_name: string;
  tags: string[];
  keyHighlight: string;
  instrumentation: string;
  targetMatrices: string;
  detectionMetric: string;
  angleDeg?: number;
  display_order?: number;
}

export const DEFAULT_RESEARCH_PILLARS: ResearchPillar[] = [
  {
    id: "pillar-1",
    index: "01",
    code: "AREA-01",
    title: "Environmental Contamination",
    shortTitle: "Contamination",
    slug: "environmental-contamination",
    description: "Investigating persistent contaminants, PFAS, and trace metals across soil, water, and biological matrices.",
    imageSrc: "/images/areas/area-1.jpg",
    imageAlt: "Environmental soil, water and sediment contamination analysis in lab",
    icon_name: "FlaskConical",
    tags: ["Trace Metals", "PFAS Analysis", "Soil Depth"],
    keyHighlight: "Multi-Matrix Screening",
    instrumentation: "Orbitrap LC-HRMS • EPA Method 533/537.1",
    targetMatrices: "Soil sediment cores, agricultural runoff, groundwater",
    detectionMetric: "< 0.1 ppt Detection Limit",
    angleDeg: 270,
    display_order: 1,
  },
  {
    id: "pillar-2",
    index: "02",
    code: "AREA-02",
    title: "Microplastics & Emerging Pollutants",
    shortTitle: "Microplastics",
    slug: "microplastics-emerging-pollutants",
    description: "Tracking polymer degradation, sub-micron particulate transport, and trophic bio-accumulation in aquatic food webs.",
    imageSrc: "/images/areas/area-2.jpg",
    imageAlt: "Microscopic microplastic fluorescent fibers under polarized laboratory microscope",
    icon_name: "Sparkles",
    tags: ["Micro-FTIR", "Polymer Fate", "Trophic Transfer"],
    keyHighlight: "Sub-Micron Detection",
    instrumentation: "Micro-FTIR Imaging • Py-GC/MS Fingerprinting",
    targetMatrices: "Aquatic fauna tissues, marine sediments, airborne dust",
    detectionMetric: "Sub-1 µm Spatial Resolution",
    angleDeg: 330,
    display_order: 2,
  },
  {
    id: "pillar-3",
    index: "03",
    code: "AREA-03",
    title: "Environmental Health & Risk",
    shortTitle: "Health & Risk",
    slug: "environmental-health-risk",
    description: "Connecting chemical exposure pathways to cellular oxidative stress, toxicogenomics, and public health risk models.",
    imageSrc: "/images/areas/area-3.jpg",
    imageAlt: "Cellular bioassays and toxicogenomic scanner in clean research laboratory",
    icon_name: "HeartPulse",
    tags: ["Cellular Bioassays", "Toxicogenomics", "Risk Models"],
    keyHighlight: "Molecular Toxicology",
    instrumentation: "In-Vitro Mammalian Assays • Flow Cytometry",
    targetMatrices: "Human cell lines, biomarker sera, epidemiological cohorts",
    detectionMetric: "Multi-Gene Expression Profiling",
    angleDeg: 30,
    display_order: 3,
  },
  {
    id: "pillar-4",
    index: "04",
    code: "AREA-04",
    title: "Sustainable & Circular Systems",
    shortTitle: "Circular Systems",
    slug: "sustainable-circular-systems",
    description: "Developing evidence-based engineered bioremediation, catalytic adsorption, and circular nutrient recovery frameworks.",
    imageSrc: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Sustainable circular bioremediation and ecological resource recovery system",
    icon_name: "Leaf",
    tags: ["Bioremediation", "Resource Recovery", "Closed-Loop"],
    keyHighlight: "Circular Systems",
    instrumentation: "Continuous Algal Bioreactors • Biochar Pyrolysis",
    targetMatrices: "Industrial wastewater, municipal sludge, agricultural wastes",
    detectionMetric: "> 94% Contaminant Recovery",
    angleDeg: 90,
    display_order: 4,
  },
  {
    id: "pillar-5",
    index: "05",
    code: "AREA-05",
    title: "Environmental Monitoring & Analytics",
    shortTitle: "Monitoring",
    slug: "environmental-monitoring-analytics",
    description: "Deploying high-frequency autonomous sensors and data-driven analytical pipelines to track real-time environmental shifts.",
    imageSrc: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80",
    imageAlt: "High-resolution mass spectrometry and analytical monitoring laboratory",
    icon_name: "Activity",
    tags: ["In-Situ Sensors", "Automated Sondes", "Real-Time Telemetry"],
    keyHighlight: "High-Resolution Analytics",
    instrumentation: "Multi-Parameter Sondes • Automated Telemetry",
    targetMatrices: "Continuous river discharge, atmospheric flux, weather stations",
    detectionMetric: "15-Minute Continuous Streaming",
    angleDeg: 150,
    display_order: 5,
  },
  {
    id: "pillar-6",
    index: "06",
    code: "AREA-06",
    title: "Spatial Analysis & Environmental GIS",
    shortTitle: "Spatial GIS",
    slug: "environmental-gis-spatial-analysis",
    description: "Mapping spatial contamination gradients, satellite multi-spectral remote sensing, and watershed hydrodynamic modeling.",
    imageSrc: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Environmental GIS satellite elevation contours and watershed spatial modeling",
    icon_name: "Compass",
    tags: ["Satellite Remote Sensing", "Hydro-DEM", "Spatial Geostatistics"],
    keyHighlight: "Landscape-Scale GIS",
    instrumentation: "Sentinel-2 / Landsat-9 • Hydro-DEM Contaminant Flow",
    targetMatrices: "Watershed basins, land-use classifications, coastal zones",
    detectionMetric: "10m Ground Resolution Mapping",
    angleDeg: 210,
    display_order: 6,
  },
];

const LOCAL_STORAGE_KEY = "ecotox_lab_research_pillars_v2";

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
 * Get stored research pillars synchronously from localStorage
 */
export function getStoredResearchPillars(): ResearchPillar[] | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = safeLocalStorageGet<ResearchPillar[]>(LOCAL_STORAGE_KEY);
    if (raw && Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
  } catch (e) {
    console.warn("Could not read research pillars from localStorage:", e);
  }
  return null;
}

/**
 * Fetch all research pillars (Supabase site_settings + IndexedDB + localStorage)
 */
export async function fetchResearchPillarsAsync(): Promise<ResearchPillar[]> {
  // 1. First attempt to fetch live from Supabase site_settings
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "research_pillars")
      .maybeSingle();

    const value = (data as any)?.value;
    if (!error && Array.isArray(value) && value.length > 0) {
      if (typeof window !== "undefined") {
        safeLocalStorageSet(LOCAL_STORAGE_KEY, value);
        idbSet(LOCAL_STORAGE_KEY, value).catch(() => {});
      }
      return value;
    }
  } catch (err) {
    // Supabase offline/error
  }

  // 2. Check IndexedDB
  if (typeof window !== "undefined") {
    try {
      const idbData = await idbGet<ResearchPillar[]>(LOCAL_STORAGE_KEY);
      if (Array.isArray(idbData) && idbData.length > 0) {
        return idbData;
      }
    } catch {}
  }

  // 3. Fallback to localStorage
  const stored = getStoredResearchPillars();
  if (stored && stored.length > 0) {
    return stored;
  }

  // 4. Default seed template if brand new installation
  return DEFAULT_RESEARCH_PILLARS;
}

/**
 * Save all research pillars (updates IndexedDB, LocalStorage, and Supabase)
 */
export async function saveAllResearchPillars(pillars: ResearchPillar[]): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    await idbSet(LOCAL_STORAGE_KEY, pillars);
    safeLocalStorageSet(LOCAL_STORAGE_KEY, pillars);

    // Sync to Supabase site_settings
    try {
      const supabase = createClient();
      await (supabase as any).from("site_settings").upsert({
        key: "research_pillars",
        value: pillars,
        updated_at: new Date().toISOString(),
      });
    } catch (syncErr) {
      console.warn("Supabase research pillars sync warning:", syncErr);
    }

    window.dispatchEvent(new CustomEvent("lab_research_areas_updated", { detail: pillars }));
    return true;
  } catch (e) {
    console.error("Failed to save research pillars:", e);
    return false;
  }
}

/**
 * Save / update a single research pillar
 */
export async function saveResearchPillar(pillar: Partial<ResearchPillar> & { title: string }): Promise<ResearchPillar> {
  const current = await fetchResearchPillarsAsync();
  let updatedList = [...current];
  let updatedItem: ResearchPillar;

  const existsIdx = pillar.id ? updatedList.findIndex((p) => p.id === pillar.id) : -1;

  if (existsIdx !== -1) {
    updatedItem = {
      ...updatedList[existsIdx],
      ...pillar,
      slug: pillar.title ? generateAreaSlug(pillar.title) : updatedList[existsIdx].slug,
    };
    updatedList[existsIdx] = updatedItem;
  } else {
    const nextIdxNumber = updatedList.length + 1;
    const indexStr = String(nextIdxNumber).padStart(2, "0");
    updatedItem = {
      id: pillar.id || `pillar-${Date.now()}`,
      index: pillar.index || indexStr,
      code: pillar.code || `AREA-${indexStr}`,
      title: pillar.title,
      shortTitle: pillar.shortTitle || pillar.title.split(" ")[0],
      slug: generateAreaSlug(pillar.title),
      description: pillar.description || "",
      imageSrc: pillar.imageSrc || "/images/areas/area-1.jpg",
      imageAlt: pillar.imageAlt || pillar.title,
      icon_name: pillar.icon_name || "FlaskConical",
      tags: pillar.tags || [],
      keyHighlight: pillar.keyHighlight || "Scientific Pillar",
      instrumentation: pillar.instrumentation || "Analytical Instrumentation",
      targetMatrices: pillar.targetMatrices || "Environmental matrices",
      detectionMetric: pillar.detectionMetric || "Analytical Limit",
      angleDeg: pillar.angleDeg || (nextIdxNumber * 60) % 360,
      display_order: pillar.display_order ?? nextIdxNumber,
    };
    updatedList.push(updatedItem);
  }

  await saveAllResearchPillars(updatedList);
  return updatedItem;
}

/**
 * Delete a research pillar
 */
export async function deleteResearchPillar(id: string): Promise<boolean> {
  const current = await fetchResearchPillarsAsync();
  const nextList = current.filter((p) => p.id !== id);
  await saveAllResearchPillars(nextList);
  return true;
}

/**
 * Helper to get default or initial research pillars
 */
export function getDefaultResearchPillars(): ResearchPillar[] {
  return DEFAULT_RESEARCH_PILLARS;
}

// Backward-compatibility exports for existing project/publications modules
export function getAllResearchAreas(): ProjectResearchArea[] {
  const stored = getStoredResearchPillars() || DEFAULT_RESEARCH_PILLARS;
  return stored.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    icon_name: p.icon_name,
  }));
}

export async function createResearchArea(title: string, description?: string, icon_name?: string): Promise<ProjectResearchArea> {
  const saved = await saveResearchPillar({
    title,
    description,
    icon_name,
  });
  return {
    id: saved.id,
    title: saved.title,
    slug: saved.slug,
    description: saved.description,
    icon_name: saved.icon_name,
  };
}

export async function updateResearchArea(id: string, updates: Partial<ProjectResearchArea>): Promise<ProjectResearchArea | null> {
  const current = await fetchResearchPillarsAsync();
  const target = current.find((p) => p.id === id);
  if (!target) return null;
  const updated = await saveResearchPillar({
    ...target,
    ...updates,
  });
  return {
    id: updated.id,
    title: updated.title,
    slug: updated.slug,
    description: updated.description,
    icon_name: updated.icon_name,
  };
}

export async function deleteResearchArea(id: string): Promise<boolean> {
  return await deleteResearchPillar(id);
}
