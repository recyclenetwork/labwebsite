import { Inquiry, InquiryFormData, InquiryStatus } from "./types";
import { createClient } from "@/lib/supabase/client";
import { idbGet, idbSet, safeLocalStorageGet, safeLocalStorageSet } from "@/lib/storage/idb-storage";

const LOCAL_STORAGE_KEY = "ecotox_lab_inbox_inquiries_v2";

/**
 * Get all inbox inquiries (Supabase + local persistent storage)
 * Pure backend / real data — ZERO mock fallbacks.
 */
export async function getInquiries(): Promise<Inquiry[]> {
  // 1. Try Supabase first
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      if (typeof window !== "undefined") {
        safeLocalStorageSet(LOCAL_STORAGE_KEY, data);
        idbSet(LOCAL_STORAGE_KEY, data).catch(() => {});
      }
      return data;
    }
  } catch (err) {
    // Supabase query error, fallback to local persistent storage
  }

  // 2. Check IndexedDB
  if (typeof window !== "undefined") {
    try {
      const idbData = await idbGet<Inquiry[]>(LOCAL_STORAGE_KEY);
      if (Array.isArray(idbData)) {
        return idbData;
      }
    } catch (e) {
      console.warn("Failed to read inbox from IndexedDB:", e);
    }

    // 3. Check LocalStorage
    try {
      const cached = safeLocalStorageGet<Inquiry[]>(LOCAL_STORAGE_KEY);
      if (Array.isArray(cached)) {
        return cached;
      }
    } catch (e) {
      console.error("Failed to parse cached inbox inquiries:", e);
    }
  }

  // 4. Return empty list if no inquiries exist — NEVER generate mock inquiries
  return [];
}

/**
 * Submit a new Contact Inquiry or Student Application
 */
export async function submitInquiry(data: Partial<Inquiry>): Promise<Inquiry> {
  const newId = data.id || `inq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const completeInquiry: Inquiry = {
    id: newId,
    name: (data.name || "Anonymous Visitor").trim().slice(0, 200),
    email: (data.email || "no-email@provided.com").trim().slice(0, 250),
    phone: (data.phone || "").trim().slice(0, 50),
    organization: (data.organization || "").trim().slice(0, 300),
    subject: (data.subject || "General Inquiry").trim().slice(0, 400),
    category: (data.category || "General Inquiry").trim().slice(0, 150),
    message: (data.message || "").trim().slice(0, 10000),
    type: data.type || "contact_form",
    status: "new",
    created_at: now,
    degree_level: (data.degree_level || "").trim().slice(0, 100),
    university: (data.university || "").trim().slice(0, 300),
    research_interest: (data.research_interest || "").trim().slice(0, 2000),
    cover_letter: (data.cover_letter || "").trim().slice(0, 15000),
  };

  // Attempt Supabase insert
  try {
    const supabase = createClient();
    await (supabase as any).from("inquiries").insert([completeInquiry]);
  } catch (err) {
    console.warn("Supabase inquiry insert failed, saved to local store:", err);
  }

  // Save to LocalStorage and IndexedDB
  if (typeof window !== "undefined") {
    try {
      const current = await getInquiries();
      const updated = [completeInquiry, ...current.filter((i) => i.id !== newId)];
      safeLocalStorageSet(LOCAL_STORAGE_KEY, updated);
      await idbSet(LOCAL_STORAGE_KEY, updated);
      window.dispatchEvent(new CustomEvent("lab_inbox_updated", { detail: completeInquiry }));
    } catch (e) {
      console.error("Failed to save inquiry to localStorage:", e);
    }
  }

  return completeInquiry;
}

/**
 * Update Inquiry Status (e.g. new, reviewing, responded, archived, rejected)
 */
export async function updateInquiryStatus(id: string, status: InquiryStatus): Promise<boolean> {
  // Attempt Supabase update
  try {
    const supabase = createClient();
    await (supabase as any).from("inquiries").update({ status }).eq("id", id);
  } catch (err) {
    console.warn("Supabase inquiry update status fallback to local store:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const current = await getInquiries();
      const updated = current.map((item) => (item.id === id ? { ...item, status } : item));
      safeLocalStorageSet(LOCAL_STORAGE_KEY, updated);
      await idbSet(LOCAL_STORAGE_KEY, updated);
      window.dispatchEvent(new CustomEvent("lab_inbox_updated"));
    } catch (e) {
      console.error("Failed to update inquiry status locally:", e);
    }
  }

  return true;
}

/**
 * Delete an Inquiry
 */
export async function deleteInquiry(id: string): Promise<boolean> {
  // Attempt Supabase delete
  try {
    const supabase = createClient();
    await (supabase as any).from("inquiries").delete().eq("id", id);
  } catch (err) {
    console.warn("Supabase inquiry delete fallback to local store:", err);
  }

  if (typeof window !== "undefined") {
    try {
      const current = await getInquiries();
      const updated = current.filter((item) => item.id !== id);
      safeLocalStorageSet(LOCAL_STORAGE_KEY, updated);
      await idbSet(LOCAL_STORAGE_KEY, updated);
      window.dispatchEvent(new CustomEvent("lab_inbox_updated"));
    } catch (e) {
      console.error("Failed to delete inquiry locally:", e);
    }
  }

  return true;
}
