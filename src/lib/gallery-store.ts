"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { idbGet, idbSet, idbDelete, safeLocalStorageSet, safeLocalStorageGet } from "@/lib/storage/idb-storage";

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  location?: string;
  date_text?: string;
  description?: string;
  image_url: string;
  badge_color?: string;
}

export const DEFAULT_GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Meghna River Delta Aquatic Sampling",
    category: "Field Expedition",
    location: "Chandpur & Meghna Estuary",
    date_text: "March 2026",
    description: "Multi-point estuarine water column and sediment sampling expedition mapping microplastic particle concentrations and trace metal bioaccumulation.",
    image_url: "/images/gallery/field-sampling.jpg",
  },
  {
    id: "gal-2",
    title: "ICP-MS & Trace Metal Quantitative Screening",
    category: "Laboratory Analysis",
    location: "Ecotox Analytical Facility",
    date_text: "January 2026",
    description: "High-precision inductively coupled plasma mass spectrometry for elemental profiling and heavy metal risk quantification in aquatic biota.",
    image_url: "/images/gallery/analytical-instrumentation.jpg",
  },
  {
    id: "gal-3",
    title: "Stereomicroscopy of Estuarine Plankton",
    category: "Microscopy & Imaging",
    location: "Micro-Ecotoxicology Lab",
    date_text: "February 2026",
    description: "Fluorescence stereomicroscopy characterization of zooplankton ingestion rates and micro-debris tissue adherence in deltaic ecosystems.",
    image_url: "/images/gallery/microscopy-imaging.jpg",
  },
  {
    id: "gal-4",
    title: "International Symposium on Ecotoxicological Risk",
    category: "Symposium & Seminar",
    location: "JU Zahir Raihan Auditorium",
    date_text: "May 2026",
    description: "Delivering keynote findings and hosting international collaborators on industrial wastewater effluent standards and river delta conservation.",
    image_url: "/images/gallery/symposium-seminar.jpg",
  },
  {
    id: "gal-5",
    title: "Eco-Link Climate & Youth Network Workshop",
    category: "Community & Outreach",
    location: "JU Campus Botanical Enclave",
    date_text: "June 2026",
    description: "Student-led environmental sustainability workshop, community water quality monitoring demonstrations, and ecological youth outreach.",
    image_url: "/images/jahangirnagar-campus.jpg",
  },
  {
    id: "gal-6",
    title: "Wetland In-situ Monitoring Expedition",
    category: "Field Expedition",
    location: "Dhaleshwari River Estuary",
    date_text: "April 2026",
    description: "Real-time electrochemical water parameter profiling and bioindicator sample collection along industrial discharge points.",
    image_url: "/images/hero-clean-bg.jpg",
  },
];

const LOCAL_STORAGE_KEY = "ecotox_lab_gallery_items_v2";

export function getCategoryBadgeColor(category: string): string {
  const cat = (category || "").toLowerCase();
  if (cat.includes("field") || cat.includes("expedition")) {
    return "bg-teal-500 text-black";
  }
  if (cat.includes("lab") || cat.includes("analysis")) {
    return "bg-sky-500 text-black";
  }
  if (cat.includes("microscopy") || cat.includes("imaging")) {
    return "bg-[#10B981] text-black";
  }
  if (cat.includes("symposium") || cat.includes("seminar") || cat.includes("event")) {
    return "bg-purple-500 text-white";
  }
  if (cat.includes("award") || cat.includes("honor")) {
    return "bg-amber-500 text-black";
  }
  if (cat.includes("community") || cat.includes("outreach") || cat.includes("youth")) {
    return "bg-emerald-600 text-white";
  }
  return "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40";
}

export function getStoredGalleryItems(): GalleryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = safeLocalStorageGet<GalleryItem[]>(LOCAL_STORAGE_KEY);
    if (raw && Array.isArray(raw) && raw.length > 0) {
      return raw;
    }
  } catch (e) {
    console.error("Error reading gallery from storage:", e);
  }
  return [];
}

