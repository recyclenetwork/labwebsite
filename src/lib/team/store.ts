import { TeamMember, TeamCategory } from "./types";
import { createClient } from "@/lib/supabase/client";
import { adminMutate } from "@/lib/supabase/admin-mutate";
import { idbGet, idbSet, idbDelete, safeLocalStorageSet, safeLocalStorageGet } from "@/lib/storage/idb-storage";

const LOCAL_STORAGE_KEY = "ecotox_lab_team_members_v1";

export function cleanTeamList(items: any[]): TeamMember[] {
  if (!Array.isArray(items)) return [];
  return items.filter((m) => {
    if (!m || typeof m !== "object") return false;
    const name = String(m.name || "").trim().toLowerCase();
    const id = String(m.id || "");
    if (
      ["person-1", "person-2", "person-3", "person-4", "person-5", "member-1", "member-2"].includes(id) &&
      (name === "dr. demo" || name === "sample researcher" || name === "unnamed researcher" || !m.name)
    ) {
      return false;
    }
    return Boolean(m.name && String(m.name).trim());
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
  let localMembersMap: Record<string, TeamMember> = {};
  let localList: TeamMember[] = [];

  if (typeof window !== "undefined") {
    try {
      const idbData = await idbGet<TeamMember[]>(LOCAL_STORAGE_KEY);
      if (Array.isArray(idbData) && idbData.length > 0) {
        localList = cleanTeamList(idbData);
      }
    } catch {}
    if (localList.length === 0) {
      const ls = safeLocalStorageGet<TeamMember[]>(LOCAL_STORAGE_KEY);
      if (Array.isArray(ls) && ls.length > 0) {
        localList = cleanTeamList(ls);
      }
    }
    localList.forEach((m) => {
      if (m?.id) localMembersMap[m.id] = m;
    });
  }

  // 1. Try Supabase first
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from("people")
      .select("*")
      .order("order_index", { ascending: true });

    if (!error && Array.isArray(data)) {
      if (data.length === 0) {
        // If Supabase is empty, but we have locally saved members (e.g. newly created), preserve and sync them!
        if (localList.length > 0) {
          for (const m of localList) {
            saveTeamMember(m).catch(() => {});
          }
          return localList;
        }

        if (typeof window !== "undefined") {
          await idbSet(LOCAL_STORAGE_KEY, []);
          safeLocalStorageSet(LOCAL_STORAGE_KEY, []);
        }
        return [];
      }

      const validCategories: TeamCategory[] = ["pi", "phd", "graduate", "undergraduate", "alumni"];

      const mapped: TeamMember[] = cleanTeamList(
        data.map((row: any) => {
          const local = localMembersMap[row.id] || {};
          const matchedCategory: TeamCategory = validCategories.includes(row.category)
            ? (row.category as TeamCategory)
            : validCategories.includes(local.category)
            ? local.category
            : "undergraduate";

          return {
            id: row.id,
            name: row.name,
            slug: row.slug || (row.name ? row.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") : `member-${row.id}`),
            role: row.role || row.position || row.designation || local.role || "",
            category: matchedCategory,
            department: row.department || local.department || "Department of Environmental Sciences",
            affiliation: row.affiliation || local.affiliation || "Jahangirnagar University",
            email: row.email || local.email || "",
            phone: row.phone || local.phone || "",
            officeLocation: row.office_location || local.officeLocation || "",
            googleScholarUrl: row.google_scholar_url || row.google_scholar || local.googleScholarUrl || "",
            orcid: row.orcid || local.orcid || "",
            researchGateUrl: row.researchgate_url || local.researchGateUrl || "",
            linkedinUrl: row.linkedin_url || local.linkedinUrl || "",
            websiteUrl: row.website_url || row.website || local.websiteUrl || "",
            bio: row.bio || row.biography || local.bio || "",
            quote: row.quote || local.quote || "",
            researchInterests: Array.isArray(row.research_interests)
              ? row.research_interests
              : row.research_interests
              ? String(row.research_interests).split(",").map((s: string) => s.trim())
              : local.researchInterests || [],
            education: Array.isArray(row.education) ? row.education : local.education || [],
            skills: local.skills || [],
            awards: local.awards || [],
            publications: local.publications || [],
            imageSrc: row.photo_url || row.image_url || local.imageSrc || "/images/slide-2-lab.jpg",
            imageAlt: row.name,
            publicationsCount: row.publications_count !== null && row.publications_count !== undefined ? String(row.publications_count) : local.publicationsCount || "0",
            citationsCount: row.citations_count !== null && row.citations_count !== undefined ? String(row.citations_count) : local.citationsCount || "0",
            hIndex: row.h_index !== null && row.h_index !== undefined ? String(row.h_index) : local.hIndex || "0",
            grantsCount: row.grants_count !== null && row.grants_count !== undefined ? String(row.grants_count) : local.grantsCount || "0",
            advisingCount: row.advising_count !== null && row.advising_count !== undefined ? String(row.advising_count) : local.advisingCount || "0",
            thesisTopic: row.thesis_topic || local.thesisTopic || "",
            advisor: row.advisor || local.advisor || "",
            expectedGraduation: row.expected_graduation || local.expectedGraduation || "",
            undergradThesis: local.undergradThesis || "",
            undergradDescription: local.undergradDescription || "",
            mscThesis: local.mscThesis || "",
            mscDescription: local.mscDescription || "",
            phdThesis: local.phdThesis || "",
            phdDescription: local.phdDescription || "",
            currentPosition: row.current_position || local.currentPosition || "",
            currentInstitution: row.current_institution || local.currentInstitution || "",
            alumniYear: row.alumni_year || local.alumniYear || "",
            pastRole: row.past_role || local.pastRole || "",
            orderIndex: row.order_index ?? row.display_order ?? local.orderIndex ?? 0,
            isActive: row.is_active ?? local.isActive ?? true,
          };
        })
      );

      // Cache locally
      await idbSet(LOCAL_STORAGE_KEY, mapped);
      safeLocalStorageSet(LOCAL_STORAGE_KEY, mapped);
      return mapped;
    }
  } catch (err) {
    // Supabase query failed, fallback
  }

  // 2. Check local storage if Supabase failed or offline
  if (localList.length > 0) {
    return localList;
  }

  return [];
}

export async function saveTeamMember(member: Partial<TeamMember>): Promise<TeamMember> {
  const current = await getTeamMembers();
  let updatedList: TeamMember[];

  const nowId = member.id && member.id.trim() !== "" ? member.id : `team-${Date.now()}`;
  const isNew = !member.id || !current.some((m) => m.id === member.id);
  const slug = member.slug || (member.name ? member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : `member-${Date.now()}`);

  const completeMember: TeamMember = {
    id: nowId,
    name: member.name || "Unnamed Researcher",
    slug,
    role: member.role || "Research Fellow",
    category: (member.category as TeamCategory) || "graduate",
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
    updatedList = [completeMember, ...current.filter((m) => m.id !== completeMember.id)];
  } else {
    updatedList = current.map((m) => (m.id === completeMember.id ? completeMember : m));
  }

  // 1. Always save directly into IndexedDB (guaranteed success)
  if (typeof window !== "undefined") {
    await idbSet(LOCAL_STORAGE_KEY, updatedList);
    // 2. Mirror into localStorage safely with quota protection
    safeLocalStorageSet(LOCAL_STORAGE_KEY, updatedList);
  }

  // 3. Prepare payload for Supabase people table (always includes id)
  const payload: Record<string, any> = {
    id: completeMember.id,
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
    orcid: completeMember.orcid,
    researchgate_url: completeMember.researchGateUrl,
    linkedin_url: completeMember.linkedinUrl,
    website: completeMember.websiteUrl,
    website_url: completeMember.websiteUrl,
    photo_url: completeMember.imageSrc,
    image_url: completeMember.imageSrc,
    quote: completeMember.quote,
    research_interests: completeMember.researchInterests,
    education: completeMember.education,
    publications_count: completeMember.publicationsCount ? String(completeMember.publicationsCount) : null,
    citations_count: completeMember.citationsCount ? String(completeMember.citationsCount) : null,
    h_index: completeMember.hIndex ? String(completeMember.hIndex) : null,
    grants_count: completeMember.grantsCount ? String(completeMember.grantsCount) : null,
    advising_count: completeMember.advisingCount ? String(completeMember.advisingCount) : null,
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

  // 4. Try saving to Supabase
  let directSuccess = false;
  if (typeof window !== "undefined") {
    try {
      const supabase = createClient();
      const { data: upsertData, error: clientErr } = await (supabase as any)
        .from("people")
        .upsert([payload])
        .select()
        .single();
      if (!clientErr && upsertData) {
        directSuccess = true;
      }
    } catch (e) {
      // client-side attempt error, fall through to adminMutate
    }
  }

  if (!directSuccess) {
    try {
      const mutateRes = await adminMutate("person", "upsert", { personPayload: payload });
      if (!mutateRes?.success) {
        console.warn("adminMutate save warning:", mutateRes?.error);
      }
    } catch (err) {
      console.warn("Supabase team save sync warning:", err);
    }
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

  if (typeof window !== "undefined") {
    try {
      const supabase = createClient();
      await (supabase as any).from("people").delete().eq("id", id);
    } catch {}
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
