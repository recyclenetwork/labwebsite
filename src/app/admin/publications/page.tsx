"use client";

import React, { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";
import {
  BookOpen,
  Plus,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Star,
  Quote,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
  Layers,
  FlaskConical,
  Filter,
  Check,
  RefreshCw,
  X,
  FileText,
  Copy,
  ArrowLeft,
  Globe,
  ArrowUpRight,
  Bookmark,
  Share2,
  Lock,
  Zap,
  UploadCloud,
  CheckSquare,
  Square,
  AlertTriangle,
  FileSpreadsheet,
  HelpCircle,
  Eye
} from "lucide-react";
import {
  PublicationWithRelations,
  PublicationType,
  PublicationFormData
} from "@/lib/publications/types";
import {
  getPublishedPublications,
  getPublicationStats
} from "@/lib/publications/queries";
import {
  createPublication,
  updatePublication,
  deletePublication,
  togglePublicationFeatured,
  togglePublicationPublish,
  batchCreatePublications,
  formatDoi
} from "@/lib/publications/mutations";
import {
  extractDoisFromText,
  resolveDoi,
  batchResolveDois
} from "@/lib/publications/doi-resolver";
import { getTeamMembers, getCachedTeamMembers } from "@/lib/team/store";
import { getAllResearchAreas, createResearchArea } from "@/lib/research-areas/store";

interface StagedPublication {
  id: string;
  originalDoi: string;
  data: PublicationFormData;
  selected: boolean;
  status: "ready" | "warning" | "error";
  statusMessage?: string;
}

export default function AdminPublicationsPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";

  const [publications, setPublications] = useState<PublicationWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Research Areas dynamic list
  const [allResearchAreas, setAllResearchAreas] = useState(getAllResearchAreas());
  const [teamMembers, setTeamMembers] = useState(() => getCachedTeamMembers());
  const [showNewAreaForm, setShowNewAreaForm] = useState(false);
  const [newAreaTitle, setNewAreaTitle] = useState("");
  const [newAreaDesc, setNewAreaDesc] = useState("");
  const [creatingArea, setCreatingArea] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [featuredFilter, setFeaturedFilter] = useState("all");

  // Single Publication Studio Editor View State
  const [isEditing, setIsEditing] = useState(false);
  const [editorSection, setEditorSection] = useState<"all" | "basic" | "metrics" | "links" | "authors" | "areas" | "visibility">("all");
  const [saving, setSaving] = useState(false);
  const [statusNotification, setStatusNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  // Single DOI Quick Autofill State
  const [quickDoiInput, setQuickDoiInput] = useState("");
  const [isQuickDoiLoading, setIsQuickDoiLoading] = useState(false);

  // Bulk DOI Ingestion Studio State
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkRawInput, setBulkRawInput] = useState("");
  const [bulkDetectedDois, setBulkDetectedDois] = useState<string[]>([]);
  const [bulkResolving, setBulkResolving] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ completed: number; total: number }>({ completed: 0, total: 0 });
  const [stagedPubs, setStagedPubs] = useState<StagedPublication[]>([]);
  const [bulkDefaultAreas, setBulkDefaultAreas] = useState<string[]>([]);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  // Delete modal state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State for Single Editor
  const initialFormState: PublicationFormData = {
    id: "",
    title: "",
    slug: "",
    abstract: "",
    publication_type: "journal_article",
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    publication_year: new Date().getFullYear(),
    publication_date: "",
    doi: "",
    doi_url: "",
    pdf_url: "",
    external_url: "",
    impact_factor: "",
    citation_count: "0",
    quartile: "Q1",
    is_featured: false,
    is_published: true,
    display_order: 0,
    authors_text: "",
    research_area_ids: [],
    bibtex: "",
  };

  const [formData, setFormData] = useState<PublicationFormData>(initialFormState);

  // Load Publications from DB / Storage
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allPubs, members] = await Promise.all([
        getPublishedPublications({}, true), // include drafts
        getTeamMembers(),
      ]);
      setPublications(allPubs);
      if (members && members.length > 0) setTeamMembers(members);
    } catch (err) {
      console.error("Error loading admin publications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to local publication updates across tabs
    const handleUpdate = () => loadData();
    const handleAreasUpdate = () => setAllResearchAreas(getAllResearchAreas());

    window.addEventListener("lab_publications_updated", handleUpdate);
    window.addEventListener("lab_research_areas_updated", handleAreasUpdate);

    return () => {
      window.removeEventListener("lab_publications_updated", handleUpdate);
      window.removeEventListener("lab_research_areas_updated", handleAreasUpdate);
    };
  }, []);

  // Update detected DOIs whenever user types in the bulk input box
  useEffect(() => {
    const extracted = extractDoisFromText(bulkRawInput);
    setBulkDetectedDois(extracted);
  }, [bulkRawInput]);

  // Filtered publications for table
  const filteredPubs = publications.filter((pub) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = pub.title.toLowerCase().includes(q);
      const matchJournal = pub.journal.toLowerCase().includes(q);
      const matchAuthors = (pub.authors_text || "").toLowerCase().includes(q);
      const matchDoi = (pub.doi || "").toLowerCase().includes(q);
      if (!matchTitle && !matchJournal && !matchAuthors && !matchDoi) return false;
    }
    if (typeFilter !== "all" && pub.publication_type !== typeFilter) return false;
    if (yearFilter !== "all" && String(pub.publication_year) !== yearFilter) return false;
    if (publishedFilter !== "all") {
      if (publishedFilter === "published" && !pub.is_published) return false;
      if (publishedFilter === "draft" && pub.is_published) return false;
    }
    if (featuredFilter !== "all") {
      if (featuredFilter === "featured" && !pub.is_featured) return false;
    }
    return true;
  });

  // Calculate live stats
  const totalCount = publications.length;
  const publishedCount = publications.filter((p) => p.is_published).length;
  const draftCount = totalCount - publishedCount;
  const totalCitations = publications.reduce((acc, p) => acc + (p.citation_count || 0), 0);
  const q1Count = publications.filter((p) => p.quartile === "Q1").length;

  // Available unique years
  const availableYears = Array.from(new Set(publications.map((p) => p.publication_year))).sort((a, b) => b - a);

  // Open Single Create Mode
  const handleOpenAdd = () => {
    setFormData(initialFormState);
    setQuickDoiInput("");
    setEditorSection("all");
    setIsBulkMode(false);
    setIsEditing(true);
    setStatusNotification(null);
  };

  // Open Single Edit Mode
  const handleOpenEdit = (pub: PublicationWithRelations) => {
    setFormData({
      id: pub.id,
      title: pub.title,
      slug: pub.slug,
      abstract: pub.abstract || "",
      publication_type: pub.publication_type,
      journal: pub.journal,
      volume: pub.volume || "",
      issue: pub.issue || "",
      pages: pub.pages || "",
      publication_year: pub.publication_year,
      publication_date: pub.publication_date || "",
      doi: pub.doi || "",
      doi_url: pub.doi_url || "",
      pdf_url: pub.pdf_url || "",
      external_url: pub.external_url || "",
      impact_factor: pub.impact_factor ? String(pub.impact_factor) : "",
      citation_count: pub.citation_count ? String(pub.citation_count) : "0",
      quartile: pub.quartile || "Q1",
      is_featured: pub.is_featured,
      is_published: pub.is_published,
      display_order: pub.display_order,
      authors_text: pub.authors_text || "",
      research_area_ids: pub.research_areas ? pub.research_areas.map((a) => a.id) : [],
      bibtex: pub.bibtex || "",
    });
    setQuickDoiInput(pub.doi || "");
    setEditorSection("all");
    setIsBulkMode(false);
    setIsEditing(true);
    setStatusNotification(null);
  };

  // Open Bulk DOI Ingestion Mode
  const handleOpenBulk = () => {
    setIsEditing(false);
    setIsBulkMode(true);
    setBulkRawInput("");
    setBulkDetectedDois([]);
    setStagedPubs([]);
    setStatusNotification(null);
  };

  // Quick DOI Auto-Fill in Single Studio Editor
  const handleSingleDoiAutofill = async (doiToFetch?: string) => {
    const targetDoi = (doiToFetch || quickDoiInput || formData.doi || "").trim();
    if (!targetDoi) {
      setStatusNotification({ type: "error", message: "Please provide a valid DOI (e.g. 10.1016/j.envpol.2023.121543)" });
      return;
    }

    setIsQuickDoiLoading(true);
    setStatusNotification({ type: "info", message: `Resolving metadata from Crossref for ${targetDoi}...` });

    try {
      const fetched = await resolveDoi(targetDoi);
      setFormData((prev) => ({
        ...prev,
        title: fetched.title || prev.title,
        publication_type: fetched.publication_type || prev.publication_type,
        journal: fetched.journal || prev.journal,
        volume: fetched.volume || prev.volume,
        issue: fetched.issue || prev.issue,
        pages: fetched.pages || prev.pages,
        publication_year: fetched.publication_year || prev.publication_year,
        publication_date: fetched.publication_date || prev.publication_date,
        doi: fetched.doi || prev.doi,
        doi_url: fetched.doi_url || prev.doi_url,
        pdf_url: fetched.pdf_url || prev.pdf_url,
        external_url: fetched.external_url || prev.external_url,
        citation_count: fetched.citation_count || prev.citation_count,
        abstract: fetched.abstract || prev.abstract,
        authors_text: fetched.authors_text || prev.authors_text,
        bibtex: fetched.bibtex || prev.bibtex,
      }));
      setQuickDoiInput(fetched.doi || targetDoi);
      setStatusNotification({
        type: "success",
        message: `⚡ Successfully fetched & populated metadata for "${fetched.title}"!`,
      });
    } catch (err: any) {
      setStatusNotification({
        type: "error",
        message: `Failed to auto-fill DOI: ${err.message || "Could not resolve metadata."}`,
      });
    } finally {
      setIsQuickDoiLoading(false);
    }
  };

  // Run Bulk DOI Resolution
  const handleStartBulkResolution = async () => {
    if (bulkDetectedDois.length === 0) {
      setStatusNotification({ type: "error", message: "No valid DOIs found in the input. Please paste at least one DOI starting with 10." });
      return;
    }

    setBulkResolving(true);
    setBulkProgress({ completed: 0, total: bulkDetectedDois.length });
    setStatusNotification({ type: "info", message: `Connecting to Crossref API to resolve ${bulkDetectedDois.length} DOIs...` });

    try {
      const existingDois = new Set(publications.map((p) => p.doi?.toLowerCase()).filter(Boolean));
      const { successful, failed } = await batchResolveDois(bulkDetectedDois, (done, total) => {
        setBulkProgress({ completed: done, total });
      });

      const stagedList: StagedPublication[] = [];

      for (const item of successful) {
        const isDup = item.data.doi ? existingDois.has(item.data.doi.toLowerCase()) : false;
        stagedList.push({
          id: `staged-${Math.random().toString(36).substring(2, 9)}`,
          originalDoi: item.originalDoi,
          data: {
            ...item.data,
            research_area_ids: bulkDefaultAreas.length > 0 ? bulkDefaultAreas : [],
          },
          selected: true,
          status: isDup ? "warning" : "ready",
          statusMessage: isDup ? "Duplicate DOI already exists in archive" : "Ready to publish",
        });
      }

      for (const f of failed) {
        stagedList.push({
          id: `staged-${Math.random().toString(36).substring(2, 9)}`,
          originalDoi: f.originalDoi,
          data: {
            ...initialFormState,
            title: `Failed to resolve DOI (${f.originalDoi})`,
            doi: f.originalDoi,
          },
          selected: false,
          status: "error",
          statusMessage: f.error || "Failed to fetch metadata from Crossref",
        });
      }

      setStagedPubs(stagedList);
      setStatusNotification({
        type: "success",
        message: `Resolved ${successful.length} of ${bulkDetectedDois.length} DOIs! Review the staged papers below before publishing.`,
      });
    } catch (err: any) {
      setStatusNotification({ type: "error", message: `Batch resolution error: ${err.message}` });
    } finally {
      setBulkResolving(false);
    }
  };

  // Submit Staged Bulk Publications to DB
  const handleBulkSubmit = async (publishImmediately: boolean) => {
    const selectedItems = stagedPubs.filter((s) => s.selected && s.status !== "error");
    if (selectedItems.length === 0) {
      setStatusNotification({ type: "error", message: "Please select at least one valid resolved publication to import." });
      return;
    }

    setBulkSubmitting(true);
    try {
      const recordsToImport: PublicationFormData[] = selectedItems.map((s) => ({
        ...s.data,
        is_published: publishImmediately,
        research_area_ids:
          s.data.research_area_ids && s.data.research_area_ids.length > 0
            ? s.data.research_area_ids
            : bulkDefaultAreas,
      }));

      const res = await batchCreatePublications(recordsToImport);
      if (res.success) {
        await loadData();
        setIsBulkMode(false);
        setStagedPubs([]);
        setBulkRawInput("");
        setStatusNotification({
          type: "success",
          message: `🎉 Successfully imported ${res.insertedCount} publications into the ${
            publishImmediately ? "live archive" : "drafts list"
          }!`,
        });
      } else {
        setStatusNotification({ type: "error", message: `Batch import failed: ${res.errors?.join(", ")}` });
      }
    } catch (err: any) {
      setStatusNotification({ type: "error", message: `Batch import error: ${err.message}` });
    } finally {
      setBulkSubmitting(false);
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

  // Load sample DOIs helper for testing
  const handleLoadSampleDois = () => {
    const samples = [
      "10.1016/j.envpol.2023.121543",
      "10.1038/s41586-020-2649-2",
      "10.1016/j.marpolbul.2022.113540",
      "10.1021/acs.est.1c04543",
      "10.1016/j.chemosphere.2021.131554"
    ].join("\n");
    setBulkRawInput(samples);
  };

  // Toggle single staged selection
  const toggleStagedSelection = (id: string) => {
    setStagedPubs((prev) =>
      prev.map((s) => (s.id === id ? { ...s, selected: !s.selected } : s))
    );
  };

  // Toggle select all staged
  const toggleSelectAllStaged = () => {
    const allSelected = stagedPubs.every((s) => s.selected || s.status === "error");
    setStagedPubs((prev) =>
      prev.map((s) => (s.status === "error" ? s : { ...s, selected: !allSelected }))
    );
  };

  // Remove single staged item
  const removeStagedItem = (id: string) => {
    setStagedPubs((prev) => prev.filter((s) => s.id !== id));
  };

  // Handle Single Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.journal) {
      setStatusNotification({ type: "error", message: "Please provide both a Title and Journal venue." });
      return;
    }

    setSaving(true);
    setStatusNotification(null);

    try {
      if (formData.id) {
        const res = await updatePublication(formData.id, formData);
        if (res.success) {
          setStatusNotification({ type: "success", message: "Publication record updated successfully!" });
          await loadData();
          setIsEditing(false);
        } else {
          setStatusNotification({ type: "error", message: res.error || "Failed to update record." });
        }
      } else {
        const res = await createPublication(formData);
        if (res.success) {
          setStatusNotification({ type: "success", message: "New publication created successfully!" });
          await loadData();
          setIsEditing(false);
        } else {
          setStatusNotification({ type: "error", message: res.error || "Failed to create publication." });
        }
      }
    } catch (err: any) {
      setStatusNotification({ type: "error", message: err.message || "An error occurred." });
    } finally {
      setSaving(false);
    }
  };

  // Delete Action
  const handleDelete = async (id: string) => {
    startTransition(async () => {
      await deletePublication(id);
      setDeleteConfirmId(null);
      await loadData();
      setStatusNotification({ type: "success", message: "Publication removed from archive." });
    });
  };

  // Handle Fast Toggle Featured
  const handleToggleFeatured = async (pub: PublicationWithRelations) => {
    startTransition(async () => {
      const nextVal = !pub.is_featured;
      await togglePublicationFeatured(pub.id, nextVal);
      setPublications((prev) =>
        prev.map((p) => (p.id === pub.id ? { ...p, is_featured: nextVal } : p))
      );
    });
  };

  // Handle Fast Toggle Published
  const handleTogglePublish = async (pub: PublicationWithRelations) => {
    startTransition(async () => {
      const nextVal = !pub.is_published;
      await togglePublicationPublish(pub.id, nextVal);
      setPublications((prev) =>
        prev.map((p) => (p.id === pub.id ? { ...p, is_published: nextVal } : p))
      );
    });
  };

  // Auto DOI generator helper
  const handleDoiChange = (val: string) => {
    const { doi, doi_url } = formatDoi(val);
    setFormData((prev) => ({
      ...prev,
      doi: val,
      doi_url: doi_url || "",
    }));
  };

  // Styling helpers
  const cardBg = isLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0F172A] border-slate-800 shadow-md";
  const subText = isLight ? "text-slate-500" : "text-slate-400";
  const headingText = isLight ? "text-slate-900" : "text-white";
  const inputBg = isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-500" : "bg-[#090D16] border-slate-700 text-white focus:border-emerald-400";

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-20">
      {/* ========================================================================= */}
      {/* 1. BULK DOI RAPID INGESTION STUDIO (WHEN isBulkMode === true)             */}
      {/* ========================================================================= */}
      {isBulkMode ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top Sticky Action Bar */}
          <div className={`sticky top-0 z-30 p-4 sm:p-5 rounded-2xl border backdrop-blur-md shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isLight ? "bg-white/95 border-slate-200" : "bg-[#0D1526]/95 border-slate-800"
          }`}>
            <div className="flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => setIsBulkMode(false)}
                className={`p-2 rounded-xl border transition flex items-center gap-2 text-xs font-semibold ${
                  isLight ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Publications</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Rapid DOI Batch Ingestion Engine
                  </span>
                </div>
                <h1 className={`text-lg sm:text-xl font-extrabold ${headingText} mt-0.5`}>
                  Bulk DOI Metadata Fetcher (1000+ Papers Ingestion)
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setIsBulkMode(false)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                  isLight ? "border-slate-300 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
              >
                Cancel
              </button>

              {stagedPubs.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => handleBulkSubmit(false)}
                    disabled={bulkSubmitting || stagedPubs.filter((s) => s.selected).length === 0}
                    className="px-4 py-2.5 text-xs font-bold rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    Save Selected ({stagedPubs.filter((s) => s.selected).length}) as Drafts
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBulkSubmit(true)}
                    disabled={bulkSubmitting || stagedPubs.filter((s) => s.selected).length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer"
                  >
                    {bulkSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Importing to Archive...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Publish All Selected ({stagedPubs.filter((s) => s.selected).length}) to Archive</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Status Alert Notification */}
          {statusNotification && (
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm font-medium flex items-center justify-between border ${
                statusNotification.type === "success"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : statusNotification.type === "info"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {statusNotification.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : statusNotification.type === "info" ? (
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
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

          {/* Step 1: Bulk Input Area */}
          <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className={`text-base font-bold ${headingText} flex items-center gap-2`}>
                  <span>1. Paste DOIs in Bulk</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-normal">
                    Supports 1 to 50+ DOIs
                  </span>
                </h2>
                <p className={`text-xs ${subText} mt-0.5`}>
                  Paste DOIs one per line, comma-separated, or as full URLs (`https://doi.org/10...`). Our engine will auto-extract every DOI and pull live data from Crossref.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLoadSampleDois}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition ${
                    isLight ? "border-slate-200 hover:bg-slate-100 text-slate-600" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                  }`}
                >
                  ⚡ Load 5 Sample DOIs
                </button>
                {bulkRawInput && (
                  <button
                    type="button"
                    onClick={() => setBulkRawInput("")}
                    className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <textarea
                rows={6}
                value={bulkRawInput}
                onChange={(e) => setBulkRawInput(e.target.value)}
                placeholder={`10.1016/j.envpol.2023.121543\n10.1038/s41586-020-2649-2\nhttps://doi.org/10.1016/j.marpolbul.2022.113540\n10.1021/acs.est.1c04543`}
                className={`w-full p-4 text-xs sm:text-sm font-mono rounded-2xl border outline-none transition resize-y ${inputBg}`}
              />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${headingText}`}>Detected Valid DOIs:</span>
                  <span className="px-2.5 py-0.5 rounded-md font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {bulkDetectedDois.length} DOIs
                  </span>
                </div>

                {/* Default Area Selector */}
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] ${subText}`}>Assign Default Research Discipline:</span>
                  <select
                    value={bulkDefaultAreas[0] || ""}
                    onChange={(e) => setBulkDefaultAreas(e.target.value ? [e.target.value] : [])}
                    className={`px-3 py-1 text-xs rounded-xl border outline-none transition ${inputBg}`}
                  >
                    <option value="">-- None (General) --</option>
                    {allResearchAreas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Progress Bar during fetch */}
              {bulkResolving && (
                <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 space-y-2 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Resolving Crossref metadata: {bulkProgress.completed} of {bulkProgress.total} DOIs
                    </span>
                    <span>
                      {Math.round((bulkProgress.completed / (bulkProgress.total || 1)) * 100)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                      style={{
                        width: `${Math.round((bulkProgress.completed / (bulkProgress.total || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Fetch Trigger Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleStartBulkResolution}
                  disabled={bulkResolving || bulkDetectedDois.length === 0}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition active:scale-[0.98] cursor-pointer ${
                    bulkDetectedDois.length === 0
                      ? "bg-slate-400 opacity-60 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25"
                  }`}
                >
                  {bulkResolving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resolving {bulkDetectedDois.length} DOIs...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>⚡ Auto-Resolve Metadata for {bulkDetectedDois.length} DOIs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2: Staged Review Matrix */}
          {stagedPubs.length > 0 && (
            <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h2 className={`text-base font-bold ${headingText} flex items-center gap-2`}>
                    <span>2. Staged Review Matrix</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                      {stagedPubs.filter((s) => s.status !== "error").length} Valid / {stagedPubs.length} Total
                    </span>
                  </h2>
                  <p className={`text-xs ${subText} mt-0.5`}>
                    Review automatically extracted titles, authors, venues, and metrics before committing to database.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSelectAllStaged}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
                      isLight ? "border-slate-200 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                    }`}
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Select / Deselect All</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStagedPubs([])}
                    className="px-3 py-1.5 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 text-xs font-semibold transition"
                  >
                    Clear Staging
                  </button>
                </div>
              </div>

              {/* Staged Cards List */}
              <div className="space-y-4">
                {stagedPubs.map((staged, idx) => (
                  <div
                    key={staged.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      staged.status === "error"
                        ? "bg-red-500/5 border-red-500/30"
                        : staged.status === "warning"
                        ? "bg-amber-500/5 border-amber-500/30"
                        : staged.selected
                        ? isLight
                          ? "bg-emerald-50/40 border-emerald-300 shadow-xs"
                          : "bg-emerald-950/20 border-emerald-800 shadow-md"
                        : isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-[#090D16] border-slate-800 opacity-60"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => toggleStagedSelection(staged.id)}
                        disabled={staged.status === "error"}
                        className="mt-1 p-0.5 rounded transition hover:scale-110 cursor-pointer"
                      >
                        {staged.selected ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            #{idx + 1}
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                            {staged.data.publication_type}
                          </span>
                          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                            {staged.data.publication_year}
                          </span>
                          {staged.data.citation_count && staged.data.citation_count !== "0" && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">
                              ★ {staged.data.citation_count} Citations
                            </span>
                          )}
                          {staged.status === "warning" && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> {staged.statusMessage}
                            </span>
                          )}
                          {staged.status === "error" && (
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" /> {staged.statusMessage}
                            </span>
                          )}
                        </div>

                        <h3 className={`text-sm sm:text-base font-bold leading-snug ${headingText}`}>
                          {staged.data.title}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className={`font-semibold ${headingText}`}>Venue: </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                              {staged.data.journal || "N/A"}
                            </span>
                            {staged.data.volume && (
                              <span className={subText}> · Vol {staged.data.volume}</span>
                            )}
                            {staged.data.issue && (
                              <span className={subText}>({staged.data.issue})</span>
                            )}
                            {staged.data.pages && (
                              <span className={subText}>, pp. {staged.data.pages}</span>
                            )}
                          </div>
                          <div>
                            <span className={`font-semibold ${headingText}`}>Authors: </span>
                            <span className={subText}>{staged.data.authors_text || "N/A"}</span>
                          </div>
                        </div>

                        {staged.data.doi && (
                          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
                            <span>DOI: {staged.data.doi}</span>
                            <a
                              href={`https://doi.org/${staged.data.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-emerald-500 hover:underline flex items-center gap-0.5"
                            >
                              Open Link <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => removeStagedItem(staged.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Ingestion Action */}
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
                <div className={`text-xs ${subText}`}>
                  Ready to ingest <strong className={headingText}>{stagedPubs.filter((s) => s.selected).length}</strong> publications into the database.
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => handleBulkSubmit(false)}
                    disabled={bulkSubmitting || stagedPubs.filter((s) => s.selected).length === 0}
                    className="flex-1 sm:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition cursor-pointer"
                  >
                    Save Selected as Drafts
                  </button>

                  <button
                    type="button"
                    onClick={() => handleBulkSubmit(true)}
                    disabled={bulkSubmitting || stagedPubs.filter((s) => s.selected).length === 0}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 transition active:scale-[0.98] cursor-pointer"
                  >
                    {bulkSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Publishing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Publish All to Live Archive</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isEditing ? (
        /* ========================================================================= */
        /* 2. FULL PAGE PUBLICATION STUDIO (WHEN isEditing === true)                  */
        /* ========================================================================= */
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
                <span className="hidden sm:inline">Back to Publications</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {formData.id ? "Edit Record" : "New Publication"}
                  </span>
                  <span className={`text-xs font-mono ${subText}`}>
                    {formData.publication_type} · {formData.publication_year}
                  </span>
                </div>
                <h1 className={`text-lg sm:text-xl font-extrabold truncate max-w-lg ${headingText} mt-0.5`}>
                  {formData.title || "Untitled Scientific Publication"}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <Link
                href="/publications"
                target="_blank"
                className={`hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                  isLight ? "border-slate-200 hover:bg-slate-100 text-slate-700" : "border-slate-700 hover:bg-slate-800 text-slate-300"
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
                <span>View Archive</span>
              </Link>

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
                    <span>Save Publication</span>
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
                  : statusNotification.type === "info"
                  ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              }`}
            >
              <div className="flex items-center gap-2.5">
                {statusNotification.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : statusNotification.type === "info" ? (
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
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

          {/* ⚡ ONE-CLICK FAST AUTOFILL BY DOI CARD */}
          <div className={`p-5 sm:p-6 rounded-3xl border ${
            isLight ? "bg-emerald-50/60 border-emerald-200" : "bg-emerald-950/20 border-emerald-800/60"
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-emerald-500 text-white shadow-xs">
                    <Zap className="w-4 h-4 fill-white" />
                  </span>
                  <h3 className={`text-sm font-bold ${headingText}`}>
                    1-Click Fast Auto-Fill by DOI (Crossref Live Sync)
                  </h3>
                </div>
                <p className={`text-xs ${subText}`}>
                  Paste any paper DOI or link to automatically fetch and fill Title, Journal, Year, Volume/Pages, Abstract, Authors APA, and BibTeX in 1 second.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  value={quickDoiInput}
                  onChange={(e) => setQuickDoiInput(e.target.value)}
                  placeholder="e.g. 10.1016/j.envpol.2023.121543"
                  className={`w-full md:w-80 px-3.5 py-2 text-xs font-mono rounded-xl border outline-none transition ${inputBg}`}
                />
                <button
                  type="button"
                  onClick={() => handleSingleDoiAutofill()}
                  disabled={isQuickDoiLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition active:scale-95 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
                >
                  {isQuickDoiLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Auto-Fill All</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Section Filter Bar */}
          <div className={`p-2 rounded-2xl border flex items-center gap-1.5 overflow-x-auto ${cardBg}`}>
            {[
              { id: "all", label: "All Sections", icon: Layers },
              { id: "basic", label: "01 Basic Info & Abstract", icon: FileText },
              { id: "metrics", label: "02 Journal & Metrics", icon: TrendingUp },
              { id: "links", label: "03 DOI & Direct Links", icon: ExternalLink },
              { id: "authors", label: "04 Authors & BibTeX", icon: Quote },
              { id: "areas", label: "05 Research Areas", icon: FlaskConical },
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

          {/* Form Content - Clean Full-Width Structured Studio */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. BASIC INFO & ABSTRACT */}
            {(editorSection === "all" || editorSection === "basic") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      01. Basic Information &amp; Scientific Synopsis
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Primary publication headline, document type, publication year, and empirical abstract.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Publication Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Microplastic ingestion and trophic transfer in commercially important teleosts of the Meghna River Estuary"
                      className={`w-full px-4 py-3 text-sm sm:text-base font-medium rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Publication Type
                      </label>
                      <select
                        value={formData.publication_type}
                        onChange={(e) => setFormData({ ...formData, publication_type: e.target.value as PublicationType })}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      >
                        <option value="journal_article">Journal Article</option>
                        <option value="review">Review Article</option>
                        <option value="conference_paper">Conference Paper</option>
                        <option value="book_chapter">Book Chapter</option>
                        <option value="technical_report">Technical Report</option>
                        <option value="preprint">Preprint</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Publication Year <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={formData.publication_year}
                        onChange={(e) => setFormData({ ...formData, publication_year: parseInt(e.target.value) || new Date().getFullYear() })}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      Abstract / Executive Scientific Synopsis
                    </label>
                    <textarea
                      rows={5}
                      value={formData.abstract}
                      onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                      placeholder="Comprehensive background, methodology, experimental findings, and ecological/clinical implications..."
                      className={`w-full px-4 py-3 text-sm rounded-xl border outline-none transition resize-y leading-relaxed ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. JOURNAL & BIBLIOMETRIC METRICS */}
            {(editorSection === "all" || editorSection === "metrics") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      02. Journal Venue &amp; Bibliometric Indicators
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Journal title, volume, issue, page spans, Clarivate impact factors, citation metrics, and quartile rankings.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Journal / Publisher Venue Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.journal}
                        onChange={(e) => setFormData({ ...formData, journal: e.target.value })}
                        placeholder="e.g. Environmental Pollution / Nature Climate Change"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Exact Publication Date (Optional)
                      </label>
                      <input
                        type="date"
                        value={formData.publication_date || ""}
                        onChange={(e) => setFormData({ ...formData, publication_date: e.target.value })}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Volume
                      </label>
                      <input
                        type="text"
                        value={formData.volume || ""}
                        onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
                        placeholder="e.g. 318"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Issue
                      </label>
                      <input
                        type="text"
                        value={formData.issue || ""}
                        onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                        placeholder="e.g. Part 2"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Page Range / Article ID
                      </label>
                      <input
                        type="text"
                        value={formData.pages || ""}
                        onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                        placeholder="e.g. 120543 or 102-115"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Impact Factor (IF)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.impact_factor || ""}
                        onChange={(e) => setFormData({ ...formData, impact_factor: e.target.value })}
                        placeholder="e.g. 8.9"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Citations Count
                      </label>
                      <input
                        type="number"
                        value={formData.citation_count || "0"}
                        onChange={(e) => setFormData({ ...formData, citation_count: e.target.value })}
                        placeholder="e.g. 42"
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Journal Quartile Rank
                      </label>
                      <select
                        value={formData.quartile || "Q1"}
                        onChange={(e) => setFormData({ ...formData, quartile: e.target.value })}
                        className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                      >
                        <option value="Q1">Q1 (Top 25% percentile)</option>
                        <option value="Q2">Q2 (Top 50% percentile)</option>
                        <option value="Q3">Q3 (Top 75% percentile)</option>
                        <option value="Q4">Q4 (Lowest 25% percentile)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. DOI & ACCESS LINKS */}
            {(editorSection === "all" || editorSection === "links") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <ExternalLink className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      03. Digital Object Identifier &amp; Open Access Links
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      Direct DOI resolver link, downloadable PDF full-text, and external repository anchors.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Digital Object Identifier (DOI)
                      </label>
                      <input
                        type="text"
                        value={formData.doi || ""}
                        onChange={(e) => handleDoiChange(e.target.value)}
                        placeholder="e.g. 10.1016/j.envpol.2023.121543"
                        className={`w-full px-4 py-2.5 text-sm font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                      <p className={`text-[11px] ${subText} mt-1.5`}>
                        Auto-generates official link: <code className="text-emerald-500">{formData.doi_url || "https://doi.org/..."}</code>
                      </p>
                    </div>

                    <div>
                      <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                        Open-Access PDF URL / Storage Path
                      </label>
                      <input
                        type="url"
                        value={formData.pdf_url || ""}
                        onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                        placeholder="https://... or /papers/study-2026.pdf"
                        className={`w-full px-4 py-2.5 text-sm font-mono rounded-xl border outline-none transition ${inputBg}`}
                      />
                      <p className={`text-[11px] ${subText} mt-1.5`}>
                        Enables one-click "Download PDF" button in public cards.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${headingText}`}>
                      External Publisher / ResearchGate Landing URL
                    </label>
                    <input
                      type="url"
                      value={formData.external_url || ""}
                      onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                      placeholder="https://sciencedirect.com/science/article/pii/..."
                      className={`w-full px-4 py-2.5 text-sm font-mono rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. AUTHORS & BIBTEX */}
            {(editorSection === "all" || editorSection === "authors") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-5 ${cardBg}`}>
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Quote className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className={`text-base font-bold ${headingText}`}>
                      04. Author Attribution &amp; BibTeX Citation
                    </h2>
                    <p className={`text-xs ${subText}`}>
                      APA-style authors list, lab member tagging, and raw BibTeX export block.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>
                        Authors List (APA Display Format) <span className="text-red-500">*</span>
                      </label>
                      <span className={`text-[11px] ${subText}`}>
                        Click to insert lab researcher tag below
                      </span>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.authors_text}
                      onChange={(e) => setFormData({ ...formData, authors_text: e.target.value })}
                      placeholder="e.g. Sultana, R., Rahman, M. M., Hossain, M. B., &amp; Alam, M. S."
                      className={`w-full px-4 py-2.5 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />

                    {/* Quick Lab Member Tags */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className={`text-[11px] font-semibold ${subText} mr-1`}>Lab Quick-Tags:</span>
                      {teamMembers.map((res) => (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => {
                            const current = formData.authors_text.trim();
                            const addition = res.name;
                            const next = current ? `${current}, ${addition}` : addition;
                            setFormData({ ...formData, authors_text: next });
                          }}
                          className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                            isLight ? "border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300"
                          }`}
                        >
                          + {res.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className={`text-xs font-bold uppercase tracking-wider ${headingText}`}>
                        Raw BibTeX Citation
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const autoBib = `@article{${formData.slug || "publication2026"},\n  title={${formData.title}},\n  author={${formData.authors_text}},\n  journal={${formData.journal}},\n  year={${formData.publication_year}},\n  doi={${formData.doi || ""}}\n}`;
                          setFormData({ ...formData, bibtex: autoBib });
                        }}
                        className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                      >
                        ⚡ Auto-Generate from Fields
                      </button>
                    </div>
                    <textarea
                      rows={5}
                      value={formData.bibtex || ""}
                      onChange={(e) => setFormData({ ...formData, bibtex: e.target.value })}
                      placeholder={`@article{sultana2026microplastics,\n  title={${formData.title || "Paper Title"}},\n  author={${formData.authors_text || "Author Names"}},\n  journal={${formData.journal || "Journal"}},\n  year={${formData.publication_year}}\n}`}
                      className={`w-full p-4 text-xs font-mono rounded-xl border outline-none transition resize-y ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. RESEARCH DISCIPLINES */}
            {(editorSection === "all" || editorSection === "areas") && (
              <div className={`p-6 sm:p-8 rounded-3xl border space-y-6 ${cardBg}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-base font-bold ${headingText}`}>
                        05. Thematic Research Disciplines
                      </h2>
                      <p className={`text-xs ${subText}`}>
                        Select all relevant scientific domains to enable smart categorical filtering in the public archive.
                      </p>
                    </div>
                  </div>

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
                          placeholder="e.g. Polymer Ecotoxicology &amp; Coastal Health"
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
                          placeholder="e.g. Microplastic particulate transport kinetics"
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
                        className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
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
                  {/* Live Status Toggle */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Publication Status
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Controls live visibility on public website archive
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
                        Featured Publication
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Showcase on laboratory homepage carousel
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

                  {/* Sorting Display Order */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                        Pin Priority Order
                      </div>
                      <p className={`text-[11px] ${subText} mt-1`}>
                        Higher numbers appear higher in default sorting
                      </p>
                    </div>
                    <input
                      type="number"
                      value={formData.display_order || 0}
                      onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                      className={`w-full px-3 py-2 text-sm rounded-xl border outline-none transition ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Actions */}
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
                    <span>Saving Publication...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Save Publication Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ========================================================================= */
        /* 3. PUBLICATIONS DIRECTORY LIST VIEW                                       */
        /* ========================================================================= */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <BookOpen className="w-5 h-5" />
                </span>
                <h1 className={`text-2xl font-bold tracking-tight ${headingText}`}>
                  Publications &amp; Papers CMS
                </h1>
              </div>
              <p className={`text-xs md:text-sm ${subText} mt-1.5`}>
                Manage peer-reviewed journal papers, reviews, and conference publications. Changes dynamically sync with the public archive.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
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
                href="/publications"
                target="_blank"
                className={`inline-flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-colors ${
                  isLight ? "border-slate-300 bg-white hover:bg-slate-50 text-slate-700" : "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                <span>View Public Archive</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
              </Link>

              {/* ⚡ BULK DOI IMPORT BUTTON */}
              <button
                onClick={handleOpenBulk}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
              >
                <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500" />
                <span>⚡ Bulk DOI Import</span>
              </button>

              {/* NEW PUBLICATION SINGLE BUTTON */}
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs md:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Publication</span>
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

          {/* Metrics Quick Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className={`text-xs font-semibold ${subText}`}>Total Publications</div>
              <div className={`text-2xl font-black ${headingText} mt-1`}>{totalCount}</div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className={`text-xs font-semibold ${subText}`}>Published in Archive</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {publishedCount}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className={`text-xs font-semibold ${subText}`}>Q1 Ranked Papers</div>
              <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {q1Count}
              </div>
            </div>
            <div className={`p-4 rounded-2xl border ${cardBg}`}>
              <div className={`text-xs font-semibold ${subText}`}>Total Citations</div>
              <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {totalCitations.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 ${cardBg}`}>
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search publications by title, journal, author, or DOI..."
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

            {/* Filter Selectors */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
              >
                <option value="all">All Document Types</option>
                <option value="journal_article">Journal Article</option>
                <option value="review">Review</option>
                <option value="conference_paper">Conference Paper</option>
                <option value="book_chapter">Book Chapter</option>
                <option value="technical_report">Technical Report</option>
                <option value="preprint">Preprint</option>
              </select>

              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className={`px-3 py-2 text-xs rounded-xl border outline-none transition ${inputBg}`}
              >
                <option value="all">All Years</option>
                {availableYears.map((y) => (
                  <option key={y} value={String(y)}>
                    {y}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
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

          {/* Publications Table */}
          <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
            {isLoading ? (
              <div className="p-12 text-center space-y-3">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mx-auto" />
                <p className={`text-xs ${subText}`}>Loading publications archive...</p>
              </div>
            ) : filteredPubs.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${headingText}`}>No Publications Found</h3>
                  <p className={`text-xs ${subText} max-w-sm mx-auto mt-1`}>
                    {searchQuery || typeFilter !== "all" || yearFilter !== "all"
                      ? "No records match your active search filters. Try clearing filters."
                      : "Start building the laboratory repository by importing DOIs in bulk or adding records manually."}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleOpenBulk}
                    className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 transition"
                  >
                    ⚡ Bulk DOI Import
                  </button>
                  <button
                    onClick={handleOpenAdd}
                    className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition"
                  >
                    + New Publication
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className={`border-b text-[11px] font-bold uppercase tracking-wider ${
                    isLight ? "bg-slate-50 border-slate-200 text-slate-500" : "bg-slate-900/60 border-slate-800 text-slate-400"
                  }`}>
                    <tr>
                      <th className="py-3.5 px-4">Publication Title &amp; Journal</th>
                      <th className="py-3.5 px-3">Year / Type</th>
                      <th className="py-3.5 px-3">Metrics</th>
                      <th className="py-3.5 px-3">Status</th>
                      <th className="py-3.5 px-3">Featured</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-medium">
                    {filteredPubs.map((pub) => (
                      <tr
                        key={pub.id}
                        className={`transition-colors ${
                          isLight ? "hover:bg-slate-50/80" : "hover:bg-slate-800/40"
                        }`}
                      >
                        {/* Title & Journal */}
                        <td className="py-4 px-4 max-w-md">
                          <div className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <span className={`font-bold text-sm leading-snug line-clamp-2 ${headingText}`}>
                                {pub.title}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                {pub.journal}
                              </span>
                              {pub.volume && <span className={subText}>· Vol {pub.volume}</span>}
                              {pub.pages && <span className={subText}>· pp. {pub.pages}</span>}
                            </div>

                            {pub.authors_text && (
                              <p className={`text-[11px] truncate max-w-sm ${subText}`}>
                                {pub.authors_text}
                              </p>
                            )}

                            {pub.doi && (
                              <a
                                href={pub.doi_url || `https://doi.org/${pub.doi}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-500 hover:text-emerald-500 transition"
                              >
                                <span>doi:{pub.doi}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </td>

                        {/* Year & Type */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`font-mono font-bold ${headingText}`}>
                              {pub.publication_year}
                            </span>
                            <div>
                              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {pub.publication_type.replace("_", " ")}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Metrics */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <div className="space-y-1">
                            {pub.impact_factor ? (
                              <div className="flex items-center gap-1 text-[11px]">
                                <span className="font-bold text-amber-500">IF: {pub.impact_factor}</span>
                                {pub.quartile && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500">
                                    {pub.quartile}
                                  </span>
                                )}
                              </div>
                            ) : null}
                            <div className="text-[11px] text-slate-500">
                              {pub.citation_count ? `${pub.citation_count} citations` : "0 citations"}
                            </div>
                          </div>
                        </td>

                        {/* Published Toggle */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <button
                            onClick={() => handleTogglePublish(pub)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                              pub.is_published
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                                : "bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300"
                            }`}
                          >
                            {pub.is_published ? "● Live" : "○ Draft"}
                          </button>
                        </td>

                        {/* Featured Toggle */}
                        <td className="py-4 px-3 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleFeatured(pub)}
                            className={`p-1.5 rounded-lg transition ${
                              pub.is_featured
                                ? "text-amber-500 hover:bg-amber-500/10"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                            title={pub.is_featured ? "Remove featured" : "Set as featured"}
                          >
                            <Star className={`w-4 h-4 ${pub.is_featured ? "fill-amber-500" : ""}`} />
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(pub)}
                              className={`p-2 rounded-xl border transition ${
                                isLight
                                  ? "border-slate-200 hover:bg-slate-100 text-slate-700"
                                  : "border-slate-700 hover:bg-slate-800 text-slate-300"
                              }`}
                              title="Edit publication dossier"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
                            </button>

                            <button
                              onClick={() => setDeleteConfirmId(pub.id)}
                              className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition"
                              title="Delete publication"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`max-w-md w-full p-6 rounded-3xl border shadow-2xl space-y-4 ${cardBg}`}>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className={`text-base font-bold ${headingText}`}>Delete Publication Record?</h3>
              <p className={`text-xs ${subText}`}>
                This will permanently remove the record and its citations from the public archive.
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
