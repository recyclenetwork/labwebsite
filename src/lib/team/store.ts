import { TeamMember, TeamCategory } from "./types";
import { INITIAL_TEAM_MEMBERS } from "./seed-data";
import { createClient } from "@/lib/supabase/client";
import { idbGet, idbSet, idbDelete, safeLocalStorageSet, safeLocalStorageGet } from "@/lib/storage/idb-storage";

const LOCAL_STORAGE_KEY = "ecotox_lab_team_members_v1";

export function getCachedTeamMembers(): TeamMember[] {
  if (typeof window !== "undefined") {
    const cached = safeLocalStorageGet<TeamMember[]>(LOCAL_STORAGE_KEY);
    if (Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
  }
  return INITIAL_TEAM_MEMBERS;
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

    if (!error && data && data.length > 0) {
      const mapped: TeamMember[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        slug: row.slug || row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        role: row.role || row.designation || "Researcher",
        category: (row.category as TeamCategory) || "graduate",
        department: row.department || "Department of Environmental Sciences",
        affiliation: row.affiliation || "Jahangirnagar University",
        bio: row.bio || "",
        researchInterests: Array.isArray(row.research_interests)
          ? row.research_interests
          : row.research_interests ? row.research_interests.split(",") : [],
        education: Array.isArray(row.education) ? row.education : [],
        email: row.email || "",
        phone: row.phone || "",
        officeLocation: row.office_location || "",
        googleScholarUrl: row.google_scholar_url || "",
        orcid: row.orcid || "",
        researchGateUrl: row.researchgate_url || "",
        linkedinUrl: row.linkedin_url || "",
        websiteUrl: row.website_url || "",
        imageSrc: row.image_url || row.image_src || row.photo_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
        quote: row.quote || "",
        publicationsCount: row.publications_count,
        citationsCount: row.citations_count,
        hIndex: row.h_index,
        grantsCount: row.grants_count,
        advisingCount: row.advising_count,
        thesisTopic: row.thesis_topic || "",
        advisor: row.advisor || "",
        expectedGraduation: row.expected_graduation || "",
        currentPosition: row.current_position || "",
        currentInstitution: row.current_institution || "",
        alumniYear: row.alumni_year || "",
        pastRole: row.past_role || "",
        orderIndex: row.order_index || 0,
        isActive: row.is_active ?? true,
      }));

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
        return idbData;
      }
    } catch (e) {
      console.warn("IndexedDB read error:", e);
    }

    // 3. Check localStorage in browser
    const cached = safeLocalStorageGet<TeamMember[]>(LOCAL_STORAGE_KEY);
    if (Array.isArray(cached) && cached.length > 0) {
      // Migrate to IndexedDB
      await idbSet(LOCAL_STORAGE_KEY, cached);
      return cached;
    }
  }

  // 4. Fallback to rich seed data
  if (typeof window !== "undefined") {
    await idbSet(LOCAL_STORAGE_KEY, INITIAL_TEAM_MEMBERS);
    safeLocalStorageSet(LOCAL_STORAGE_KEY, INITIAL_TEAM_MEMBERS);
  }
  return INITIAL_TEAM_MEMBERS;
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

    if (isNew) {
      await (supabase as any).from("people").insert([payload]);
    } else {
      await (supabase as any).from("people").update(payload).eq("id", completeMember.id);
    }
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
    const supabase = createClient();
    await (supabase as any).from("people").delete().eq("id", id);
  } catch (err) {
    // Ignore
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

  // Check initial seed data fallback
  const seedFound = INITIAL_TEAM_MEMBERS.find(
    (m) =>
      m.slug === slug ||
      m.id === slug ||
      m.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") === slug
  );
  return seedFound || null;
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
