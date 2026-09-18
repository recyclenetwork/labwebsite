import { TeamMember, TeamCategory } from "./types";
import { createClient } from "@/lib/supabase/client";
import { adminMutate } from "@/lib/supabase/admin-mutate";
import { idbGet, idbSet, idbDelete, safeLocalStorageSet, safeLocalStorageGet } from "@/lib/storage/idb-storage";

const LOCAL_STORAGE_KEY = "ecotox_lab_team_members_v1";

export function cleanTeamList(items: any[]): TeamMember[] {
  if (!Array.isArray(items)) return [];
  return items.filter((m) => {
    if (!m || typeof m !== "object") return false;
    const id = String(m.id || "");
    if (["person-1", "person-2", "person-3", "person-4", "person-5", "member-1", "member-2"].includes(id)) {
      return false;
    }
    return true;
  });
}

export function getCachedTeamMembers(): TeamMember[] {
  if (typeof window !== "undefined") {
    const cached = safeLocalStorageGet<TeamMember[]>(LOCAL_STORAGE_KEY);
    if (Array.isArray(cached)) {
      const cleaned = cleanTeamList(cached);
      if (cleaned.length !== cached.length) {
        safeLocalStorageSet(LOCAL_STORAGE_KEY, cleaned);
      }
      return cleaned;
    }
  }
  return [];
}

export function getCachedPI(): TeamMember | null {
  const members = getCachedTeamMembers();
  return (
    members.find((m) => m.category === "pi" && m.isActive !== false) ||
    members.find((m) => m.category === "pi") ||
    members[0] ||
    null
  );
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  // 1. Try Supabase first
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from("people")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && Array.isArray(data)) {
      if (data.length === 0) {
        if (typeof window !== "undefined") {
          await idbSet(LOCAL_STORAGE_KEY, []);
          safeLocalStorageSet(LOCAL_STORAGE_KEY, []);
        }
        return [];
      }

      const mapped: TeamMember[] = cleanTeamList(data.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        role: row.role || row.position || "",
        position: row.position || row.role || "",
        designation: row.designation || "",
        category: row.category || "researcher",
        department: row.department || "Department of Environmental Sciences",
        affiliation: row.affiliation || "Jahangirnagar University",
        email: row.email || "",
        bio: row.bio || row.biography || "",
        quote: row.quote || "",
        researchInterests: Array.isArray(row.research_interests)
          ? row.research_interests
          : row.research_interests ? String(row.research_interests).split(",") : [],
        imageSrc: row.photo_url || row.image_url || "/images/slide-2-lab.jpg",
        imageAlt: row.name,
        publicationsCount: row.publications_count || "0",
        citationsCount: row.citations_count || "0",
        hIndex: row.h_index || "0",
        grantsCount: row.grants_count || "0",
        currentInstitution: row.current_institution || "",
        alumniYear: row.alumni_year || "",
        pastRole: row.past_role || "",
        orderIndex: row.order_index || 0,
        isActive: row.is_active ?? true,
      })));

      // Cache locally
      await idbSet(LOCAL_STORAGE_KEY, mapped);
      safeLocalStorageSet(LOCAL_STORAGE_KEY, mapped);
      return mapped;
    }
  } catch (err) {
    // Supabase query failed, fallback
  }

  // 2. Check IndexedDB in browser (unlimited quota)
  if (typeof window !== "undefined") {
    try {
      const idbData = await idbGet<TeamMember[]>(LOCAL_STORAGE_KEY);
      if (Array.isArray(idbData) && idbData.length > 0) {
        const cleaned = cleanTeamList(idbData);
        return cleaned;
      }
    } catch (e) {
      console.warn("IndexedDB read error:", e);
    }

    // 3. Check localStorage in browser
    const cached = safeLocalStorageGet<TeamMember[]>(LOCAL_STORAGE_KEY);
    if (Array.isArray(cached) && cached.length > 0) {
      const cleaned = cleanTeamList(cached);
      await idbSet(LOCAL_STORAGE_KEY, cleaned);
      return cleaned;
    }
  }

  // 4. Return empty array — no hardcoded seed data fallback
  return [];
}

