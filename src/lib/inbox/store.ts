import { Inquiry, InquiryFormData, InquiryStatus } from "./types";
import { createClient } from "@/lib/supabase/client";

const LOCAL_STORAGE_KEY = "ecotox_lab_inbox_inquiries_v1";

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: "inq-1",
    name: "Dr. Sarah Jenkins",
    email: "s.jenkins@oxford.ac.uk",
    phone: "+44 1865 270000",
    organization: "University of Oxford, Dept. of Zoology",
    subject: "Joint Global South Estuarine Microplastics Project",
    category: "Research Collaboration",
    message: "Dear Dr. Kabir and team, we have been following your groundbreaking high-resolution micro-FTIR mapping along the Meghna River. We would like to explore submitting a joint UKRI-GCRF grant proposal focused on transboundary aquatic polymer transport. Could we schedule a 30-minute virtual meeting next Tuesday?",
    type: "contact_form",
    status: "new",
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
  },
  {
    id: "inq-2",
    name: "Farhana Islam",
    email: "farhana.ju.env@gmail.com",
    phone: "+880 1712-345678",
    organization: "Jahangirnagar University",
    subject: "MS Thesis Researcher Application (Spring Cohort)",
    category: "Student Admission / Thesis",
    message: "I am writing to express my strong interest in joining the Laboratory of Environmental Health and Ecotoxicology (LabEHE) as an MS thesis researcher. I completed my B.Sc. in Environmental Sciences with a GPA of 3.89 and have basic experience in FTIR spectroscopy.",
    type: "student_application",
    status: "new",
    degree_level: "Master of Science (MS)",
    university: "Jahangirnagar University",
    research_interest: "Microplastic ingestion dynamics and histopathology in freshwater teleosts.",
    cover_letter: "I am writing to express my strong interest in joining the Laboratory of Environmental Health and Ecotoxicology (LabEHE) as an MS thesis researcher. I completed my B.Sc. in Environmental Sciences with a GPA of 3.89 and have basic experience in FTIR spectroscopy.",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
  },
  {
    id: "inq-3",
    name: "Mahmudul Hasan",
    email: "m.hasan.chem@du.ac.bd",
    phone: "+880 1823-456789",
    organization: "University of Dhaka",
    subject: "Doctoral Research Fellowship Application",
    category: "Student Admission / Thesis",
    message: "Having published 2 Q1 papers on trace metal contamination, I wish to pursue my doctoral studies on speciation kinetics under Dr. Kabir's supervision.",
    type: "student_application",
    status: "reviewing",
    degree_level: "Doctor of Philosophy (PhD)",
    university: "University of Dhaka",
    research_interest: "Speciation and biogeochemical mobility of heavy metals in contaminated wetland sediments.",
    cover_letter: "Having published 2 Q1 papers on trace metal contamination, I wish to pursue my doctoral studies on speciation kinetics under Dr. Kabir's supervision.",
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
  },
  {
    id: "inq-4",
    name: "Tariqul Rahman",
    email: "t.rahman@bapa-bd.org",
    phone: "+880 1911-223344",
    organization: "Bangladesh Environmental Movement (BAPA)",
    subject: "Industrial Effluent Toxicity Report & Policy Briefing",
    category: "Environmental Analytical Services",
    message: "We are preparing a policy memorandum for the Department of Environment on coastal effluent plumes and would like to request expert scientific consultation or analytical validation from your lab regarding toxic metal speciation.",
    type: "contact_form",
    status: "responded",
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  }
];

/**
 * Get all inbox inquiries (Supabase + localStorage fallback)
 */
export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    // Supabase query error, fallback to local storage
  }

  // Check LocalStorage
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Failed to parse cached inbox inquiries:", e);
    }
  }

  // Seed default
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_INQUIRIES));
    } catch {}
  }

  return INITIAL_INQUIRIES;
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

  // Save to LocalStorage
  if (typeof window !== "undefined") {
    try {
      const current = await getInquiries();
      const updated = [completeInquiry, ...current.filter((i) => i.id !== newId)];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
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
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("lab_inbox_updated"));
    } catch (e) {
      console.error("Failed to delete inquiry locally:", e);
    }
  }

  return true;
}
