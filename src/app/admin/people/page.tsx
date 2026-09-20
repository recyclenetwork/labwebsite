"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";
import {
  Users,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  GraduationCap,
  Award,
  BookOpen,
  Sparkles,
  Mail,
  Compass,
  X,
  Layers,
  FlaskConical,
  Filter,
  Check,
  RefreshCw,
  FileText,
  Clock,
  Eye,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Tag,
  Building2,
  MapPin,
  Globe,
  Quote,
  MoveUp,
  MoveDown,
  ArrowLeft,
  Image as ImageIcon,
  Share2,
  Phone,
  Lock,
  Star,
  Upload,
  Info
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getTeamMembers, saveTeamMember, deleteTeamMember } from "@/lib/team/store";
import { TeamMember, TeamCategory, MemberPublication } from "@/lib/team/types";
import { TEAM_CATEGORIES_META } from "@/lib/team/seed-data";
import { safeCompressImage } from "@/lib/image-compression";
import { pruneOversizedLocalStorage } from "@/lib/storage/idb-storage";

export default function AdminTeamPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Full-Page Studio View State
  const [isEditing, setIsEditing] = useState(false);
  const [editorSection, setEditorSection] = useState<
    "all" | "basic" | "media" | "bio" | "theses" | "publications" | "alumni" | "social" | "visibility"
  >("all");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState: Partial<TeamMember> = {
    id: "",
    name: "",
    slug: "",
    role: "",
    category: "undergraduate",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "",
    quote: "",
    researchInterests: [],
    skills: [],
    awards: [],
    education: [],
    publications: [],
    undergradThesis: "",
    undergradDescription: "",
    mscThesis: "",
    mscDescription: "",
    phdThesis: "",
    phdDescription: "",
    thesisTopic: "",
    advisor: "",
    expectedGraduation: "",
    currentPosition: "",
    currentInstitution: "",
    alumniYear: "",
    pastRole: "",
    email: "",
    phone: "",
    officeLocation: "",
    googleScholarUrl: "",
    orcid: "",
    researchGateUrl: "",
    linkedinUrl: "",
    websiteUrl: "",
    imageSrc:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    orderIndex: 0,
    isActive: true,
  };

  const [formData, setFormData] = useState<Partial<TeamMember>>(initialFormState);
  const [interestsInput, setInterestsInput] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [awardsInput, setAwardsInput] = useState("");
  const [educationInput, setEducationInput] = useState("");

  // Thesis section toggle states (determines which thesis tracks show up for this member)
  const [hasOngoingThesis, setHasOngoingThesis] = useState(false);
  const [hasUndergradThesis, setHasUndergradThesis] = useState(false);
  const [hasMscThesis, setHasMscThesis] = useState(false);
  const [hasPhdThesis, setHasPhdThesis] = useState(false);

  // Publication sub-form in editor
  const [pubForm, setPubForm] = useState<MemberPublication>({
    title: "",
    journal: "",
    year: new Date().getFullYear(),
    doi: "",
    role: "First Author",
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getTeamMembers();
      setMembers(data);
    } catch (e) {
      console.error("Failed to load team members", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    pruneOversizedLocalStorage();
    loadData();
  }, []);

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.currentPosition?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.currentInstitution?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.undergradThesis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.mscThesis?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phdThesis?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" || m.category === categoryFilter;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && m.isActive !== false) ||
      (statusFilter === "inactive" && m.isActive === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Metric counts
  const totalCount = members.length;
  const piCount = members.filter((m) => m.category === "pi").length;
  const phdCount = members.filter((m) => m.category === "phd").length;
  const gradCount = members.filter((m) => m.category === "graduate").length;
  const ugCount = members.filter((m) => m.category === "undergraduate").length;
  const alumniCount = members.filter((m) => m.category === "alumni").length;
  const activeCount = members.filter((m) => m.isActive !== false).length;

  const handleOpenAdd = () => {
    setFormData({
      ...initialFormState,
      orderIndex: members.length + 1,
    });
    setInterestsInput("");
    setSkillsInput("");
    setAwardsInput("");
    setEducationInput("");
    setHasOngoingThesis(false);
    setHasUndergradThesis(false);
    setHasMscThesis(false);
    setHasPhdThesis(false);
    setEditorSection("all");
    setIsEditing(true);
    setStatusMessage(null);
  };

  const handleOpenEdit = (member: TeamMember) => {
    setFormData({ ...member });
    setInterestsInput((member.researchInterests || []).join(", "));
    setSkillsInput((member.skills || []).join(", "));
    setAwardsInput((member.awards || []).join("\n"));
    setEducationInput((member.education || []).join("\n"));
    setHasOngoingThesis(Boolean(member.thesisTopic || member.advisor || member.expectedGraduation));
    setHasUndergradThesis(Boolean(member.undergradThesis || member.undergradDescription));
    setHasMscThesis(Boolean(member.mscThesis || member.mscDescription));
    setHasPhdThesis(Boolean(member.phdThesis || member.phdDescription));
    setEditorSection("all");
    setIsEditing(true);
    setStatusMessage(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setStatusMessage({ type: "error", text: "Please enter the researcher's name." });
      return;
    }

    setSaving(true);
    setStatusMessage(null);

    try {
      const interestsArray = interestsInput
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      const skillsArray = skillsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const awardsArray = awardsInput
        .split("\n")
        .map((a) => a.trim())
        .filter(Boolean);

      const educationArray = educationInput
        .split("\n")
        .map((e) => e.trim())
        .filter(Boolean);

      const slug =
        formData.slug ||
        formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      const isAlumniCategory = formData.category === "alumni";

      const payload: Partial<TeamMember> = {
        ...formData,
        slug,
        researchInterests: interestsArray,
        skills: skillsArray,
        awards: awardsArray,
        education: educationArray,
        // Academic Theses & Projects: Clean up fields if track checkbox is not enabled
        thesisTopic: hasOngoingThesis ? (formData.thesisTopic || "") : "",
        advisor: hasOngoingThesis ? (formData.advisor || "") : "",
        expectedGraduation: hasOngoingThesis ? (formData.expectedGraduation || "") : "",
        undergradThesis: hasUndergradThesis ? (formData.undergradThesis || "") : "",
        undergradDescription: hasUndergradThesis ? (formData.undergradDescription || "") : "",
        mscThesis: hasMscThesis ? (formData.mscThesis || "") : "",
        mscDescription: hasMscThesis ? (formData.mscDescription || "") : "",
        phdThesis: hasPhdThesis ? (formData.phdThesis || "") : "",
        phdDescription: hasPhdThesis ? (formData.phdDescription || "") : "",
        // Alumni fields: Only retained if academic category is alumni
        currentPosition: isAlumniCategory ? (formData.currentPosition || "") : "",
        currentInstitution: isAlumniCategory ? (formData.currentInstitution || "") : "",
        alumniYear: isAlumniCategory ? (formData.alumniYear || "") : "",
        pastRole: isAlumniCategory ? (formData.pastRole || "") : "",
      };

      const saved = await saveTeamMember(payload);
      setMembers((prev) => {
        const idx = prev.findIndex((m) => m.id === saved.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = saved;
          return next;
        }
        return [saved, ...prev];
      });

      await loadData();

      setStatusMessage({
        type: "success",
        text: `Researcher "${formData.name}" saved successfully!`,
      });
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: "error", text: "Failed to save team member: " + (err?.message || "Unknown error") });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    try {
      const updated = { ...member, isActive: !member.isActive };
      setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
      await saveTeamMember(updated);
      await loadData();
    } catch (e) {
      console.error("Failed to toggle status", e);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setMembers((prev) => prev.filter((m) => m.id !== id));
      await deleteTeamMember(id);
      await loadData();
      setDeleteConfirmId(null);
      setStatusMessage({ type: "success", text: "Researcher deleted successfully." });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (e) {
      console.error("Failed to delete", e);
      setStatusMessage({ type: "error", text: "Failed to delete researcher." });
    }
  };

  const handleAddPublication = () => {
    if (!pubForm.title.trim()) return;
    const currentPubs = formData.publications || [];
    setFormData({
      ...formData,
      publications: [pubForm, ...currentPubs],
    });
    setPubForm({
      title: "",
      journal: "",
      year: new Date().getFullYear(),
      doi: "",
      role: "First Author",
    });
  };

  // Photo Upload State & Handler
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      setStatusMessage({ type: "error", text: "Image file exceeds 15MB limit. Please choose a smaller image." });
      return;
    }
    setUploadingPhoto(true);
    try {
      // First attempt Supabase Storage upload
      try {
        const supabase = createClient();
        const fileExt = file.name.split(".").pop();
        const fileName = `team/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data, error } = await supabase.storage.from("team-media").upload(fileName, file, { upsert: true });
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from("team-media").getPublicUrl(data.path);
          setFormData((prev) => ({ ...prev, imageSrc: publicUrl }));
          setStatusMessage({ type: "success", text: "Profile photo uploaded to cloud storage!" });
          setUploadingPhoto(false);
          return;
        }
      } catch (e) {
        console.warn("Cloud storage upload fallback:", e);
      }

      // High-performance client-side image compression fallback
      const compressedDataUrl = await safeCompressImage(file, {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.85,
        mimeType: "image/jpeg",
      });

      setFormData((prev) => ({ ...prev, imageSrc: compressedDataUrl }));
      setStatusMessage({ type: "success", text: "Profile photo optimized and staged for saving!" });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: "Failed to process image: " + (err.message || String(err)) });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePublication = (index: number) => {
    const currentPubs = formData.publications || [];
    setFormData({
      ...formData,
      publications: currentPubs.filter((_, idx) => idx !== index),
    });
  };

  // Styling helpers
  const cardBg = isLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0F172A] border-slate-800 shadow-md";
  const subText = isLight ? "text-slate-500" : "text-slate-400";
  const headingText = isLight ? "text-slate-900" : "text-white";
  const inputBg = isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-500" : "bg-[#090D16] border-slate-700 text-white focus:border-emerald-400";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold backdrop-blur-md animate-in slide-in-from-bottom-5 duration-300 ${
            statusMessage.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-300"
              : "bg-rose-950/90 border-rose-500/50 text-rose-300"
          }`}
        >
          {statusMessage.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
          <button
            onClick={() => setStatusMessage(null)}
            className="ml-2 hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. FULL PAGE RESEARCHER STUDIO (WHEN isEditing === true)                   */}
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
                <span className="hidden sm:inline">Back to Personnel</span>
              </button>

              <div className="flex items-center gap-3">
                {formData.imageSrc && (
                  <img
                    src={formData.imageSrc}
                    alt={formData.name || "Avatar"}
                    className="w-10 h-10 rounded-xl object-cover border border-emerald-500/30 shrink-0"
                  />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      {formData.id ? "Edit Researcher Profile" : "Create New Team Member"}
                    </span>
                    <span className={`text-xs font-mono ${subText}`}>
                      {formData.category ? TEAM_CATEGORIES_META[formData.category]?.label : "Researcher"}
                    </span>
                  </div>
                  <h1 className={`text-lg sm:text-xl font-extrabold truncate max-w-lg ${headingText} mt-0.5`}>
                    {formData.name || "Untitled Researcher"}
                  </h1>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {formData.slug && (
                <Link
                  href={`/team/${formData.slug}`}
                  target="_blank"
                  className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    isLight ? "border-slate-200 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>View Public Profile</span>
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
                    <span>Save Researcher</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Section Filter Bar */}
          <div className={`p-2 rounded-2xl border flex items-center gap-1.5 overflow-x-auto ${cardBg}`}>
            {[
              { id: "all", label: "All Sections", icon: Layers },
              { id: "basic", label: "01 Basic Info & Credentials", icon: Users },
              { id: "media", label: "02 Photo & Avatar", icon: ImageIcon },
              { id: "bio", label: "03 Bio & Research Focus", icon: FlaskConical },
              { id: "theses", label: "04 Theses & Projects", icon: BookOpen },
              { id: "publications", label: "05 Publications", icon: FileText },
              ...(formData.category === "alumni"
                ? [{ id: "alumni", label: "06 Alumni Placement", icon: Compass }]
                : []),
              { id: "social", label: "07 Social & Contact", icon: Globe },
              { id: "visibility", label: "08 Visibility & Order", icon: Star },
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

          {/* Form Content */}
          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. BASIC INFO */}
            {(editorSection === "all" || editorSection === "basic") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      01. Basic Information &amp; Academic Credentials
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Full formal name, academic hierarchy tier, institutional affiliation, and profile slug.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Full Name &amp; Academic Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Mohammad S. Kabir"
                        className={`w-full px-4 py-2.5 text-sm font-medium rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        URL Slug (Unique Link Identifier)
                      </label>
                      <input
                        type="text"
                        value={formData.slug || ""}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                        placeholder="e.g. dr-mohammad-s-kabir"
                        className={`w-full px-4 py-2.5 text-sm font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Academic Hierarchy Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category || "undergraduate"}
                        onChange={(e) => {
                          const newCat = e.target.value as TeamCategory;
                          setFormData((prev) => ({ ...prev, category: newCat }));
                          if (newCat !== "alumni" && (editorSection as string) === "alumni") {
                            setEditorSection("all");
                          }
                        }}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      >
                        {Object.entries(TEAM_CATEGORIES_META).map(([key, meta]) => (
                          <option key={key} value={key}>
                            {meta.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Lab Role / Academic Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.role || ""}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        placeholder="e.g. Professor &amp; Principal Investigator"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department || ""}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="e.g. Department of Environmental Sciences"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Affiliation / University
                      </label>
                      <input
                        type="text"
                        value={formData.affiliation || ""}
                        onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
                        placeholder="e.g. Jahangirnagar University"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. PHOTO & MEDIA */}
            {(editorSection === "all" || editorSection === "media") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      02. Profile Photography &amp; Avatar
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Upload high-resolution academic portrait, paste custom URL, or pick a default preset.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Avatar Preview */}
                  <div className="lg:col-span-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${headingText}`}>
                        Live Avatar Preview
                      </label>
                      {formData.imageSrc && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageSrc: "" })}
                          className="text-[11px] text-red-500 hover:underline font-semibold"
                        >
                          Remove Photo
                        </button>
                      )}
                    </div>
                    <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-lg flex items-center justify-center group">
                      {formData.imageSrc ? (
                        <>
                          <img
                            src={formData.imageSrc}
                            alt="Researcher Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-white text-xs font-bold font-mono">
                              1:1 Aspect Ratio Preview
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <Users className="w-16 h-16 text-slate-400 mx-auto opacity-50" />
                          <p className="text-xs text-slate-400 font-medium">No photo uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Upload Controls & Image Guidelines */}
                  <div className="lg:col-span-8 space-y-5">
                    {/* Device Upload Area */}
                    <div className="space-y-2">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${headingText}`}>
                        Upload Photo from Device
                      </label>
                      <div className={`p-5 rounded-2xl border-2 border-dashed transition-all ${
                        isLight ? "border-slate-300 bg-slate-50/50 hover:bg-slate-50" : "border-slate-700 bg-slate-900/30 hover:bg-slate-900/60"
                      }`}>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                              <Upload className="w-5 h-5" />
                            </div>
                            <div>
                              <div className={`text-xs font-bold ${headingText}`}>
                                Select JPG, PNG, or WebP photo
                              </div>
                              <div className={`text-[11px] ${subText}`}>
                                Max file size: 5 MB · Automatically optimized
                              </div>
                            </div>
                          </div>

                          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer whitespace-nowrap">
                            {uploadingPhoto ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Choose Image File</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              disabled={uploadingPhoto}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handlePhotoUpload(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Prominent Aspect Ratio & Dimension Guidelines Note */}
                    <div className={`p-4 rounded-2xl border ${
                      isLight ? "bg-amber-50/70 border-amber-200 text-amber-900" : "bg-amber-950/20 border-amber-800/60 text-amber-200"
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                          <Info className="w-4 h-4" />
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
                            📐 Image Size &amp; Aspect Ratio Guidelines
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed opacity-90">
                            <div>
                              <strong>• Recommended Aspect Ratio:</strong> <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono font-bold">1:1 (Square)</code>
                            </div>
                            <div>
                              <strong>• Optimal Dimensions:</strong> <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono font-bold">800 × 800 px</code> (Min 400×400)
                            </div>
                            <div>
                              <strong>• Supported Formats:</strong> JPG, PNG, WebP (Max 5 MB)
                            </div>
                            <div>
                              <strong>• Framing Tip:</strong> Centered academic headshot with clear lighting
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Direct URL Input */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Or Paste Direct Image URL (HTTPS / Remote Storage)
                      </label>
                      <input
                        type="url"
                        value={formData.imageSrc || ""}
                        onChange={(e) => setFormData({ ...formData, imageSrc: e.target.value })}
                        placeholder="https://images.unsplash.com/... or https://supabase.co/storage/..."
                        className={`w-full px-4 py-2.5 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. BIO & RESEARCH FOCUS */}
            {(editorSection === "all" || editorSection === "bio") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <FlaskConical className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      03. Biography, Statement &amp; Research Focus
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Academic overview, inspiring quote, scientific keywords, technical skills, and honors.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Comprehensive Biography &amp; Scholarly Statement
                    </label>
                    <textarea
                      rows={5}
                      value={formData.bio || ""}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Dr. Kabir is an established Environmental Geochemist specializing in..."
                      className={`w-full p-4 text-sm rounded-xl border outline-none transition resize-y leading-relaxed ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Inspiring Academic Quote / Research Motto
                    </label>
                    <input
                      type="text"
                      value={formData.quote || ""}
                      onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                      placeholder="&quot;Exploring the frontiers of estuarine toxicology to protect coastal ecosystems.&quot;"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Research Interests (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={interestsInput}
                        onChange={(e) => setInterestsInput(e.target.value)}
                        placeholder="Microplastics, Estuarine Toxicology, Heavy Metals"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Technical Skills &amp; Instrumentation (Comma-separated)
                      </label>
                      <input
                        type="text"
                        value={skillsInput}
                        onChange={(e) => setSkillsInput(e.target.value)}
                        placeholder="FTIR Spectroscopy, ICP-MS, R, GIS Mapping"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Academic Education History (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={educationInput}
                        onChange={(e) => setEducationInput(e.target.value)}
                        placeholder={`Ph.D. in Environmental Toxicology, University of Tokyo (2018)\nM.Sc. in Environmental Sciences, JU (2013)`}
                        className={`w-full p-3 text-xs rounded-xl border outline-none transition resize-y ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Awards, Grants &amp; Honors (One per line)
                      </label>
                      <textarea
                        rows={3}
                        value={awardsInput}
                        onChange={(e) => setAwardsInput(e.target.value)}
                        placeholder={`National Science & Tech Fellowship (2024)\nDean's Award for Excellence in Research (2022)`}
                        className={`w-full p-3 text-xs rounded-xl border outline-none transition resize-y ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. THESES & PROJECTS */}
            {(editorSection === "all" || editorSection === "theses") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      04. Academic Theses &amp; Key Projects
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Undergraduate, Master's, or Doctoral dissertation titles, ongoing topics, and principal advisors.
                    </p>
                  </div>
                </div>

                {/* Track Selector Checkboxes */}
                <div className="space-y-3">
                  <label className={`block text-xs font-bold uppercase tracking-wider ${headingText}`}>
                    Select Applicable Thesis / Research Tracks:
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Ongoing / Working Topic Toggle */}
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all select-none ${
                        hasOngoingThesis
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-xs"
                          : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={hasOngoingThesis}
                        onChange={(e) => setHasOngoingThesis(e.target.checked)}
                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold">Active / Working Topic</div>
                        <div className="text-[11px] opacity-75">Working title, advisor &amp; date</div>
                      </div>
                    </label>

                    {/* Undergrad Thesis Toggle */}
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all select-none ${
                        hasUndergradThesis
                          ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-900 dark:text-indigo-200 shadow-xs"
                          : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={hasUndergradThesis}
                        onChange={(e) => setHasUndergradThesis(e.target.checked)}
                        className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold">Undergraduate Thesis</div>
                        <div className="text-[11px] opacity-75">B.Sc. 4th-Year Capstone</div>
                      </div>
                    </label>

                    {/* Master's Thesis Toggle */}
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all select-none ${
                        hasMscThesis
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-900 dark:text-cyan-200 shadow-xs"
                          : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={hasMscThesis}
                        onChange={(e) => setHasMscThesis(e.target.checked)}
                        className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold">Master's (M.Sc.) Thesis</div>
                        <div className="text-[11px] opacity-75">Graduate dissertation</div>
                      </div>
                    </label>

                    {/* Doctoral Thesis Toggle */}
                    <label
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all select-none ${
                        hasPhdThesis
                          ? "bg-teal-500/10 border-teal-500/40 text-teal-900 dark:text-teal-200 shadow-xs"
                          : "bg-slate-50/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={hasPhdThesis}
                        onChange={(e) => setHasPhdThesis(e.target.checked)}
                        className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold">Doctoral (Ph.D.) Thesis</div>
                        <div className="text-[11px] opacity-75">Doctoral research dissertation</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* If none selected */}
                {!hasOngoingThesis && !hasUndergradThesis && !hasMscThesis && !hasPhdThesis && (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center py-6 bg-slate-50/30 dark:bg-slate-900/20">
                    <p className={`text-xs ${subText}`}>
                      No thesis tracks selected. Check any of the boxes above to display input fields for that thesis level.
                    </p>
                  </div>
                )}

                {/* Active / Ongoing Topic Fields */}
                {hasOngoingThesis && (
                  <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-500/20 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Active / Ongoing Research Topic Details
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                          Thesis Topic / Working Title
                        </label>
                        <input
                          type="text"
                          value={formData.thesisTopic || ""}
                          onChange={(e) => setFormData({ ...formData, thesisTopic: e.target.value })}
                          placeholder="e.g. Assessment of microplastic loads in Meghna River"
                          className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                          Principal Advisor / Mentor
                        </label>
                        <input
                          type="text"
                          value={formData.advisor || ""}
                          onChange={(e) => setFormData({ ...formData, advisor: e.target.value })}
                          placeholder="e.g. Prof. Mohammad S. Kabir"
                          className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>

                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                          Expected / Completion Date
                        </label>
                        <input
                          type="text"
                          value={formData.expectedGraduation || ""}
                          onChange={(e) => setFormData({ ...formData, expectedGraduation: e.target.value })}
                          placeholder="e.g. December 2026"
                          className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Individual Thesis Inputs */}
                {(hasUndergradThesis || hasMscThesis || hasPhdThesis) && (
                  <div className="space-y-4 pt-1">
                    {/* Undergrad Thesis */}
                    {hasUndergradThesis && (
                      <div className="p-4 rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-500/20 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5" />
                          Undergraduate (B.Sc.) Thesis
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${headingText}`}>
                              Thesis Title
                            </label>
                            <input
                              type="text"
                              value={formData.undergradThesis || ""}
                              onChange={(e) => setFormData({ ...formData, undergradThesis: e.target.value })}
                              placeholder="e.g. Identification of Microplastic contamination in soil"
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${headingText}`}>
                              Short Summary / Focus (Optional)
                            </label>
                            <input
                              type="text"
                              value={formData.undergradDescription || ""}
                              onChange={(e) => setFormData({ ...formData, undergradDescription: e.target.value })}
                              placeholder="e.g. Characterized sediment and soil polymer distributions."
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Master's Thesis */}
                    {hasMscThesis && (
                      <div className="p-4 rounded-2xl bg-cyan-50/40 dark:bg-cyan-950/10 border border-cyan-500/20 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" />
                          Master of Science (M.Sc.) Thesis
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${headingText}`}>
                              Thesis Title
                            </label>
                            <input
                              type="text"
                              value={formData.mscThesis || ""}
                              onChange={(e) => setFormData({ ...formData, mscThesis: e.target.value })}
                              placeholder="e.g. Toxicological Impact of Synthetic Microfibers on Aquatic Biota"
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${headingText}`}>
                              Short Summary / Focus (Optional)
                            </label>
                            <input
                              type="text"
                              value={formData.mscDescription || ""}
                              onChange={(e) => setFormData({ ...formData, mscDescription: e.target.value })}
                              placeholder="e.g. Evaluated bioaccumulation markers in freshwater teleosts."
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Doctoral Thesis */}
                    {hasPhdThesis && (
                      <div className="p-4 rounded-2xl bg-teal-50/40 dark:bg-teal-950/10 border border-teal-500/20 space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5" />
                          Doctoral (Ph.D.) Dissertation
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${headingText}`}>
                              Dissertation Title
                            </label>
                            <input
                              type="text"
                              value={formData.phdThesis || ""}
                              onChange={(e) => setFormData({ ...formData, phdThesis: e.target.value })}
                              placeholder="e.g. Environmental Fate and Nanoplastic Ecotoxicity in Estuarine Ecosystems"
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs font-semibold mb-1.5 ${headingText}`}>
                              Short Summary / Focus (Optional)
                            </label>
                            <input
                              type="text"
                              value={formData.phdDescription || ""}
                              onChange={(e) => setFormData({ ...formData, phdDescription: e.target.value })}
                              placeholder="e.g. Developed novel chromatographic detection protocols."
                              className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 5. PUBLICATIONS */}
            {(editorSection === "all" || editorSection === "publications") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      05. Selected Key Publications
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Attach prominent journal publications and papers authored by this researcher.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Add Publication Sub-Form */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      + Add Key Publication
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={pubForm.title}
                        onChange={(e) => setPubForm({ ...pubForm, title: e.target.value })}
                        placeholder="Paper Title"
                        className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                      />
                      <input
                        type="text"
                        value={pubForm.journal}
                        onChange={(e) => setPubForm({ ...pubForm, journal: e.target.value })}
                        placeholder="Journal Name"
                        className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="number"
                        value={pubForm.year}
                        onChange={(e) => setPubForm({ ...pubForm, year: parseInt(e.target.value) || 2026 })}
                        placeholder="Year"
                        className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                      />
                      <input
                        type="text"
                        value={pubForm.doi || ""}
                        onChange={(e) => setPubForm({ ...pubForm, doi: e.target.value })}
                        placeholder="DOI (e.g. 10.1016/...)"
                        className={`w-full px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                      />
                      <button
                        type="button"
                        onClick={handleAddPublication}
                        className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition cursor-pointer"
                      >
                        + Add to List
                      </button>
                    </div>
                  </div>

                  {/* Publications List */}
                  {formData.publications && formData.publications.length > 0 ? (
                    <div className="space-y-2">
                      {formData.publications.map((p, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-3 text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">{p.title}</div>
                            <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                              {p.journal} ({p.year}) {p.doi && `· doi:${p.doi}`}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemovePublication(idx)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className={`text-xs ${subText} italic`}>No publications attached yet.</p>
                  )}
                </div>
              </div>
            )}

            {/* 6. ALUMNI PLACEMENT (ONLY VISIBLE IF CATEGORY IS ALUMNI) */}
            {formData.category === "alumni" && (editorSection === "all" || editorSection === "alumni") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Compass className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      06. Alumni Career &amp; Post-Graduation Placement
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Applicable for Alumni members: Track current professional position, company, and graduation year.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Current Job Title / Position
                    </label>
                    <input
                      type="text"
                      value={formData.currentPosition || ""}
                      onChange={(e) => setFormData({ ...formData, currentPosition: e.target.value })}
                      placeholder="e.g. Postdoctoral Fellow"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Current Institution / Company
                    </label>
                    <input
                      type="text"
                      value={formData.currentInstitution || ""}
                      onChange={(e) => setFormData({ ...formData, currentInstitution: e.target.value })}
                      placeholder="e.g. Oxford University / UNESCO"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Graduation Year
                    </label>
                    <input
                      type="text"
                      value={formData.alumniYear || ""}
                      onChange={(e) => setFormData({ ...formData, alumniYear: e.target.value })}
                      placeholder="e.g. 2024"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Past Role in Laboratory
                    </label>
                    <input
                      type="text"
                      value={formData.pastRole || ""}
                      onChange={(e) => setFormData({ ...formData, pastRole: e.target.value })}
                      placeholder="e.g. Former M.Sc. Student"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. SOCIAL & CONTACT */}
            {(editorSection === "all" || editorSection === "social") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      07. Contact Channels &amp; Academic Identity Profiles
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Email, Google Scholar, ORCID, ResearchGate, LinkedIn, and personal website links.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Official Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="researcher@juniv.edu"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={formData.phone || ""}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+880 17..."
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Office Location
                      </label>
                      <input
                        type="text"
                        value={formData.officeLocation || ""}
                        onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                        placeholder="Room 304, Env. Science Bldg"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Google Scholar URL
                      </label>
                      <input
                        type="url"
                        value={formData.googleScholarUrl || ""}
                        onChange={(e) => setFormData({ ...formData, googleScholarUrl: e.target.value })}
                        placeholder="https://scholar.google.com/..."
                        className={`w-full px-3 py-2 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        ORCID ID / URL
                      </label>
                      <input
                        type="text"
                        value={formData.orcid || ""}
                        onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                        placeholder="0000-0002-..."
                        className={`w-full px-3 py-2 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        ResearchGate URL
                      </label>
                      <input
                        type="url"
                        value={formData.researchGateUrl || ""}
                        onChange={(e) => setFormData({ ...formData, researchGateUrl: e.target.value })}
                        placeholder="https://researchgate.net/..."
                        className={`w-full px-3 py-2 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={formData.linkedinUrl || ""}
                        onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                        placeholder="https://linkedin.com/in/..."
                        className={`w-full px-3 py-2 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 8. VISIBILITY & ORDER */}
            {(editorSection === "all" || editorSection === "visibility") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      08. Profile Visibility &amp; Display Priority
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Toggle active public status and manual ordering in team rosters.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Toggle */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Public Status
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Controls whether profile appears in public directory
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                      className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        formData.isActive !== false
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {formData.isActive !== false ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> ACTIVE IN PUBLIC ROSTER
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> HIDDEN / INACTIVE
                        </>
                      )}
                    </button>
                  </div>

                  {/* Display Order Index */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Display Order Index
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Lower numbers (e.g. 1, 2) appear first in the directory
                      </p>
                    </div>
                    <input
                      type="number"
                      value={formData.orderIndex || 0}
                      onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Save Action Bar */}
            <div className={`p-5 rounded-3xl border flex items-center justify-between gap-4 ${cardBg}`}>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className={`px-5 py-2.5 text-xs font-semibold rounded-xl border transition ${
                  isLight ? "border-slate-300 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
              >
                Cancel Changes
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Profile...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Researcher Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. RESEARCHERS DIRECTORY LIST VIEW                                        */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Header & Action Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
                    Team &amp; Personnel Manager
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    Create, edit, organize research hierarchy, and manage full academic profiles.
                  </p>
                </div>
              </div>
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
                href="/team"
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
              >
                <span>View Public Team Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-md shadow-emerald-950/20 active:scale-95 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Researcher</span>
              </button>
            </div>
          </div>

          {/* Stats Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <div className={`p-4 rounded-2xl border ${cardBg} space-y-1`}>
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Total Team
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                {totalCount}
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {activeCount} Active Members
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${cardBg} space-y-1`}>
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Principal Inv.</span>
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                {piCount}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Lab Directorship
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${cardBg} space-y-1`}>
              <span className="text-[11px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>Postdoc &amp; PhD</span>
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                {phdCount}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Researchers
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${cardBg} space-y-1`}>
              <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>M.Sc. Graduate</span>
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                {gradCount}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Thesis Candidates
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${cardBg} space-y-1`}>
              <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                <GraduationCap className="w-3 h-3" />
                <span>Undergraduate</span>
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                {ugCount}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Honors &amp; Interns
              </span>
            </div>

            <div className={`p-4 rounded-2xl border ${cardBg} space-y-1`}>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Alumni</span>
              </span>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                {alumniCount}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                Global Network
              </span>
            </div>
          </div>

          {/* Search & Filters Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${cardBg}`}>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, role, email, thesis topic, or current institution..."
                className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
              >
                <option value="all">All Categories</option>
                {Object.entries(TEAM_CATEGORIES_META).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {meta.label}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
                <p className={`text-xs ${subText}`}>Loading team database...</p>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${headingText}`}>No Researchers Found</h3>
                  <p className={`text-xs ${subText} max-w-sm mx-auto mt-1`}>
                    {searchQuery || categoryFilter !== "all"
                      ? "No records match your active search filters. Try clearing filters."
                      : "Start adding personnel by clicking '+ Add New Researcher'."}
                  </p>
                </div>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition"
                >
                  + Add Researcher
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}>
                    <tr>
                      <th className="py-3.5 px-4">Researcher Profile</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Thesis / Topic</th>
                      <th className="py-3.5 px-3">Order</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                    {filteredMembers.map((member) => {
                      const catMeta = TEAM_CATEGORIES_META[member.category] || {
                        label: member.category,
                      };
                      return (
                        <tr
                          key={member.id}
                          className={`transition-colors ${
                            isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"
                          }`}
                        >
                          {/* Profile */}
                          <td className="py-4 px-4 max-w-md">
                            <div className="flex items-center gap-3">
                              <img
                                src={
                                  member.imageSrc ||
                                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                                }
                                alt={member.name}
                                className="w-11 h-11 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                              />
                              <div className="space-y-0.5 min-w-0">
                                <div className={`font-bold text-sm ${headingText} flex items-center gap-2`}>
                                  <span>{member.name}</span>
                                  {member.slug && (
                                    <Link
                                      href={`/team/${member.slug}`}
                                      target="_blank"
                                      className="text-slate-400 hover:text-emerald-500"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                    </Link>
                                  )}
                                </div>
                                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold truncate">
                                  {member.role}
                                </div>
                                <div className={`text-[11px] truncate ${subText}`}>
                                  {member.department || member.affiliation}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {catMeta.label}
                            </span>
                          </td>

                          {/* Thesis / Topic */}
                          <td className="py-4 px-3 max-w-xs">
                            <div className={`text-[11px] truncate ${subText}`}>
                              {member.thesisTopic ||
                                member.mscThesis ||
                                member.undergradThesis ||
                                member.currentPosition ||
                                "N/A"}
                            </div>
                          </td>

                          {/* Order */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <span className="font-mono text-xs font-bold text-slate-500">
                              #{member.orderIndex ?? 0}
                            </span>
                          </td>

                          {/* Status */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleActive(member)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                                member.isActive !== false
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300"
                              }`}
                            >
                              {member.isActive !== false ? "● Active" : "○ Inactive"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(member)}
                                className={`p-2 rounded-xl border transition ${
                                  isLight
                                    ? "border-slate-200 hover:bg-slate-100 text-slate-700"
                                    : "border-slate-700 hover:bg-slate-800 text-slate-300"
                                }`}
                                title="Edit researcher profile"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmId(member.id)}
                                className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition"
                                title="Delete researcher"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 ${cardBg}`}>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className={`text-base font-bold ${headingText}`}>Delete Researcher Record?</h3>
              <p className={`text-xs ${subText}`}>
                This will permanently remove the researcher profile and their thesis links from the laboratory roster.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className={`py-2.5 text-xs font-semibold rounded-xl border transition ${
                  isLight ? "border-slate-300 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl transition cursor-pointer shadow-md shadow-red-600/20"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