export async function saveTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
  const current = await getTeamMembers();
  let updatedList: TeamMember[];

  const isNew = !member.id || !current.some((m) => m.id === member.id);
  const nowId = member.id || `team-${Date.now()}`;
  const slug = member.slug || (member.name ? member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `member-${Date.now()}`);

  const completeMember: TeamMember = {
    id: nowId,
    name: member.name || "Unnamed Researcher",
    slug,
    role: member.role || "Research Fellow",
    category: member.category || "graduate",
    department: member.department || "Department of Environmental Sciences",
    affiliation: member.affiliation || "Jahangirnagar University",
    bio: member.bio || "",
    researchInterests: member.researchInterests || [],
    education: member.education || [],
    email: member.email || "",
    phone: member.phone || "",
    officeLocation: member.officeLocation || "",
    googleScholarUrl: member.googleScholarUrl || "",
    orcid: member.orcid || "",
    researchGateUrl: member.researchGateUrl || "",
    linkedinUrl: member.linkedinUrl || "",
    websiteUrl: member.websiteUrl || "",
    imageSrc: member.imageSrc || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    quote: member.quote || "",
    publicationsCount: member.publicationsCount,
    citationsCount: member.citationsCount,
    hIndex: member.hIndex,
    grantsCount: member.grantsCount,
    advisingCount: member.advisingCount,
    thesisTopic: member.thesisTopic || "",
    undergradThesis: member.undergradThesis || "",
    undergradDescription: member.undergradDescription || "",
    mscThesis: member.mscThesis || "",
    mscDescription: member.mscDescription || "",
    phdThesis: member.phdThesis || "",
    phdDescription: member.phdDescription || "",
    skills: member.skills || [],
    awards: member.awards || [],
    publications: member.publications || [],
    curriculumVitae: member.curriculumVitae,
    advisor: member.advisor || "",
    expectedGraduation: member.expectedGraduation || "",
    currentPosition: member.currentPosition || "",
    currentInstitution: member.currentInstitution || "",
    alumniYear: member.alumniYear || "",
    pastRole: member.pastRole || "",
    orderIndex: member.orderIndex ?? (isNew ? current.length + 1 : 0),
    isActive: member.isActive ?? true,
  };

  if (isNew) {
    updatedList = [completeMember, ...current];
  } else {
    updatedList = current.map((m) => (m.id === completeMember.id ? completeMember : m));
  }

  // 1. Always save directly into IndexedDB (guaranteed success)
  if (typeof window !== "undefined") {
    await idbSet(LOCAL_STORAGE_KEY, updatedList);
    // 2. Mirror into localStorage safely with quota protection
    safeLocalStorageSet(LOCAL_STORAGE_KEY, updatedList);
  }

  // 3. Try saving to Supabase if table exists
  try {
    const supabase = createClient();
    const payload: Record<string, any> = {
      name: completeMember.name,
      slug: completeMember.slug,
      position: completeMember.role,
      role: completeMember.role,
      designation: completeMember.role,
      category: completeMember.category,
      department: completeMember.department,
      affiliation: completeMember.affiliation,
      bio: completeMember.bio,
      biography: completeMember.bio,
      email: completeMember.email,
      phone: completeMember.phone,
      office_location: completeMember.officeLocation,
      google_scholar: completeMember.googleScholarUrl,
      google_scholar_url: completeMember.googleScholarUrl,
      researchgate_url: completeMember.researchGateUrl,
      linkedin_url: completeMember.linkedinUrl,
      website_url: completeMember.websiteUrl,
      photo_url: completeMember.imageSrc,
      image_url: completeMember.imageSrc,
      quote: completeMember.quote,
      research_interests: completeMember.researchInterests,
      education: completeMember.education,
      publications_count: completeMember.publicationsCount,
      citations_count: completeMember.citationsCount,
      h_index: completeMember.hIndex,
      grants_count: completeMember.grantsCount,
      advising_count: completeMember.advisingCount,
      thesis_topic: completeMember.thesisTopic,
      advisor: completeMember.advisor,
      expected_graduation: completeMember.expectedGraduation,
      current_position: completeMember.currentPosition,
      current_institution: completeMember.currentInstitution,
      alumni_year: completeMember.alumniYear,
      past_role: completeMember.pastRole,
      order_index: completeMember.orderIndex,
      display_order: completeMember.orderIndex,
      is_active: completeMember.isActive,
    };

    // If ID is valid UUID, include it
    if (completeMember.id && !completeMember.id.startsWith("tm-") && !completeMember.id.startsWith("pi-")) {
      payload.id = completeMember.id;
    }

    await adminMutate("person", "upsert", { personPayload: payload });
  } catch (err) {
    console.warn("Supabase team save sync warning:", err);
  }

  // If PI member, mirror updates to landing store
  if (completeMember.category === "pi" && typeof window !== "undefined") {
    try {
      const storedLanding = safeLocalStorageGet<any>("ecotox_landing_content_v2");
      if (storedLanding && typeof storedLanding === "object") {
        const updatedLanding = {
          ...storedLanding,
          piSection: {
            ...storedLanding.piSection,
            name: completeMember.name,
            designation: completeMember.role,
            department: completeMember.department,
            institution: completeMember.affiliation,
            bioQuote: completeMember.quote || completeMember.bio || storedLanding.piSection?.bioQuote || "",
            imageSrc: completeMember.imageSrc,
            publicationsCount: completeMember.publicationsCount ? `${completeMember.publicationsCount}+` : storedLanding.piSection?.publicationsCount || "74+",
            citationsCount: completeMember.citationsCount ? `${completeMember.citationsCount.toLocaleString()}+` : storedLanding.piSection?.citationsCount || "2,840+",
            hIndex: completeMember.hIndex ? `${completeMember.hIndex}` : storedLanding.piSection?.hIndex || "26",
            scholarUrl: completeMember.googleScholarUrl || storedLanding.piSection?.scholarUrl || "",
          },
        };
        safeLocalStorageSet("ecotox_landing_content_v2", updatedLanding);
        idbSet("ecotox_landing_content_v2", updatedLanding).catch(() => {});
        window.dispatchEvent(new Event("landing-content-updated"));
      }
    } catch {}
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("team-members-updated"));
  }

  return completeMember;
}

export async function deleteTeamMember(id: string): Promise<boolean> {
  const current = await getTeamMembers();
  const updatedList = current.filter((m) => m.id !== id);

  if (typeof window !== "undefined") {
    await idbSet(LOCAL_STORAGE_KEY, updatedList);
    safeLocalStorageSet(LOCAL_STORAGE_KEY, updatedList);
    window.dispatchEvent(new Event("team-members-updated"));
  }

  try {
    await adminMutate("person", "delete", undefined, id);
  } catch (err) {
    console.warn("Supabase team delete warning:", err);
  }

  return true;
}

export async function getTeamMemberBySlug(slug: string): Promise<TeamMember | null> {
  const members = await getTeamMembers();
  const found = members.find(
    (m) =>
      m.slug === slug ||
      m.id === slug ||
      m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );
  if (found) return found;

  return null;
}

export async function getRelatedTeamMembers(
  currentId: string,
  category: TeamCategory,
  limit: number = 3
): Promise<TeamMember[]> {
  const members = await getTeamMembers();
  return members
    .filter((m) => m.id !== currentId && (m.category === category || category === "pi"))
    .slice(0, limit);
}
