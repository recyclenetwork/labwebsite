import { createClient } from "@/lib/supabase/client";
import { adminMutate } from "@/lib/supabase/admin-mutate";
import { ProjectFormData, ProjectStatus, ProjectWithRelations } from "./types";
import { getLocalProjects, saveLocalProjects } from "./queries";
import { getCachedTeamMembers } from "@/lib/team/store";
import { getAllResearchAreas } from "@/lib/research-areas/store";

/**
 * Upload an image to Supabase Storage 'project-media' bucket
 */
export async function uploadProjectMedia(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  const filePath = `projects/${fileName}`;

  const { data, error } = await supabase.storage
    .from("project-media")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.warn("Storage upload failed or bucket restricted, generating local object URL:", error.message);
    return URL.createObjectURL(file);
  }

  const { data: { publicUrl } } = supabase.storage
    .from("project-media")
    .getPublicUrl(data.path);

  return publicUrl;
}

/**
 * Record an action to the admin_activity audit table
 */
export async function logProjectActivity(
  action: string,
  projectId: string,
  metadata: Record<string, any> = {}
) {
  try {
    const supabase = createClient();
    await (supabase as any).from("admin_activity").insert([
      {
        action,
        entity_type: "project",
        entity_id: projectId,
        metadata,
      },
    ]);
  } catch {
    // silently catch if activity table not accessible
  }
}

/**
 * Create a new project with relations
 */