export async function getGalleryItemsAsync(): Promise<GalleryItem[]> {
  if (typeof window === "undefined") return [];

  // 1. Try Supabase
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any).from("gallery_events").select("*");
    if (!error && data && data.length > 0) {
      const mapped: GalleryItem[] = data.map((d: any) => ({
        id: String(d.id),
        title: d.title || "",
        category: d.category || "Field Expedition",
        location: d.location || "",
        date_text: d.date_text || "",
        description: d.description || "",
        image_url: d.image_url || "",
      }));
      await setStoredGalleryItems(mapped);
      return mapped;
    }
  } catch {
    // Continue to IndexedDB
  }

  // 2. Try IndexedDB (holds user's uploaded images)
  try {
    const idbData = await idbGet<GalleryItem[]>(LOCAL_STORAGE_KEY);
    if (Array.isArray(idbData) && idbData.length > 0) {
      return idbData;
    }
  } catch (err) {
    console.warn("IndexedDB gallery fetch error:", err);
  }

  // 3. Fallback to localStorage only (no hardcoded defaults)
  const localData = safeLocalStorageGet<GalleryItem[]>(LOCAL_STORAGE_KEY);
  if (Array.isArray(localData) && localData.length > 0) {
    return localData;
  }

  return [];
}

export async function setStoredGalleryItems(items: GalleryItem[]): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await idbSet(LOCAL_STORAGE_KEY, items);
    safeLocalStorageSet(LOCAL_STORAGE_KEY, items);
    window.dispatchEvent(new CustomEvent("ecotox:gallery-updated", { detail: items }));
  } catch (e) {
    console.error("Error saving gallery to storage:", e);
  }
}

export async function fetchGalleryItems(): Promise<GalleryItem[]> {
  return await getGalleryItemsAsync();
}

export async function saveGalleryItem(item: Partial<GalleryItem> & { title: string; image_url: string }): Promise<GalleryItem> {
  const current = await getGalleryItemsAsync();
  let updatedList = [...current];
  let updatedItem: GalleryItem;

  const existsIdx = item.id ? updatedList.findIndex((i) => i.id === item.id) : -1;

  if (existsIdx !== -1) {
    updatedItem = {
      ...updatedList[existsIdx],
      ...item,
    };
    updatedList[existsIdx] = updatedItem;
  } else {
    updatedItem = {
      id: item.id || "gal-" + Date.now().toString(),
      title: item.title,
      category: item.category || "Field Expedition",
      location: item.location || "",
      date_text: item.date_text || "",
      description: item.description || "",
      image_url: item.image_url,
    };
    updatedList.unshift(updatedItem);
  }

  await setStoredGalleryItems(updatedList);

  // Attempt Supabase sync
  try {
    const supabase = createClient();
    const payload = {
      title: updatedItem.title,
      category: updatedItem.category,
      location: updatedItem.location || null,
      date_text: updatedItem.date_text || null,
      description: updatedItem.description || null,
      image_url: updatedItem.image_url,
    };

    if (item.id && !item.id.startsWith("gal-")) {
      await (supabase as any).from("gallery_events").update(payload).eq("id", item.id);
    } else {
      await (supabase as any).from("gallery_events").insert([payload]);
    }
  } catch {
    // Fallback succeeds locally in IDB
  }

  return updatedItem;
}

export async function deleteGalleryItem(id: string): Promise<boolean> {
  const current = await getGalleryItemsAsync();
  const next = current.filter((i) => i.id !== id);
  await setStoredGalleryItems(next);

  try {
    const supabase = createClient();
    await (supabase as any).from("gallery_events").delete().eq("id", id);
  } catch {
    // Local delete succeeds
  }

  return true;
}

export function useGalleryItems() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Synchronously load from localStorage cache
    const initial = getStoredGalleryItems();
    setItems(initial);
    setLoading(false);

    // 2. Asynchronously load latest from IndexedDB / Remote
    getGalleryItemsAsync().then((latest) => {
      if (Array.isArray(latest) && latest.length > 0) {
        setItems(latest);
      }
    });

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setItems(e.detail);
      } else {
        getGalleryItemsAsync().then((latest) => {
          if (Array.isArray(latest)) setItems(latest);
        });
      }
    };

    window.addEventListener("ecotox:gallery-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("ecotox:gallery-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return { items, loading, setItems };
}
