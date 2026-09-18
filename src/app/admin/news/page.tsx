"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";
import {
  Newspaper,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Star,
  Sparkles,
  Calendar,
  Layers,
  FlaskConical,
  Filter,
  Check,
  RefreshCw,
  X,
  FileText,
  Clock,
  Compass,
  Award,
  Image as ImageIcon,
  Users,
  ArrowLeft,
  Upload,
  Info,
  Globe,
  ArrowUpRight,
  Lock,
  Tag
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeCompressImage } from "@/lib/image-compression";
import { NewsArticle, NewsCategory, NewsFormData } from "@/lib/news/types";
import { getPublishedNews, getNewsStats } from "@/lib/news/queries";
import {
  createNewsArticle,
  updateNewsArticle,
  deleteNewsArticle,
  toggleNewsFeatured,
  toggleNewsPublished
} from "@/lib/news/mutations";
import { NEWS_CATEGORIES_META } from "@/lib/news/seed-data";
import { getAllResearchAreas, createResearchArea } from "@/lib/research-areas/store";

export default function AdminNewsPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Research Areas dynamic list
  const [allResearchAreas, setAllResearchAreas] = useState(getAllResearchAreas());
  const [showNewAreaForm, setShowNewAreaForm] = useState(false);
  const [newAreaTitle, setNewAreaTitle] = useState("");
  const [newAreaDesc, setNewAreaDesc] = useState("");
  const [creatingArea, setCreatingArea] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // Full-Page Studio View State
  const [isEditing, setIsEditing] = useState(false);
  const [editorSection, setEditorSection] = useState<
    "all" | "basic" | "content" | "media" | "author" | "areas" | "visibility"
  >("all");
  const [saving, setSaving] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Cover Image Upload State
  const [uploadingCover, setUploadingCover] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const initialFormState: NewsFormData = {
    id: "",
    title: "",
    slug: "",
    summary: "",
    content: "",
    category: "breakthrough",
    cover_image_url: "",
    image_caption: "",
    image_credit: "",
    author_name: "Lab Editorial Team",
    author_role: "Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
    author_avatar: "",
    published_at: new Date().toISOString().split("T")[0],
    read_time_minutes: 4,
    is_featured: false,
    is_published: true,
    display_order: 0,
    tags: "",
    research_area_ids: [],
    project_ids: [],
  };

  const [formData, setFormData] = useState<NewsFormData>(initialFormState);

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const allNews = await getPublishedNews({}, true); // include drafts
      setArticles(allNews);
    } catch (err) {
      console.error("Error loading admin news:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    const handleAreasUpdate = () => setAllResearchAreas(getAllResearchAreas());

    window.addEventListener("lab_news_updated", handleUpdate);
    window.addEventListener("lab_research_areas_updated", handleAreasUpdate);

    return () => {
      window.removeEventListener("lab_news_updated", handleUpdate);
      window.removeEventListener("lab_research_areas_updated", handleAreasUpdate);
    };
  }, []);

  // Filtered articles
  const filteredArticles = articles.filter((art) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchSummary = (art.summary || "").toLowerCase().includes(q);
      const matchAuthor = (art.author_name || "").toLowerCase().includes(q);
      const matchTags = Array.isArray(art.tags)
        ? art.tags.some((t) => t.toLowerCase().includes(q))
        : (art.tags || "").toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchAuthor && !matchTags) return false;
    }
    if (categoryFilter !== "all" && art.category !== categoryFilter) return false;
    if (yearFilter !== "all" && !art.published_at.startsWith(yearFilter)) return false;
    if (publishedFilter !== "all") {
      if (publishedFilter === "published" && !art.is_published) return false;
      if (publishedFilter === "draft" && art.is_published) return false;
    }
    if (featuredFilter !== "all") {
      if (featuredFilter === "featured" && !art.is_featured) return false;
    }
    return true;
  });

  // Unique Years
  const availableYears = Array.from(
    new Set(articles.map((a) => a.published_at.split("-")[0]))
  ).sort((a, b) => b.localeCompare(a));

  // Metrics
  const totalCount = articles.length;
  const publishedCount = articles.filter((a) => a.is_published).length;
  const breakthroughCount = articles.filter((a) => a.category === "breakthrough").length;
  const featuredCount = articles.filter((a) => a.is_featured).length;

  // Open Create
  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setEditorSection("all");
    setIsEditing(true);
    setStatusNotification(null);
  };

  // Open Edit
  const handleOpenEdit = (art: NewsArticle) => {
    setFormData({
      id: art.id,
      title: art.title,
      slug: art.slug,
      summary: art.summary,
      content: art.content,
      category: art.category,
      cover_image_url: art.cover_image_url || "",
      image_caption: art.image_caption || "",
      image_credit: art.image_credit || "",
      author_name: art.author_name || "Lab Editorial Team",
      author_role: art.author_role || "Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
      author_avatar: art.author_avatar || "",
      published_at: art.published_at,
      read_time_minutes: art.read_time_minutes || 4,
      is_featured: art.is_featured,
      is_published: art.is_published,
      display_order: art.display_order,
      tags: Array.isArray(art.tags) ? art.tags.join(", ") : art.tags || "",
      research_area_ids: art.research_areas ? art.research_areas.map((a) => a.id) : [],
      project_ids: art.projects ? art.projects.map((p) => p.id) : [],
    });
    setEditorSection("all");
    setIsEditing(true);
    setStatusNotification(null);
  };

  // Image Upload Handler
  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatusNotification({ type: "error", message: "Image exceeds 5MB limit. Please upload a smaller file." });
      return;
    }
    setUploadingCover(true);
    try {
      try {
        const supabase = createClient();
        const fileExt = file.name.split(".").pop();
        const fileName = `news/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
        const { data, error } = await supabase.storage.from("news-media").upload(fileName, file, { upsert: true });
        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from("news-media").getPublicUrl(data.path);
          setFormData((prev) => ({ ...prev, cover_image_url: publicUrl }));
          setStatusNotification({ type: "success", message: "Cover image uploaded to cloud storage!" });
          setUploadingCover(false);
          return;
        }
      } catch (e) {
        console.warn("Storage upload fallback:", e);
      }

      // High quality client-side compression fallback
      const compressed = await safeCompressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.84,
      });

      setFormData((prev) => ({ ...prev, cover_image_url: compressed }));
      setStatusNotification({ type: "success", message: "Cover photo optimized and staged!" });
    } catch (err: any) {
      setStatusNotification({ type: "error", message: "Failed to upload image: " + (err.message || String(err)) });
    } finally {
      setUploadingCover(false);
    }
  };

  // Create New Thematic Research Area Inline
  const handleCreateNewArea = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newAreaTitle.trim()) {
      setStatusNotification({ type: "error", message: "Please enter a title for the new thematic discipline." });
      return;
    }
    setCreatingArea(true);
    try {
      const created = await createResearchArea(newAreaTitle, newAreaDesc);
      setAllResearchAreas(getAllResearchAreas());
      setFormData((prev) => ({
        ...prev,
        research_area_ids: [...(prev.research_area_ids || []), created.id],
      }));
      setNewAreaTitle("");
      setNewAreaDesc("");
      setShowNewAreaForm(false);
      setStatusNotification({
        type: "success",
        message: `✨ Created and tagged new research discipline: "${created.title}"!`,
      });
    } catch (err: any) {
      setStatusNotification({ type: "error", message: err.message || "Failed to create discipline." });
    } finally {
      setCreatingArea(false);
    }
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.summary) {
      setStatusNotification({ type: "error", message: "Please provide both a headline title and executive summary." });
      return;
    }

    setSaving(true);
    setStatusNotification(null);

    try {
      if (formData.id) {
        const res = await updateNewsArticle(formData.id, formData);
        if (res.success) {
          setStatusNotification({ type: "success", message: "Research dispatch updated successfully!" });
          await loadData();
          setIsEditing(false);
        } else {
          setStatusNotification({ type: "error", message: res.error || "Failed to update article." });
        }
      } else {
        const res = await createNewsArticle(formData);
        if (res.success) {
          setStatusNotification({ type: "success", message: "New scientific dispatch published!" });
          await loadData();
          setIsEditing(false);
        } else {
          setStatusNotification({ type: "error", message: res.error || "Failed to create article." });
        }
      }
    } catch (err: any) {
      setStatusNotification({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await deleteNewsArticle(id);
      setDeleteConfirmId(null);
      await loadData();
      setStatusNotification({ type: "success", message: "Article removed from archives." });
    });
  };

  // Quick Toggles
  const handleToggleFeatured = async (art: NewsArticle) => {
    startTransition(async () => {
      const nextVal = !art.is_featured;
      await toggleNewsFeatured(art.id, nextVal);
      setArticles((prev) =>
        prev.map((a) => (a.id === art.id ? { ...a, is_featured: nextVal } : a))
      );
    });
  };

  const handleTogglePublish = async (art: NewsArticle) => {
    startTransition(async () => {
      const nextVal = !art.is_published;
      await toggleNewsPublished(art.id, nextVal);
      setArticles((prev) =>
        prev.map((a) => (a.id === art.id ? { ...a, is_published: nextVal } : a))
      );
    });
  };

  // Styling helpers
  const cardBg = isLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0F172A] border-slate-800 shadow-md";
  const subText = isLight ? "text-slate-500" : "text-slate-400";
  const headingText = isLight ? "text-slate-900" : "text-white";
  const inputBg = isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-500" : "bg-[#090D16] border-slate-700 text-white focus:border-emerald-400";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* ========================================================================= */}
      {/* 1. FULL PAGE DISPATCH STUDIO (WHEN isEditing === true)                     */}
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
                <span className="hidden sm:inline">Back to Dispatches</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {formData.id ? "Edit Research Dispatch" : "New Scientific Dispatch"}
                  </span>
                  <span className={`text-xs font-mono ${subText}`}>
                    {NEWS_CATEGORIES_META[formData.category]?.label || formData.category} · {formData.published_at}
                  </span>
                </div>
                <h1 className={`text-lg sm:text-xl font-extrabold truncate max-w-lg ${headingText} mt-0.5`}>
                  {formData.title || "Untitled Research Dispatch"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              {formData.slug && (
                <Link
                  href={`/news/${formData.slug}`}
                  target="_blank"
                  className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                    isLight ? "border-slate-200 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                  <span>View Public Article</span>
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
                onClick={handleSubmit}
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
                    <span>Save &amp; Publish Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Status Alert Notification */}
          {statusNotification && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border ${
                statusNotification.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {statusNotification.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusNotification.message}</span>
              </div>
              <button onClick={() => setStatusNotification(null)} className="p-1 opacity-70 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick Section Filter Bar */}
          <div className={`p-2 rounded-2xl border flex items-center gap-1.5 overflow-x-auto ${cardBg}`}>
            {[
              { id: "all", label: "All Sections", icon: Layers },
              { id: "basic", label: "01 Basic Info & Summary", icon: FileText },
              { id: "content", label: "02 Full Article Content", icon: Edit3 },
              { id: "media", label: "03 Cover Media & Banner", icon: ImageIcon },
              { id: "author", label: "04 Author & Editorial Team", icon: Users },
              { id: "areas", label: "05 Research Links & Projects", icon: FlaskConical },
              { id: "visibility", label: "06 Publishing & Status", icon: Star },
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. BASIC INFO & SUMMARY */}
            {(editorSection === "all" || editorSection === "basic") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      01. Basic Information &amp; Headline
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Primary news headline, section categorization, publication date, and executive summary lead.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Headline / Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Breakthrough Study Maps Microplastic Nanoparticle Translocation in Meghna Delta Fisheries"
                      className={`w-full px-4 py-3 text-sm sm:text-base font-medium rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Category / Section <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsCategory })}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      >
                        {Object.entries(NEWS_CATEGORIES_META).map(([key, cat]) => (
                          <option key={key} value={key}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Publish Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.published_at}
                        onChange={(e) => setFormData({ ...formData, published_at: e.target.value })}
                        className={`w-full px-4 py-2.5 text-sm font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Executive Summary / Lead Paragraph <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formData.summary}
                      onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                      placeholder="Our aquatic ecotoxicology team reveals significant trophic magnification factors for micro-FTIR identified polymers across commercial estuarine species."
                      className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition resize-y leading-relaxed ${inputBg}`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Topic Tags (Comma-separated)
                    </label>
                    <input
                      type="text"
                      value={typeof formData.tags === "string" ? formData.tags : formData.tags?.join(", ")}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="Microplastics, Ecotoxicology, Estuarine Health, FTIR Spectroscopy"
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. FULL ARTICLE CONTENT */}
            {(editorSection === "all" || editorSection === "content") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      02. Full Article Body &amp; Markdown
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Complete editorial content, sub-headings, quotes, and scientific explanations.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className={`text-[11px] font-semibold ${subText} mr-1`}>Quick Snippets:</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content: (formData.content || "") + "\n\n### Key Research Findings\n- Observation 1\n- Observation 2" })}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        isLight ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      + Sub-Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content: (formData.content || "") + "\n\n> \"This empirical study marks a critical breakthrough in estuarine toxicology.\" - Dr. Kabir" })}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        isLight ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      + Blockquote
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content: (formData.content || "") + "\n\n**Next Steps:** Ongoing continuous monitoring along the Meghna estuary will expand in Q4 2026." })}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition ${
                        isLight ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      + Callout
                    </button>
                  </div>

                  <textarea
                    rows={12}
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write the full scientific story here. You can use standard Markdown for headers (##, ###), bullet lists, and emphasis..."
                    className={`w-full p-4 text-sm font-mono leading-relaxed rounded-2xl border outline-none transition resize-y ${inputBg}`}
                  />
                </div>
              </div>
            )}

            {/* 3. COVER MEDIA */}
            {(editorSection === "all" || editorSection === "media") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      03. Cover Media &amp; Banner Photography
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      High-impact cover visual for homepage hero and news article header.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left: 16:9 Banner Preview */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${headingText}`}>
                        Cover Banner Preview (16:9)
                      </label>
                      {formData.cover_image_url && (
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, cover_image_url: "" })}
                          className="text-[11px] text-red-500 hover:underline font-semibold"
                        >
                          Remove Cover
                        </button>
                      )}
                    </div>

                    <div className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-lg flex items-center justify-center group">
                      {formData.cover_image_url ? (
                        <>
                          <img
                            src={formData.cover_image_url}
                            alt="Cover Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-white text-xs font-bold font-mono">
                              16:9 Aspect Ratio Display
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-6 space-y-2">
                          <ImageIcon className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
                          <p className="text-xs text-slate-400 font-medium">No cover image uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Upload & Guidelines */}
                  <div className="lg:col-span-7 space-y-4">
                    {/* Device Upload Area */}
                    <div className="space-y-2">
                      <label className={`block text-xs font-bold uppercase tracking-wider ${headingText}`}>
                        Upload Banner from Computer / Phone
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
                                Select JPG, PNG, or WebP banner
                              </div>
                              <div className={`text-[11px] ${subText}`}>
                                Max file size: 5 MB · Optimized for web
                              </div>
                            </div>
                          </div>

                          <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer whitespace-nowrap">
                            {uploadingCover ? (
                              <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                <span>Uploading...</span>
                              </>
                            ) : (
                              <>
                                <Upload className="w-3.5 h-3.5" />
                                <span>Choose Banner File</span>
                              </>
                            )}
                            <input
                              type="file"
                              accept="image/png, image/jpeg, image/webp"
                              disabled={uploadingCover}
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleCoverUpload(file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Aspect Ratio Note */}
                    <div className={`p-4 rounded-2xl border ${
                      isLight ? "bg-amber-50/70 border-amber-200 text-amber-900" : "bg-amber-950/20 border-amber-800/60 text-amber-200"
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className="p-1 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
                          <Info className="w-4 h-4" />
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <div className="font-bold uppercase tracking-wider text-[11px] text-amber-800 dark:text-amber-300">
                            📐 Cover Banner Guidelines &amp; Aspect Ratio
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] leading-relaxed opacity-90">
                            <div>
                              <strong>• Aspect Ratio:</strong> <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono font-bold">16:9 Landscape</code>
                            </div>
                            <div>
                              <strong>• Optimal Size:</strong> <code className="px-1.5 py-0.5 rounded bg-amber-500/15 font-mono font-bold">1200 × 675 px</code> (or 1600×900)
                            </div>
                            <div>
                              <strong>• Formats:</strong> JPG, PNG, WebP (Max 5 MB)
                            </div>
                            <div>
                              <strong>• Framing:</strong> High-impact lab or field research photography
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Direct URL */}
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${headingText}`}>
                        Or Paste Direct Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.cover_image_url || ""}
                        onChange={(e) => setFormData({ ...formData, cover_image_url: e.target.value })}
                        placeholder="https://images.unsplash.com/... or /images/field-survey.jpg"
                        className={`w-full px-4 py-2.5 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    {/* Caption & Credit */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${headingText}`}>
                          Image Caption
                        </label>
                        <input
                          type="text"
                          value={formData.image_caption || ""}
                          onChange={(e) => setFormData({ ...formData, image_caption: e.target.value })}
                          placeholder="Sampling estuarine teleosts at Meghna confluence"
                          className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${headingText}`}>
                          Photo Credit / Source
                        </label>
                        <input
                          type="text"
                          value={formData.image_credit || ""}
                          onChange={(e) => setFormData({ ...formData, image_credit: e.target.value })}
                          placeholder="Dr. Sojib / Lab Field Expedition Team"
                          className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. AUTHOR & TEAM */}
            {(editorSection === "all" || editorSection === "author") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      04. Author Attribution &amp; Editorial Credits
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Author signature, editorial affiliation, and estimated article read time.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Lead Author / Contributor Name
                      </label>
                      <input
                        type="text"
                        value={formData.author_name || ""}
                        onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                        placeholder="Dr. Mohammad S. Kabir"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Author Role / Affiliation
                      </label>
                      <input
                        type="text"
                        value={formData.author_role || ""}
                        onChange={(e) => setFormData({ ...formData, author_role: e.target.value })}
                        placeholder="Principal Investigator, Environmental Health Lab"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Author Avatar URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={formData.author_avatar || ""}
                        onChange={(e) => setFormData({ ...formData, author_avatar: e.target.value })}
                        placeholder="https://images.unsplash.com/photo-1534528741775-53994a69daeb"
                        className={`w-full px-4 py-2.5 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Read Time (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={60}
                        value={formData.read_time_minutes || 4}
                        onChange={(e) => setFormData({ ...formData, read_time_minutes: parseInt(e.target.value) || 4 })}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 5. RESEARCH LINKS */}
            {(editorSection === "all" || editorSection === "areas") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-base font-bold ${headingText}`}>
                        05. Thematic Research Disciplines &amp; Projects
                      </h2>
                      <p className={`text-xs ${subText}`}>
                        Tag associated scientific pillars and parent research initiatives.
                      </p>
                    </div>
                  </div>

                  {/* Button to Add New Thematic Area */}
                  <button
                    type="button"
                    onClick={() => setShowNewAreaForm(!showNewAreaForm)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Thematic Area</span>
                  </button>
                </div>

                {/* Inline Creation Form */}
                {showNewAreaForm && (
                  <div className={`p-5 rounded-2xl border space-y-4 animate-in fade-in duration-200 ${
                    isLight ? "bg-emerald-50/50 border-emerald-200" : "bg-emerald-950/20 border-emerald-800/60"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        <span className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>
                          Create New Scientific Discipline / Pillar
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
                          isLight ? "border-slate-300 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
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
                            <span>Save &amp; Tag Discipline</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-3 ${headingText}`}>
                      Associated Research Areas ({allResearchAreas.length} Available)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {allResearchAreas.map((area) => {
                        const isSelected = formData.research_area_ids?.includes(area.id);
                        return (
                          <button
                            key={area.id}
                            type="button"
                            onClick={() => {
                              const current = formData.research_area_ids || [];
                              const updated = isSelected
                                ? current.filter((id) => id !== area.id)
                                : [...current, area.id];
                              setFormData({ ...formData, research_area_ids: updated });
                            }}
                            className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                              isSelected
                                ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold shadow-xs"
                                : isLight
                                ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                                : "bg-[#090D16] border-slate-800 text-slate-400 hover:bg-slate-800/80"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center ${
                                isSelected
                                  ? "bg-emerald-600 border-emerald-600 text-white"
                                  : "border-slate-400"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="text-xs">{area.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. PUBLISHING & VISIBILITY */}
            {(editorSection === "all" || editorSection === "visibility") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      06. Publishing &amp; Visibility Controls
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Configure public display status, homepage spotlights, and manual sorting order.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Status Toggle */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Dispatch Status
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Controls live visibility on public news dispatch feed
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
                          <CheckCircle2 className="w-4 h-4" /> LIVE IN ARCHIVE
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
                        Featured Dispatch
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Highlight in homepage news carousel &amp; top banner
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, is_featured: !formData.is_featured })}
                      className={`w-full py-2.5 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        formData.is_featured
                          ? "bg-amber-500 text-slate-950 font-black shadow-sm"
                          : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {formData.is_featured ? (
                        <>
                          <Star className="w-4 h-4 fill-current" /> ★ FEATURED
                        </>
                      ) : (
                        "STANDARD LISTING"
                      )}
                    </button>
                  </div>

                  {/* Display Order Index */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Display Priority Index
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Higher numbers appear higher in default sorting
                      </p>
                    </div>
                    <input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className={`w-full px-4 py-2 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar */}
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
                    <span>Saving Dispatch...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save &amp; Publish Dispatch</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* 2. NEWS & DISPATCHES DIRECTORY LIST VIEW                                  */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Newspaper className="w-5 h-5" />
                </span>
                <h1 className={`text-2xl font-bold tracking-tight ${headingText}`}>
                  News &amp; Research Dispatches CMS
                </h1>
              </div>
              <p className={`text-xs md:text-sm ${subText} mt-1.5`}>
                Publish laboratory discoveries, grant awards, fieldwork stories, and media announcements.
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
                href="/news"
                target="_blank"
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                  isLight ? "border-slate-300 bg-white hover:bg-slate-50 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>View Public News</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Dispatch</span>
              </button>
            </div>
          </div>

          {/* Status Notification */}
          {statusNotification && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border ${
                statusNotification.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2">
                {statusNotification.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusNotification.message}</span>
              </div>
              <button onClick={() => setStatusNotification(null)} className="p-1 opacity-70 hover:opacity-100">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Metric Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className={`text-xs font-semibold ${subText}`}>Total Dispatches</div>
              <div className={`text-2xl font-black ${headingText} mt-1`}>{totalCount}</div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className={`text-xs font-semibold ${subText}`}>Published Live</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {publishedCount}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className={`text-xs font-semibold ${subText}`}>Breakthrough Studies</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {breakthroughCount}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className={`text-xs font-semibold ${subText}`}>Featured Stories</div>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {featuredCount}
              </div>
            </div>
          </div>

          {/* Search & Filters */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${cardBg}`}>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by headline, summary, tags, or author..."
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
                {Object.entries(NEWS_CATEGORIES_META).map(([k, meta]) => (
                  <option key={k} value={k}>
                    {meta.label}
                  </option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
              >
                <option value="all">All Years</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <select
                value={publishedFilter}
                onChange={(e) => setPublishedFilter(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
              >
                <option value="all">All Status</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>
            </div>
          </div>

          {/* Articles Table */}
          <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
                <p className={`text-xs ${subText}`}>Loading scientific news...</p>
              </div>
            ) : filteredArticles.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <Newspaper className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${headingText}`}>No Articles Found</h3>
                  <p className={`text-xs ${subText} max-w-sm mx-auto mt-1`}>
                    {searchQuery || categoryFilter !== "all"
                      ? "No records match your active search filters. Try clearing filters."
                      : "Start publishing research stories by clicking '+ New Dispatch'."}
                  </p>
                </div>
                <button
                  onClick={handleOpenAdd}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition"
                >
                  + New Dispatch
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}>
                    <tr>
                      <th className="py-3.5 px-4">Headline &amp; Story</th>
                      <th className="py-3.5 px-3">Category</th>
                      <th className="py-3.5 px-3">Date</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                    {filteredArticles.map((art) => {
                      const catMeta = NEWS_CATEGORIES_META[art.category] || {
                        label: art.category,
                      };
                      return (
                        <tr
                          key={art.id}
                          className={`transition-colors ${
                            isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"
                          }`}
                        >
                          {/* Headline & Summary */}
                          <td className="py-4 px-4 max-w-md">
                            <div className="flex items-start gap-3">
                              {art.cover_image_url ? (
                                <img
                                  src={art.cover_image_url}
                                  alt={art.title}
                                  className="w-14 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                                />
                              ) : (
                                <div className="w-14 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                                  <Newspaper className="w-4 h-4 text-slate-400" />
                                </div>
                              )}
                              <div className="space-y-0.5 min-w-0">
                                <div className={`font-bold text-sm leading-snug line-clamp-2 ${headingText}`}>
                                  {art.title}
                                </div>
                                <p className={`text-[11px] line-clamp-1 ${subText}`}>
                                  {art.summary}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {catMeta.label}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="py-4 px-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                            {art.published_at}
                          </td>

                          {/* Published Toggle */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePublish(art)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                                art.is_published
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                  : "bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300"
                              }`}
                            >
                              {art.is_published ? "● Live" : "○ Draft"}
                            </button>
                          </td>

                          {/* Featured Toggle */}
                          <td className="py-4 px-3 whitespace-nowrap">
                            <button
                              onClick={() => handleToggleFeatured(art)}
                              className={`p-1.5 rounded-lg transition ${
                                art.is_featured
                                  ? "text-amber-500 hover:bg-amber-500/10"
                                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                              }`}
                              title={art.is_featured ? "Remove featured" : "Set as featured"}
                            >
                              <Star className={`w-4 h-4 ${art.is_featured ? "fill-amber-500" : ""}`} />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEdit(art)}
                                className={`p-2 rounded-xl border transition ${
                                  isLight
                                    ? "border-slate-200 hover:bg-slate-100 text-slate-700"
                                    : "border-slate-700 hover:bg-slate-800 text-slate-300"
                                }`}
                                title="Edit research dispatch"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                              </button>

                              <button
                                onClick={() => setDeleteConfirmId(art.id)}
                                className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition"
                                title="Delete article"
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
              <h3 className={`text-base font-bold ${headingText}`}>Delete Scientific Dispatch?</h3>
              <p className={`text-xs ${subText}`}>
                This will permanently remove this research story from the public news feed and archives.
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