export async function createProject(formData: ProjectFormData): Promise<ProjectWithRelations> {
  const supabase = createClient();
  const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let newId = formData.id || `proj-${Date.now()}`;

  const projectPayload = {
    title: formData.title,
    slug,
    short_description: formData.short_description,
    full_description: formData.full_description,
    status: formData.status,
    start_date: formData.start_date || null,
    end_date: formData.end_date || null,
    year: formData.year || (formData.start_date ? new Date(formData.start_date).getFullYear().toString() : "2026"),
    funding_info: formData.funding_info || null,
    funding_org: formData.funding_org || null,
    grant_amount: formData.grant_amount || null,
    research_question: formData.research_question || null,
    objectives: formData.objectives || [],
    methodology: formData.methodology || null,
    study_area: formData.study_area || null,
    study_area_description: formData.study_area_description || null,
    findings: formData.findings || null,
    outputs: formData.outputs || null,
    hero_image: formData.hero_image || null,
    image_alt: formData.image_alt || formData.title,
    featured_image: formData.hero_image || null,
    gallery: formData.gallery || [],
    display_order: formData.display_order ?? 0,
    is_featured: formData.is_featured,
    is_published: formData.is_published,
    published_at: formData.is_published ? new Date().toISOString() : null,
  };

  // Attempt server mutation via adminMutate (bypasses RLS)
  try {
    const res = await adminMutate("project", "create", {
      projectPayload,
      research_area_ids: formData.research_area_ids,
      researcher_assignments: formData.researcher_assignments,
      collaborators: formData.collaborators,
    });
    if (res?.data?.id) {
      newId = res.data.id;
    }
  } catch (err) {
    console.warn("Project server mutation error:", err);
  }

  // Update local memory and localStorage store
  const allAreas = getAllResearchAreas();
  const matchedAreas = allAreas.filter((a) => formData.research_area_ids.includes(a.id));
  const matchedResearchers = formData.researcher_assignments.map((ra) => {
    const found = getCachedTeamMembers().find((p) => p.id === ra.person_id);
    return {
      id: ra.person_id,
      name: found?.name || "Researcher",
      slug: found?.slug || "researcher",
      position: found?.role || "Researcher",
      photo_url: found?.imageSrc || null,
      role_in_project: ra.role_in_project,
    };
  });

  const fullProject: ProjectWithRelations = {
    id: newId,
    ...projectPayload,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    research_areas: matchedAreas,
    researchers: matchedResearchers,
    collaborators: formData.collaborators || [],
    publications: [],
  };

  const existing = getLocalProjects();
  saveLocalProjects([fullProject, ...existing]);
  return fullProject;
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  formData: Partial<ProjectFormData>
): Promise<ProjectWithRelations> {
  const supabase = createClient();
  const slug = formData.slug || (formData.title ? formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") : undefined);

  const updatePayload: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (formData.title !== undefined) updatePayload.title = formData.title;
  if (slug !== undefined) updatePayload.slug = slug;
  if (formData.short_description !== undefined) updatePayload.short_description = formData.short_description;
  if (formData.full_description !== undefined) updatePayload.full_description = formData.full_description;
  if (formData.status !== undefined) updatePayload.status = formData.status;
  if (formData.start_date !== undefined) updatePayload.start_date = formData.start_date;
  if (formData.end_date !== undefined) updatePayload.end_date = formData.end_date;
  if (formData.year !== undefined) updatePayload.year = formData.year;
  if (formData.funding_info !== undefined) updatePayload.funding_info = formData.funding_info;
  if (formData.funding_org !== undefined) updatePayload.funding_org = formData.funding_org;
  if (formData.grant_amount !== undefined) updatePayload.grant_amount = formData.grant_amount;
  if (formData.research_question !== undefined) updatePayload.research_question = formData.research_question;
  if (formData.objectives !== undefined) updatePayload.objectives = formData.objectives;
  if (formData.methodology !== undefined) updatePayload.methodology = formData.methodology;
  if (formData.study_area !== undefined) updatePayload.study_area = formData.study_area;
  if (formData.study_area_description !== undefined) updatePayload.study_area_description = formData.study_area_description;
  if (formData.findings !== undefined) updatePayload.findings = formData.findings;
  if (formData.outputs !== undefined) updatePayload.outputs = formData.outputs;
  if (formData.hero_image !== undefined) {
    updatePayload.hero_image = formData.hero_image;
    updatePayload.featured_image = formData.hero_image;
  }
  if (formData.image_alt !== undefined) updatePayload.image_alt = formData.image_alt;
  if (formData.gallery !== undefined) updatePayload.gallery = formData.gallery;
  if (formData.display_order !== undefined) updatePayload.display_order = formData.display_order;
  if (formData.is_featured !== undefined) updatePayload.is_featured = formData.is_featured;
  if (formData.is_published !== undefined) {
    updatePayload.is_published = formData.is_published;
    if (formData.is_published) {
      updatePayload.published_at = new Date().toISOString();
    }
  }

  try {
    await adminMutate(
      "project",
      "update",
      {
        updatePayload,
        research_area_ids: formData.research_area_ids,
        researcher_assignments: formData.researcher_assignments,
        collaborators: formData.collaborators,
      },
      id
    );
    await logProjectActivity("Project updated", id, { fields: Object.keys(updatePayload) });
  } catch (err) {
    console.warn("Supabase project update failed:", err);
  }

  // Update local memory and storage
  const existing = getLocalProjects();
  const index = existing.findIndex((p) => p.id === id);
  if (index !== -1) {
    const matchedResearchers = formData.researcher_assignments
      ? formData.researcher_assignments.map((ra) => {
          const found = getCachedTeamMembers().find((p) => p.id === ra.person_id);
          return {
            id: ra.person_id,
            name: found?.name || "Researcher",
            slug: found?.slug || "researcher",
            position: found?.role || "Researcher",
            photo_url: found?.imageSrc || null,
            role_in_project: ra.role_in_project,
          };
        })
      : existing[index].researchers;

    const allAreas = getAllResearchAreas();
    const updated = {
      ...existing[index],
      ...updatePayload,
      research_areas: formData.research_area_ids
        ? allAreas.filter((a) => formData.research_area_ids?.includes(a.id))
        : existing[index].research_areas,
      researchers: matchedResearchers,
      collaborators: formData.collaborators !== undefined ? formData.collaborators : existing[index].collaborators,
    };
    existing[index] = updated;
    saveLocalProjects([...existing]);
    return updated;
  }

  return existing[0];
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  try {
    await adminMutate("project", "delete", undefined, id);
    await logProjectActivity("Project deleted", id);
  } catch (err) {
    console.warn("Supabase delete failed:", err);
  }

  const existing = getLocalProjects();
  saveLocalProjects(existing.filter((p) => p.id !== id));
  return true;
}

/**
 * Toggle Published / Draft State
 */
export async function toggleProjectPublish(id: string, is_published: boolean): Promise<void> {
  await updateProject(id, { is_published });
}

/**
 * Toggle Featured State
 */
export async function toggleProjectFeatured(id: string, is_featured: boolean): Promise<void> {
  await updateProject(id, { is_featured });
}

/**
 * Update Project Status (ongoing | completed | archived)
 */
export async function updateProjectStatus(id: string, status: ProjectStatus): Promise<void> {
  await updateProject(id, { status });
}
