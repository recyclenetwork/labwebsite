"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAdminTheme } from "@/lib/admin-theme";
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  Star,
  Globe,
  Lock,
  Archive,
  ArrowUpRight,
  Upload,
  X,
  PlusCircle,
  Sparkles,
  Calendar,
  Building2,
  Users,
  FlaskConical,
  Filter,
  Check,
  RefreshCw,
  ArrowLeft,
  Layers,
  FileText,
  Target,
  Image as ImageIcon,
  Share2,
  SlidersHorizontal,
  ExternalLink,
  Camera
} from "lucide-react";
import { ProjectWithRelations, ProjectStatus, ProjectFormData, ProjectResearchArea } from "@/lib/projects/types";
import { getPublishedProjects, getResearchAreas, getLocalProjects, saveLocalProjects } from "@/lib/projects/queries";
import {
  createProject,
  updateProject,
  deleteProject,
  toggleProjectPublish,
  toggleProjectFeatured,
  uploadProjectMedia,
} from "@/lib/projects/mutations";
import {
  getAllResearchAreas,
  createResearchArea,
  updateResearchArea,
  deleteResearchArea,
} from "@/lib/research-areas/store";
import { getTeamMembers, saveTeamMember } from "@/lib/team/store";
import { TeamMember, TeamCategory } from "@/lib/team/types";

export default function AdminProjectsPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";

  const [projects, setProjects] = useState<ProjectWithRelations[]>([]);
  const [researchAreas, setResearchAreas] = useState<ProjectResearchArea[]>(getAllResearchAreas());
  const [teamResearchers, setTeamResearchers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Dynamic Thematic Research Focus Areas
  const [showNewAreaForm, setShowNewAreaForm] = useState(false);
  const [newAreaTitle, setNewAreaTitle] = useState("");
  const [newAreaDesc, setNewAreaDesc] = useState("");
  const [creatingArea, setCreatingArea] = useState(false);
  const [editingAreaId, setEditingAreaId] = useState<string | null>(null);
  const [editAreaTitle, setEditAreaTitle] = useState("");
  const [editAreaDesc, setEditAreaDesc] = useState("");
  const [savingAreaEdit, setSavingAreaEdit] = useState(false);

  // Dynamic Researcher inline addition
  const [showNewResearcherForm, setShowNewResearcherForm] = useState(false);
  const [newResearcherName, setNewResearcherName] = useState("");
  const [newResearcherRole, setNewResearcherRole] = useState("Research Fellow");
  const [newResearcherCategory, setNewResearcherCategory] = useState<TeamCategory>("graduate");
  const [newResearcherAffiliation, setNewResearcherAffiliation] = useState("Jahangirnagar University");
  const [creatingResearcher, setCreatingResearcher] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // Full-page Editor View state
  const [isEditing, setIsEditing] = useState(false);
  const [editorSection, setEditorSection] = useState<"all" | "basic" | "science" | "people" | "areas" | "grant" | "media" | "visibility">("all");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingGalleryIndex, setUploadingGalleryIndex] = useState<number | null>(null);
  const [statusNotification, setStatusNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState: ProjectFormData = {
    id: "",
    title: "",
    slug: "",
    short_description: "",
    full_description: "",
    status: "ongoing",
    start_date: "",
    end_date: "",
    year: "",
    funding_org: "",
    grant_amount: "",
    funding_info: "",
    research_question: "",
    objectives: [""],
    methodology: "",
    study_area: "",
    study_area_description: "",
    hero_image: "",
    image_alt: "",
    gallery: [],
    outputs: "",
    findings: "",
    is_featured: false,
    is_published: true,
    display_order: 0,
    research_area_ids: [],
    researcher_assignments: [],
    collaborators: [],
    publication_ids: [],
  };

  const [formData, setFormData] = useState<ProjectFormData>(initialFormState);

  // Dynamically mapped researchers list from real team roster
  const combinedResearchers = React.useMemo(() => {
    return teamResearchers.map((m) => ({
      id: m.id,
      name: m.name,
      slug: m.slug,
      position: m.role || "Researcher",
      photo_url: m.imageSrc || null,
    }));
  }, [teamResearchers]);

  // Load Projects & Team from DB / Access layer
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allProjects, teamList] = await Promise.all([
        getPublishedProjects({}, true), // includeDrafts = true
        getTeamMembers(),
      ]);
      setProjects(allProjects);
      setTeamResearchers(teamList);
      setResearchAreas(getAllResearchAreas());
    } catch (err) {
      console.error("Error loading admin projects:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to local project, research area, and team updates across browser tabs
    const handleUpdate = () => loadData();
    const handleAreasUpdate = () => setResearchAreas(getAllResearchAreas());
    const handleTeamUpdate = async () => {
      const refreshed = await getTeamMembers();
      setTeamResearchers(refreshed);
    };

    window.addEventListener("lab_projects_updated", handleUpdate);
    window.addEventListener("lab_research_areas_updated", handleAreasUpdate);
    window.addEventListener("lab_team_updated", handleTeamUpdate);

    return () => {
      window.removeEventListener("lab_projects_updated", handleUpdate);
      window.removeEventListener("lab_research_areas_updated", handleAreasUpdate);
      window.removeEventListener("lab_team_updated", handleTeamUpdate);
    };
  }, []);

  // Filtered projects
  const filteredProjects = projects.filter((proj) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = proj.title.toLowerCase().includes(q);
      const matchSlug = proj.slug.toLowerCase().includes(q);
      const matchDesc = (proj.short_description || "").toLowerCase().includes(q);
      const matchArea = proj.research_areas?.some((a) => a.title.toLowerCase().includes(q));
      if (!matchTitle && !matchSlug && !matchDesc && !matchArea) return false;
    }
    if (statusFilter !== "all" && proj.status !== statusFilter) return false;
    if (publishedFilter === "published" && !proj.is_published) return false;
    if (publishedFilter === "draft" && proj.is_published) return false;
    if (featuredFilter === "featured" && !proj.is_featured) return false;
    return true;
  });

  // Open Add Screen (Full Page)
  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      research_area_ids: researchAreas.length > 0 ? [researchAreas[0].id] : [],
      researcher_assignments: teamResearchers.length > 0
        ? [{ person_id: teamResearchers[0].id, role_in_project: "Principal Investigator" }]
        : [],
      collaborators: [
        { name: "Jahangirnagar University", institution: "Dept. of Environmental Sciences", role: "Academic Host" },
      ],
    });
    setEditorSection("all");
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open Edit Screen (Full Page)
  const handleOpenEdit = (proj: ProjectWithRelations) => {
    setFormData({
      id: proj.id,
      title: proj.title,
      slug: proj.slug,
      short_description: proj.short_description,
      full_description: proj.full_description || "",
      status: proj.status,
      start_date: proj.start_date || "",
      end_date: proj.end_date || "",
      year: proj.year || "",
      funding_org: proj.funding_org || "",
      grant_amount: proj.grant_amount || "",
      funding_info: proj.funding_info || "",
      research_question: proj.research_question || "",
      objectives: proj.objectives && proj.objectives.length > 0 ? proj.objectives : [""],
      methodology: proj.methodology || "",
      study_area: proj.study_area || "",
      study_area_description: proj.study_area_description || "",
      hero_image: proj.hero_image || "",
      image_alt: proj.image_alt || proj.title,
      gallery: proj.gallery || [],
      outputs: proj.outputs || "",
      findings: proj.findings || "",
      is_featured: proj.is_featured,
      is_published: proj.is_published,
      display_order: proj.display_order || 0,
      research_area_ids: proj.research_areas?.map((a) => a.id) || [],
      researcher_assignments: proj.researchers?.map((r) => ({
        person_id: r.id,
        role_in_project: r.role_in_project || "Researcher",
      })) || [],
      collaborators: proj.collaborators || [],
      publication_ids: proj.publications?.map((p) => p.id) || [],
    });
    setEditorSection("all");
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Auto-generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setFormData((prev) => ({
      ...prev,
      title: val,
      slug: prev.id ? prev.slug : generatedSlug,
    }));
  };

  // Hero Image Upload handler
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const publicUrl = await uploadProjectMedia(file);
      setFormData((prev) => ({
        ...prev,
        hero_image: publicUrl,
        image_alt: prev.image_alt || prev.title,
      }));
      setStatusNotification({ type: "success", message: "Hero image uploaded to project-media storage!" });
    } catch {
      setStatusNotification({ type: "error", message: "Failed to upload hero image." });
    } finally {
      setUploadingImage(false);
    }
  };

  // Gallery Image Upload handler (up to 4 images)
  const handleGalleryImageUpload = async (file: File, index: number) => {
    setUploadingGalleryIndex(index);
    try {
      const publicUrl = await uploadProjectMedia(file);
      const currentGallery = [...(formData.gallery || [])];
      currentGallery[index] = publicUrl;
      setFormData((prev) => ({
        ...prev,
        gallery: currentGallery,
      }));
      setStatusNotification({ type: "success", message: `Gallery photo 0${index + 1} uploaded to storage!` });
    } catch {
      setStatusNotification({ type: "error", message: `Failed to upload gallery photo 0${index + 1}.` });
    } finally {
      setUploadingGalleryIndex(null);
    }
  };

  // Create New Thematic Research Area / Focus Pillar Inline
  const handleCreateNewArea = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAreaTitle.trim()) {
      setStatusNotification({ type: "error", message: "Please enter a title for the new research pillar." });
      return;
    }
    setCreatingArea(true);
    try {
      const created = await createResearchArea(newAreaTitle, newAreaDesc);
      const updatedAreas = getAllResearchAreas();
      setResearchAreas(updatedAreas);
      setFormData((prev) => ({
        ...prev,
        research_area_ids: [...(prev.research_area_ids || []), created.id],
      }));
      setNewAreaTitle("");
      setNewAreaDesc("");
      setShowNewAreaForm(false);
      setStatusNotification({
        type: "success",
        message: `✨ Created and tagged new research focus pillar: "${created.title}"!`,
      });
    } catch (err: any) {
      setStatusNotification({ type: "error", message: err.message || "Failed to create research pillar." });
    } finally {
      setCreatingArea(false);
    }
  };

  // Start editing a research area
  const handleStartEditArea = (area: ProjectResearchArea, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingAreaId(area.id);
    setEditAreaTitle(area.title);
    setEditAreaDesc(area.description || "");
  };

  // Save edited research area
  const handleSaveEditArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAreaId || !editAreaTitle.trim()) return;
    setSavingAreaEdit(true);
    try {
      await updateResearchArea(editingAreaId, {
        title: editAreaTitle.trim(),
        description: editAreaDesc.trim(),
      });
      const updatedAreas = getAllResearchAreas();
      setResearchAreas(updatedAreas);
      setEditingAreaId(null);
      setStatusNotification({
        type: "success",
        message: `✨ Research focus pillar updated successfully!`,
      });
    } catch (err: any) {
      setStatusNotification({ type: "error", message: "Failed to update pillar: " + (err.message || String(err)) });
    } finally {
      setSavingAreaEdit(false);
    }
  };

  // Delete research area
  const handleDeleteArea = async (areaId: string, areaTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Are you sure you want to remove the research pillar "${areaTitle}"?`)) return;
    try {
      await deleteResearchArea(areaId);
      const updatedAreas = getAllResearchAreas();
      setResearchAreas(updatedAreas);
      setFormData((prev) => ({
        ...prev,
        research_area_ids: (prev.research_area_ids || []).filter((id) => id !== areaId),
      }));
      if (editingAreaId === areaId) setEditingAreaId(null);
      setStatusNotification({
        type: "success",
        message: `Removed research pillar "${areaTitle}".`,
      });
    } catch (err: any) {
      setStatusNotification({ type: "error", message: "Failed to delete pillar: " + (err.message || String(err)) });
    }
  };

  // Quick inline researcher creation
  const handleCreateNewResearcher = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newResearcherName.trim()) {
      setStatusNotification({ type: "error", message: "Please enter researcher's full name." });
      return;
    }
    setCreatingResearcher(true);
    try {
      const created = await saveTeamMember({
        name: newResearcherName.trim(),
        role: newResearcherRole.trim() || "Research Fellow",
        category: newResearcherCategory,
        affiliation: newResearcherAffiliation.trim() || "Jahangirnagar University",
        department: "Department of Environmental Sciences",
      });
      const refreshed = await getTeamMembers();
      setTeamResearchers(refreshed);
      setFormData((prev) => ({
        ...prev,
        researcher_assignments: [
          ...prev.researcher_assignments,
          { person_id: created.id, role_in_project: newResearcherRole || "Researcher" },
        ],
      }));
      setNewResearcherName("");
      setNewResearcherRole("Research Fellow");
      setShowNewResearcherForm(false);
      window.dispatchEvent(new CustomEvent("lab_team_updated"));
      setStatusNotification({
        type: "success",
        message: `✨ Added "${created.name}" to team and assigned to project!`,
      });
    } catch (err: any) {
      setStatusNotification({ type: "error", message: "Failed to add researcher: " + (err.message || String(err)) });
    } finally {
      setCreatingResearcher(false);
    }
  };

  // Save Project Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a project title.");
      return;
    }

    setSaving(true);
    setStatusNotification(null);

    try {
      const cleanObjectives = formData.objectives.filter((o) => o.trim().length > 0);
      const cleanGallery = (formData.gallery || []).filter((g) => g && g.trim().length > 0);

      const payload: ProjectFormData = {
        ...formData,
        objectives: cleanObjectives,
        gallery: cleanGallery,
        slug: formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      };

      if (formData.id) {
        await updateProject(formData.id, payload);
        setStatusNotification({ type: "success", message: "Project updated successfully." });
      } else {
        await createProject(payload);
        setStatusNotification({ type: "success", message: "New research project created." });
      }

      setIsEditing(false);
      await loadData();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setStatusNotification({ type: "error", message: err?.message || "Failed to save project." });
    } finally {
      setSaving(false);
    }
  };

  // Quick Toggle Publish
  const handleTogglePublish = async (id: string, currentState: boolean) => {
    startTransition(async () => {
      await toggleProjectPublish(id, !currentState);
      await loadData();
    });
  };

  // Quick Toggle Featured
  const handleToggleFeatured = async (id: string, currentState: boolean) => {
    startTransition(async () => {
      await toggleProjectFeatured(id, !currentState);
      await loadData();
    });
  };

  // Delete Project
  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await deleteProject(deleteConfirmId);
      setStatusNotification({ type: "success", message: "Project deleted successfully." });
      setDeleteConfirmId(null);
      await loadData();
    } catch (err) {
      console.warn("Delete fallback:", err);
      const existing = getLocalProjects();
      saveLocalProjects(existing.filter((p: ProjectWithRelations) => p.id !== deleteConfirmId));
      setStatusNotification({ type: "success", message: "Project deleted successfully." });
      setDeleteConfirmId(null);
      await loadData();
    }
  };

  // Helper styles
  const cardBg = isLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0F172A] border-slate-800 shadow-md";
  const subText = isLight ? "text-slate-500" : "text-slate-400";
  const headingText = isLight ? "text-slate-900" : "text-white";
  const inputBg = isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-500" : "bg-[#090D16] border-slate-700 text-white focus:border-emerald-400";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* ========================================================================= */}
      {/* 1. FULL PAGE PROJECT EDITOR STUDIO (WHEN isEditing === true)               */}
      {/* ========================================================================= */}
      {isEditing ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Sticky Action Bar */}
          <div className={`sticky top-0 z-30 p-4 sm:p-5 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isLight ? "bg-white/95 border-slate-200" : "bg-[#0D1526]/95 border-slate-800"
          }`}>
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`p-2 rounded-xl border transition flex items-center gap-2 text-xs font-semibold ${
                  isLight ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Projects</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {formData.id ? "Edit Mode" : "New Project"}
                  </span>
                  <span className={`text-xs font-mono ${subText}`}>
                    {formData.slug ? `/projects/${formData.slug}` : "/projects/..."}
                  </span>
                </div>
                <h1 className={`text-lg sm:text-xl font-extrabold truncate max-w-lg ${headingText} mt-0.5`}>
                  {formData.title || "Untitled Research Project"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {formData.slug && (
                <Link
                  href={`/projects/${formData.slug}`}
                  target="_blank"
                  className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    isLight ? "border-slate-200 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Preview Page</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                  isLight ? "border-slate-300 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Project</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Section Filter Bar */}
          <div className={`p-2 rounded-2xl border flex items-center gap-1.5 overflow-x-auto ${cardBg}`}>
            {[
              { id: "all", label: "All Sections", icon: Layers },
              { id: "basic", label: "01 Overview & Identity", icon: FileText },
              { id: "science", label: "02 Scientific Content", icon: Target },
              { id: "people", label: "03 Personnel & Partners", icon: Users },
              { id: "areas", label: "04 Research Areas", icon: FlaskConical },
              { id: "grant", label: "05 Status & Grant", icon: Calendar },
              { id: "media", label: "06 Media & Images", icon: ImageIcon },
              { id: "visibility", label: "07 Publishing", icon: Globe },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = editorSection === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setEditorSection(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm font-bold"
                      : isLight
                      ? "text-slate-600 hover:bg-slate-100"
                      : "text-slate-400 hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form Content - Clean, Full-Width Structured Layout */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. OVERVIEW & IDENTITY */}
            {(editorSection === "all" || editorSection === "basic") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      01. General Overview &amp; Narrative
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Primary headline, slug identifier, and expanded contextual background.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8">
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Project Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleTitleChange}
                        placeholder="e.g. Microplastic Exposure in Freshwater Ecosystems: Trophic Transfer & Biomagnification"
                        className={`w-full px-4 py-3 text-sm sm:text-base font-medium rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Slug (URL Identifier) <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-500 shrink-0">
                          /projects/
                        </span>
                        <input
                          type="text"
                          required
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          placeholder="microplastic-exposure-freshwater"
                          className={`w-full px-3 py-3 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Short Description (Archive Summary Card) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.short_description}
                      onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                      placeholder="Brief 1-2 sentence synopsis featured across the public project directory cards..."
                      className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Full Project Overview &amp; Expanded Narrative
                    </label>
                    <textarea
                      rows={7}
                      value={formData.full_description}
                      onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                      placeholder="Provide detailed background, scientific rationale, field sampling context, and comprehensive narrative for the project detail page..."
                      className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition leading-relaxed ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. SCIENTIFIC CORE & METHODOLOGY */}
            {(editorSection === "all" || editorSection === "science") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      02. Scientific Core &amp; Methodology
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Hypothesis, step-by-step milestones, analytical sequences, and field stations.
                    </p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Core Research Question / Hypothesis
                    </label>
                    <textarea
                      rows={2}
                      value={formData.research_question}
                      onChange={(e) => setFormData({ ...formData, research_question: e.target.value })}
                      placeholder="What primary scientific hypothesis or investigative question does this grant resolve?"
                      className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  {/* Dynamic Milestone Objectives */}
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>
                          Project Objectives &amp; Milestones
                        </label>
                        <p className={`text-[11px] ${subText}`}>
                          Rendered as ordered milestone cards on public project detail page.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, objectives: [...(formData.objectives || []), ""] })}
                        className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-100 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>Add Milestone</span>
                      </button>
                    </div>

                    {(!formData.objectives || formData.objectives.length === 0) ? (
                      <div className={`p-5 rounded-2xl border border-dashed text-center ${subText} text-xs space-y-2`}>
                        <p>No objectives configured yet.</p>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, objectives: [""] })}
                          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 underline"
                        >
                          + Add first objective
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {formData.objectives.map((obj, idx) => (
                          <div key={idx} className="flex items-center gap-2.5">
                            <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                              {String(idx + 1).padStart(2, "0")}
                            </span>
                            <input
                              type="text"
                              value={obj}
                              onChange={(e) => {
                                const updated = [...formData.objectives];
                                updated[idx] = e.target.value;
                                setFormData({ ...formData, objectives: updated });
                              }}
                              placeholder={`Milestone Objective ${idx + 1}...`}
                              className={`flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition ${inputBg}`}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.objectives.filter((_, i) => i !== idx);
                                setFormData({ ...formData, objectives: updated });
                              }}
                              className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                              title="Remove milestone"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Methodology */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${headingText}`}>
                      Methodology Sequence
                    </label>
                    <p className={`text-[11px] ${subText} mb-2`}>
                      Analytical workflow sequence. Use &quot;→&quot; to demarcate progressive phases.
                    </p>
                    <textarea
                      rows={3}
                      value={formData.methodology}
                      onChange={(e) => setFormData({ ...formData, methodology: e.target.value })}
                      placeholder="e.g. NOAA manta trawl sampling → Alkaline KOH tissue digestion → μ-FTIR spectral mapping → Toxicogenomic biomarker profiling"
                      className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  {/* Study Area & Deliverables Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Study Area / Location Name
                      </label>
                      <input
                        type="text"
                        value={formData.study_area}
                        onChange={(e) => setFormData({ ...formData, study_area: e.target.value })}
                        placeholder="e.g. Meghna River Estuary & Coastal Transects"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Outputs &amp; Deliverables
                      </label>
                      <input
                        type="text"
                        value={formData.outputs}
                        onChange={(e) => setFormData({ ...formData, outputs: e.target.value })}
                        placeholder="e.g. 3 Peer Papers, 1 Open Spectral Library, Policy Brief"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Study Area Detailed Description &amp; GPS Network
                    </label>
                    <textarea
                      rows={2}
                      value={formData.study_area_description}
                      onChange={(e) => setFormData({ ...formData, study_area_description: e.target.value })}
                      placeholder="Geographic coordinates, environmental conditions, and sampling station network details..."
                      className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. PERSONNEL & COLLABORATING PARTNERS */}
            {(editorSection === "all" || editorSection === "people") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-base font-bold ${headingText}`}>
                        03. Personnel &amp; Global Collaborators
                      </h2>
                      <p className={`text-xs ${subText}`}>
                        Lab investigators assigned to project and collaborating institutional partners.
                      </p>
                    </div>
                  </div>

                  {/* Inline Add New Team Member Button */}
                  <button
                    type="button"
                    onClick={() => setShowNewResearcherForm(!showNewResearcherForm)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Quick Add New Researcher</span>
                  </button>
                </div>

                {/* Inline New Researcher Creator Form */}
                {showNewResearcherForm && (
                  <div
                    className={`p-5 rounded-2xl border space-y-4 animate-in fade-in duration-200 ${
                      isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-950/20 border-emerald-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>
                          Add New Lab Personnel to Roster
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewResearcherForm(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      <div className="sm:col-span-2">
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${headingText}`}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={newResearcherName}
                          onChange={(e) => setNewResearcherName(e.target.value)}
                          placeholder="e.g. Dr. Farzana Rahman"
                          className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${headingText}`}>
                          Designation / Role
                        </label>
                        <input
                          type="text"
                          value={newResearcherRole}
                          onChange={(e) => setNewResearcherRole(e.target.value)}
                          placeholder="e.g. Postdoctoral Fellow"
                          className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${headingText}`}>
                          Roster Category
                        </label>
                        <select
                          value={newResearcherCategory}
                          onChange={(e) => setNewResearcherCategory(e.target.value as TeamCategory)}
                          className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                        >
                          <option value="pi">Principal Investigator</option>
                          <option value="phd">Postdoc &amp; PhD Researchers</option>
                          <option value="graduate">Graduate Researchers</option>
                          <option value="undergraduate">Undergraduate Researchers</option>
                          <option value="alumni">Lab Alumni</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowNewResearcherForm(false)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                          isLight
                            ? "border-slate-300 hover:bg-slate-100 text-slate-700"
                            : "border-slate-700 hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateNewResearcher()}
                        disabled={creatingResearcher || !newResearcherName.trim()}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {creatingResearcher ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Adding to Roster...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Add &amp; Assign to Project</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Researcher Assignment */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>
                          Lab Researchers &amp; Investigators
                        </label>
                        <p className={`text-[11px] ${subText}`}>
                          Select from official lab team roster and define specific investigation roles.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            researcher_assignments: [
                              ...formData.researcher_assignments,
                              {
                                person_id: combinedResearchers[0]?.id || "res-1",
                                role_in_project: "Researcher",
                              },
                            ],
                          })
                        }
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Assign Person
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.researcher_assignments.map((assignment, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50"
                        >
                          <select
                            value={assignment.person_id}
                            onChange={(e) => {
                              const updated = [...formData.researcher_assignments];
                              updated[idx].person_id = e.target.value;
                              setFormData({ ...formData, researcher_assignments: updated });
                            }}
                            className={`w-full sm:w-1/2 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition ${inputBg}`}
                          >
                            {combinedResearchers.map((person) => (
                              <option key={person.id} value={person.id}>
                                {person.name} ({person.position})
                              </option>
                            ))}
                          </select>

                          <input
                            type="text"
                            value={assignment.role_in_project}
                            onChange={(e) => {
                              const updated = [...formData.researcher_assignments];
                              updated[idx].role_in_project = e.target.value;
                              setFormData({ ...formData, researcher_assignments: updated });
                            }}
                            placeholder="Role (e.g. PI, Lead Analyst, Field Lead)"
                            className={`w-full sm:flex-1 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border outline-none transition ${inputBg}`}
                          />

                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.researcher_assignments.filter((_, i) => i !== idx);
                              setFormData({ ...formData, researcher_assignments: updated });
                            }}
                            className="p-2.5 text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                            title="Remove assignment"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Collaborating Institutions */}
                  <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>
                        Collaborating Institutions &amp; Partners
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            collaborators: [
                              ...formData.collaborators,
                              { name: "", institution: "", role: "Collaborating Partner" },
                            ],
                          })
                        }
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> Add Partner
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.collaborators.map((collab, idx) => (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row items-center gap-2.5 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50"
                        >
                          <input
                            type="text"
                            value={collab.name}
                            onChange={(e) => {
                              const updated = [...formData.collaborators];
                              updated[idx].name = e.target.value;
                              setFormData({ ...formData, collaborators: updated });
                            }}
                            placeholder="Organization Name"
                            className={`w-full sm:w-1/3 px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                          />
                          <input
                            type="text"
                            value={collab.institution}
                            onChange={(e) => {
                              const updated = [...formData.collaborators];
                              updated[idx].institution = e.target.value;
                              setFormData({ ...formData, collaborators: updated });
                            }}
                            placeholder="Department / Division"
                            className={`w-full sm:w-1/3 px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                          />
                          <input
                            type="text"
                            value={collab.role}
                            onChange={(e) => {
                              const updated = [...formData.collaborators];
                              updated[idx].role = e.target.value;
                              setFormData({ ...formData, collaborators: updated });
                            }}
                            placeholder="Partnership Role"
                            className={`w-full sm:flex-1 px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.collaborators.filter((_, i) => i !== idx);
                              setFormData({ ...formData, collaborators: updated });
                            }}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. RESEARCH PILLARS & THEMATIC AREAS */}
            {(editorSection === "all" || editorSection === "areas") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-base font-bold ${headingText}`}>
                        04. Research Focus Pillars &amp; Thematic Disciplines
                      </h2>
                      <p className={`text-xs ${subText}`}>
                        Tag scientific focus areas and create or manage thematic categories.
                      </p>
                    </div>
                  </div>

                  {/* Button to Add New Thematic Area */}
                  <button
                    type="button"
                    onClick={() => setShowNewAreaForm(!showNewAreaForm)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Thematic Area</span>
                  </button>
                </div>

                {/* Inline Creation Form for New Thematic Area */}
                {showNewAreaForm && (
                  <div
                    className={`p-5 rounded-2xl border space-y-4 animate-in fade-in duration-200 ${
                      isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-950/20 border-emerald-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>
                          Create New Scientific Pillar / Category
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowNewAreaForm(false)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${headingText}`}>
                          Discipline Title *
                        </label>
                        <input
                          type="text"
                          value={newAreaTitle}
                          onChange={(e) => setNewAreaTitle(e.target.value)}
                          placeholder="e.g. Coastal Ecotoxicology &amp; Biogeochemistry"
                          className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[11px] font-bold uppercase tracking-wider mb-1 ${headingText}`}>
                          Brief Focus / Description (Optional)
                        </label>
                        <input
                          type="text"
                          value={newAreaDesc}
                          onChange={(e) => setNewAreaDesc(e.target.value)}
                          placeholder="e.g. Marine micro-debris mapping and ecotoxicity testing"
                          className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowNewAreaForm(false)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition ${
                          isLight
                            ? "border-slate-300 hover:bg-slate-100 text-slate-700"
                            : "border-slate-700 hover:bg-slate-800 text-slate-300"
                        }`}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCreateNewArea()}
                        disabled={creatingArea || !newAreaTitle.trim()}
                        className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        {creatingArea ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Creating...</span>
                          </>
                        ) : (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Save &amp; Tag Pillar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Grid of Research Focus Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {researchAreas.map((area) => {
                    const isSelected = formData.research_area_ids.includes(area.id);
                    const isBeingEdited = editingAreaId === area.id;

                    if (isBeingEdited) {
                      return (
                        <div
                          key={area.id}
                          className={`p-4 rounded-2xl border space-y-3 ${
                            isLight
                              ? "bg-amber-50/60 border-amber-300"
                              : "bg-amber-950/20 border-amber-700/60"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400">
                            <span>Edit Thematic Pillar</span>
                            <button
                              type="button"
                              onClick={() => setEditingAreaId(null)}
                              className="p-1 hover:text-slate-600 dark:hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <input
                            type="text"
                            value={editAreaTitle}
                            onChange={(e) => setEditAreaTitle(e.target.value)}
                            placeholder="Pillar Title"
                            className={`w-full px-3 py-1.5 text-xs font-bold rounded-lg border outline-none ${inputBg}`}
                          />

                          <textarea
                            rows={2}
                            value={editAreaDesc}
                            onChange={(e) => setEditAreaDesc(e.target.value)}
                            placeholder="Scientific focus summary..."
                            className={`w-full px-3 py-1.5 text-[11px] rounded-lg border outline-none ${inputBg}`}
                          />

                          <div className="flex items-center justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingAreaId(null)}
                              className="px-2.5 py-1 text-[11px] font-semibold rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSaveEditArea}
                              disabled={savingAreaEdit || !editAreaTitle.trim()}
                              className="px-3 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1"
                            >
                              {savingAreaEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              <span>Save</span>
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={area.id}
                        onClick={() => {
                          if (isSelected) {
                            setFormData({
                              ...formData,
                              research_area_ids: formData.research_area_ids.filter((id) => id !== area.id),
                            });
                          } else {
                            setFormData({
                              ...formData,
                              research_area_ids: [...formData.research_area_ids, area.id],
                            });
                          }
                        }}
                        className={`group relative p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 shadow-sm"
                            : isLight
                            ? "border-slate-200 hover:border-slate-300 bg-slate-50/50"
                            : "border-slate-800 hover:border-slate-700 bg-slate-900/40"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-slate-400 dark:border-slate-600"
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>

                        <div className="flex-1 pr-6">
                          <div className="font-bold text-xs sm:text-sm">{area.title}</div>
                          {area.description && (
                            <div className={`text-[11px] ${subText} line-clamp-2 mt-1`}>
                              {area.description}
                            </div>
                          )}
                        </div>

                        {/* Edit & Delete Action Buttons */}
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          <button
                            type="button"
                            onClick={(e) => handleStartEditArea(area, e)}
                            title="Edit this discipline title & description"
                            className="p-1 rounded-md text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteArea(area.id, area.title, e)}
                            title="Delete this discipline"
                            className="p-1 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. STATUS, TIMELINE & GRANT FUNDING */}
            {(editorSection === "all" || editorSection === "grant") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      05. Status, Timeline &amp; Grant Funding
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Project lifecycle phase, grant agency sponsor, allocation, and award credentials.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Project Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                      className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    >
                      <option value="ongoing">● Ongoing Research</option>
                      <option value="completed">● Completed &amp; Published</option>
                      <option value="archived">● Archived Past Grant</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Timeline Display
                    </label>
                    <input
                      type="text"
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                      placeholder="e.g. 2025 — 2027"
                      className={`w-full px-4 py-3 text-sm font-mono rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Grant Amount
                    </label>
                    <input
                      type="text"
                      value={formData.grant_amount}
                      onChange={(e) => setFormData({ ...formData, grant_amount: e.target.value })}
                      placeholder="e.g. BDT 3.6M ($32,000 USD)"
                      className={`w-full px-4 py-3 text-sm font-mono rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Funding Agency / Sponsor
                    </label>
                    <input
                      type="text"
                      value={formData.funding_org}
                      onChange={(e) => setFormData({ ...formData, funding_org: e.target.value })}
                      placeholder="e.g. Ministry of Science & Technology (MoST)"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Grant Reference / Award Info
                    </label>
                    <input
                      type="text"
                      value={formData.funding_info}
                      onChange={(e) => setFormData({ ...formData, funding_info: e.target.value })}
                      placeholder="e.g. National Grant #MoST-ENV-2024-88"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 6. HERO BANNER & PROJECT GALLERY (MAX 4 IMAGES) */}
            {(editorSection === "all" || editorSection === "media") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-8 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      06. Hero Banner &amp; Project Visual Gallery
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Configure the flagship cover image and up to 4 scientific fieldwork / laboratory photos.
                    </p>
                  </div>
                </div>

                {/* Sub-block A: Primary Hero Banner */}
                <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#090D16] space-y-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${headingText}`}>
                      Primary Project Hero Banner
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Hero Preview Canvas */}
                    <div className="md:col-span-5 aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 relative border border-slate-200 dark:border-slate-800 shadow-md">
                      {formData.hero_image ? (
                        <Image
                          src={formData.hero_image}
                          alt="Hero Preview"
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                          <Upload className="w-8 h-8 opacity-50" />
                          <span className="text-xs font-mono">No Hero Banner Configured</span>
                        </div>
                      )}
                    </div>

                    {/* Hero Upload & Direct URL Controls */}
                    <div className="md:col-span-7 space-y-3.5">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${headingText}`}>
                          Upload Hero Image to Storage (bucket: project-media)
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFile}
                          disabled={uploadingImage}
                          className={`w-full text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 ${subText} cursor-pointer`}
                        />
                        {uploadingImage && (
                          <div className="flex items-center gap-2 text-xs text-emerald-600 mt-1.5 font-medium">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Uploading hero image to storage...
                          </div>
                        )}
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${headingText}`}>
                          Or Direct Hero Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.hero_image}
                          onChange={(e) => setFormData({ ...formData, hero_image: e.target.value })}
                          placeholder="https://images.unsplash.com/..."
                          className={`w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${headingText}`}>
                          Hero Image Accessibility Alt Text (SEO)
                        </label>
                        <input
                          type="text"
                          value={formData.image_alt}
                          onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                          placeholder="Descriptive accessibility label..."
                          className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-block B: Project Gallery (Max 4 Photos in a Balanced 2x2 Grid) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Camera className="w-5 h-5 text-emerald-500" />
                      <h3 className={`text-sm sm:text-base font-bold ${headingText}`}>
                        Fieldwork &amp; Laboratory Gallery (Up to 4 Photos)
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {(formData.gallery || []).length} / 4 Photos Configured
                    </span>
                  </div>
                  <p className={`text-xs ${subText}`}>
                    These photos appear in the interactive 4-card research gallery on the project detail page.
                  </p>

                  {/* 2x2 Responsive Photo Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {(formData.gallery || []).slice(0, 4).map((url, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#090D16] space-y-3.5 shadow-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span>Photo Slot 0{idx + 1}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = (formData.gallery || []).filter((_, i) => i !== idx);
                              setFormData({ ...formData, gallery: updated });
                            }}
                            className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-500/10 rounded-xl transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                            title="Remove this photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        </div>

                        {/* Image preview thumbnail */}
                        <div className="w-full aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 relative border border-slate-200 dark:border-slate-700">
                          {url ? (
                            <Image
                              src={url}
                              alt={`Gallery image 0${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1">
                              <ImageIcon className="w-6 h-6 opacity-40" />
                              <span>Empty photo slot</span>
                            </div>
                          )}
                        </div>

                        {/* Upload to Supabase */}
                        <div>
                          <label className={`block text-[11px] font-mono ${subText} mb-1`}>
                            Upload file to Supabase:
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={uploadingGalleryIndex === idx}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleGalleryImageUpload(file, idx);
                            }}
                            className={`w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 ${subText} cursor-pointer`}
                          />
                          {uploadingGalleryIndex === idx && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-600 mt-1 font-medium">
                              <Loader2 className="w-3 h-3 animate-spin" /> Uploading photo 0{idx + 1}...
                            </div>
                          )}
                        </div>

                        {/* Direct URL input */}
                        <div>
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => {
                              const updated = [...(formData.gallery || [])];
                              updated[idx] = e.target.value;
                              setFormData({ ...formData, gallery: updated });
                            }}
                            placeholder="Or direct image URL (https://...)"
                            className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Slot Button (Max 4) */}
                  {(!formData.gallery || formData.gallery.length < 4) && (
                    <button
                      type="button"
                      onClick={() => {
                        const current = formData.gallery || [];
                        if (current.length < 4) {
                          setFormData({ ...formData, gallery: [...current, ""] });
                        }
                      }}
                      className="w-full py-4 rounded-3xl border-2 border-dashed border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition text-xs font-bold flex items-center justify-center gap-2 cursor-pointer mt-3"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>+ Add Gallery Photo Slot ({(formData.gallery || []).length}/4)</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 7. PUBLISHING & VISIBILITY */}
            {(editorSection === "all" || editorSection === "visibility") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      07. Publishing &amp; Public Visibility
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Draft controls, spotlight feature on homepage, and archive sorting order.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Public Status Toggle */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Public Publication Status
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        {formData.is_published ? "Visible on live public portal" : "Hidden draft mode only"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_published: !formData.is_published })}
                      className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        formData.is_published
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-amber-600 text-white"
                      }`}
                    >
                      {formData.is_published ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> PUBLISHED
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> DRAFT ONLY
                        </>
                      )}
                    </button>
                  </div>

                  {/* Featured Spotlight Toggle */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Spotlight Feature
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Promoted on laboratory homepage
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                      className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        formData.is_featured
                          ? "bg-amber-500 text-slate-950 shadow-sm"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      <Star className={`w-4 h-4 ${formData.is_featured ? "fill-slate-950" : ""}`} />
                      <span>{formData.is_featured ? "FEATURED SPOTLIGHT" : "STANDARD PROJECT"}</span>
                    </button>
                  </div>

                  {/* Display Order Priority */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-2">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1 ${headingText}`}>
                        Display Priority Index
                      </label>
                      <p className={`text-[11px] ${subText}`}>
                        Lower integers (e.g. 1, 2) appear first.
                      </p>
                    </div>
                    <input
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2.5 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save & Cancel Bar */}
            <div className={`p-6 rounded-3xl border flex items-center justify-between ${cardBg}`}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`px-5 py-2.5 text-xs font-semibold rounded-xl border transition ${
                  isLight ? "border-slate-300 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
              >
                ← Back to Project List
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Project...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Project Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. PROJECT DIRECTORY LIST VIEW                                            */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FolderGit2 className="w-5 h-5" />
                </span>
                <h1 className={`text-2xl font-bold tracking-tight ${headingText}`}>
                  Research Projects &amp; Grants CMS
                </h1>
              </div>
              <p className={`text-xs md:text-sm ${subText} mt-1.5`}>
                Manage the laboratory&apos;s active and completed research projects. All changes dynamically reflect on the public research portal.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadData}
                title="Refresh database"
                className={`p-2.5 rounded-xl border transition-colors ${
                  isLight ? "border-slate-200 hover:bg-slate-100 text-slate-600" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
              </button>

              <Link
                href="/projects"
                target="_blank"
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                  isLight ? "border-slate-300 bg-white hover:bg-slate-50 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>View Public Portal</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Research Project</span>
              </button>
            </div>
          </div>

          {/* Status Notification */}
          {statusNotification && (
            <div
              className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm animate-in fade-in duration-200 ${
                statusNotification.type === "success"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                  : "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {statusNotification.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>{statusNotification.message}</span>
              </div>
              <button
                onClick={() => setStatusNotification(null)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <span className={`text-xs font-mono uppercase tracking-wider ${subText}`}>Total Projects</span>
              <div className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400 font-mono">
                {projects.length}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <span className={`text-xs font-mono uppercase tracking-wider ${subText}`}>Ongoing</span>
              <div className="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400 font-mono">
                {projects.filter((p) => p.status === "ongoing").length}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <span className={`text-xs font-mono uppercase tracking-wider ${subText}`}>Completed</span>
              <div className="text-2xl font-bold mt-1 text-amber-600 dark:text-amber-400 font-mono">
                {projects.filter((p) => p.status === "completed").length}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <span className={`text-xs font-mono uppercase tracking-wider ${subText}`}>Featured</span>
              <div className="text-2xl font-bold mt-1 text-purple-600 dark:text-purple-400 font-mono">
                {projects.filter((p) => p.is_featured).length}
              </div>
            </div>
          </div>

          {/* Search & Filter Strip */}
          <div className={`p-4 rounded-2xl border ${cardBg} space-y-3`}>
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${subText}`} />
                <input
                  type="text"
                  placeholder="Search title, slug, area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                >
                  <option value="all">Status: All</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>

                {/* Published Filter */}
                <select
                  value={publishedFilter}
                  onChange={(e) => setPublishedFilter(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                >
                  <option value="all">Visibility: All</option>
                  <option value="published">Published Only</option>
                  <option value="draft">Draft Only</option>
                </select>

                {/* Featured Filter */}
                <select
                  value={featuredFilter}
                  onChange={(e) => setFeaturedFilter(e.target.value)}
                  className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                >
                  <option value="all">Spotlight: All</option>
                  <option value="featured">Featured Only</option>
                  <option value="standard">Standard Only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className={`rounded-2xl border overflow-hidden ${cardBg}`}>
            {isLoading ? (
              <div className="p-16 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
                <p className={`text-xs font-mono ${subText}`}>Loading research projects database...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-16 text-center space-y-4">
                <FlaskConical className="w-12 h-12 text-slate-400 mx-auto opacity-40" />
                <div className={`text-sm font-semibold ${headingText}`}>No research projects found</div>
                <p className={`text-xs ${subText} max-w-sm mx-auto`}>
                  {searchQuery ? "Try refining your search query or reset the active filter options." : "Click below to initialize your first research project."}
                </p>
                <button
                  onClick={handleOpenAdd}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Research Project</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`border-b text-[11px] font-mono uppercase tracking-wider ${isLight ? "bg-slate-50/80 text-slate-500 border-slate-200" : "bg-[#0B1120] text-slate-400 border-slate-800"}`}>
                      <th className="py-3 px-4">Thumbnail</th>
                      <th className="py-3 px-4">Title &amp; Path</th>
                      <th className="py-3 px-4">Research Areas</th>
                      <th className="py-3 px-4">Timeline &amp; Grant</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Public</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
                    {filteredProjects.map((proj) => (
                      <tr
                        key={proj.id}
                        className={`transition-colors ${
                          isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-900/50"
                        }`}
                      >
                        {/* Thumbnail */}
                        <td className="py-3.5 px-4">
                          <div className="w-14 h-12 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 relative border border-slate-300 dark:border-slate-700 shrink-0">
                            {proj.hero_image ? (
                              <Image
                                src={proj.hero_image}
                                alt={proj.title}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <FlaskConical className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & Slug */}
                        <td className="py-3.5 px-4 max-w-sm">
                          <div className="font-semibold text-sm line-clamp-1 text-slate-900 dark:text-white">
                            {proj.title}
                          </div>
                          <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 truncate mt-0.5">
                            /projects/{proj.slug}
                          </div>
                          <div className={`text-[11px] ${subText} line-clamp-1 mt-1`}>
                            {proj.short_description}
                          </div>
                        </td>

                        {/* Research Areas */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {proj.research_areas && proj.research_areas.length > 0 ? (
                              proj.research_areas.map((a) => (
                                <span
                                  key={a.id}
                                  className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                                >
                                  {a.title}
                                </span>
                              ))
                            ) : (
                              <span className={`text-[11px] ${subText} italic`}>Unassigned</span>
                            )}
                          </div>
                        </td>

                        {/* Timeline & Funding */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{proj.year || "2025 — 2027"}</span>
                          </div>
                          {proj.funding_org && (
                            <div className={`text-[11px] ${subText} flex items-center gap-1 mt-1 truncate max-w-[180px]`}>
                              <Building2 className="w-3 h-3 shrink-0" />
                              <span className="truncate">{proj.funding_org}</span>
                            </div>
                          )}
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold uppercase tracking-wider ${
                              proj.status === "ongoing"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                                : proj.status === "completed"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700"
                            }`}
                          >
                            ● {proj.status}
                          </span>
                        </td>

                        {/* Published Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleTogglePublish(proj.id, proj.is_published)}
                            disabled={isPending}
                            title={proj.is_published ? "Click to set as Draft" : "Click to Publish"}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                              proj.is_published
                                ? "text-emerald-600 hover:bg-emerald-500/10"
                                : "text-amber-500 hover:bg-amber-500/10"
                            }`}
                          >
                            {proj.is_published ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Lock className="w-5 h-5 opacity-70" />
                            )}
                          </button>
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleToggleFeatured(proj.id, proj.is_featured)}
                            disabled={isPending}
                            title={proj.is_featured ? "Featured Spotlight" : "Standard Project"}
                            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                              proj.is_featured
                                ? "text-amber-500 hover:bg-amber-500/10"
                                : "text-slate-400 hover:bg-slate-500/10 opacity-50 hover:opacity-100"
                            }`}
                          >
                            <Star className={`w-5 h-5 ${proj.is_featured ? "fill-amber-400" : ""}`} />
                          </button>
                        </td>

                        {/* Row Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/projects/${proj.slug}`}
                              target="_blank"
                              title="View Public Detail Page"
                              className={`p-2 rounded-xl transition ${
                                isLight ? "hover:bg-slate-200 text-slate-600" : "hover:bg-slate-800 text-slate-400 hover:text-white"
                              }`}
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <button
                              onClick={() => handleOpenEdit(proj)}
                              title="Edit Project Details (Full Page)"
                              className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(proj.id)}
                              title="Delete Project"
                              className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                  */}
      {/* ========================================================================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl space-y-4 ${isLight ? "bg-white border-slate-200" : "bg-[#0D1526] border-slate-700"}`}>
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Confirm Deletion
              </h3>
            </div>
            <p className={`text-xs md:text-sm ${subText}`}>
              Are you sure you want to remove this research project? This action will permanently remove the record and all associated relation links.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition cursor-pointer ${
                  isLight ? "border-slate-300 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm transition cursor-pointer"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
