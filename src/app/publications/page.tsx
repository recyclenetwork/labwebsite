"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  BookOpen,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  Calendar,
  FileText,
  Bookmark,
  Share2,
  TrendingUp,
  Award,
  Globe2,
  Building2,
  Quote,
  ArrowUpRight,
  ArrowRight,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  Download,
  Flame,
  Layers,
  FlaskConical,
  GraduationCap,
  Users
} from "lucide-react";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { PublicationWithRelations, PublicationType } from "@/lib/publications/types";
import { getPublishedPublications, getPublicationStats, getAvailableYears } from "@/lib/publications/queries";
import { getAllResearchAreas } from "@/lib/research-areas/store";
import { getTeamMembers, getCachedTeamMembers } from "@/lib/team/store";

export default function PublicationsPage() {
  const [publications, setPublications] = useState<PublicationWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [researchAreas, setResearchAreas] = useState<any[]>(() => getAllResearchAreas());
  const [teamMembers, setTeamMembers] = useState<any[]>(() => getCachedTeamMembers());
  const [stats, setStats] = useState({
    totalPublications: 0,
    totalCitations: 0,
    topImpactFactor: 0,
    q1JournalCount: 0,
    journalCount: 0,
    openAccessRatio: "94%",
  });

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "citations" | "impact" | "az">("latest");

  // Pagination states (6 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedYears, selectedArea, selectedType, selectedAuthor, sortBy]);

  // Expanded abstract states (map of id -> boolean)
  const [expandedAbstracts, setExpandedAbstracts] = useState<Record<string, boolean>>({});
  
  // BibTeX Modal state
  const [activeBibtexPub, setActiveBibtexPub] = useState<PublicationWithRelations | null>(null);
  const [copiedBibtex, setCopiedBibtex] = useState(false);
  const [copiedDoiId, setCopiedDoiId] = useState<string | null>(null);

  // Load data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [pubs, statData, areas, members] = await Promise.all([
        getPublishedPublications({}, false),
        getPublicationStats(),
        Promise.resolve(getAllResearchAreas()),
        getTeamMembers(),
      ]);
      setPublications(pubs);
      setStats(statData);
      if (areas && areas.length > 0) setResearchAreas(areas);
      if (members && members.length > 0) setTeamMembers(members);
    } catch (err) {
      console.error("Error loading publications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Listen to local publication updates from admin
    const handleUpdate = () => loadData();
    window.addEventListener("lab_publications_updated", handleUpdate);
    return () => window.removeEventListener("lab_publications_updated", handleUpdate);
  }, []);

  // Available dynamic years
  const availableYears = useMemo(() => getAvailableYears(publications), [publications]);

  // Handle year toggle (checkbox / box selection)
  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedYears([]);
    setSelectedArea("all");
    setSelectedType("all");
    setSelectedAuthor("all");
    setSortBy("latest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedYears.length > 0 ||
    selectedArea !== "all" ||
    selectedType !== "all" ||
    selectedAuthor !== "all";

  // Filtered publications
  const filteredPublications = useMemo(() => {
    let result = [...publications];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.journal.toLowerCase().includes(q) ||
          (p.abstract && p.abstract.toLowerCase().includes(q)) ||
          (p.authors_text && p.authors_text.toLowerCase().includes(q)) ||
          (p.doi && p.doi.toLowerCase().includes(q))
      );
    }

    // Years (multi-select)
    if (selectedYears.length > 0) {
      result = result.filter((p) => selectedYears.includes(p.publication_year));
    }

    // Research Area
    if (selectedArea !== "all") {
      result = result.filter((p) =>
        p.research_areas?.some((a) => a.slug === selectedArea || a.id === selectedArea || a.title === selectedArea)
      );
    }

    // Publication Type
    if (selectedType !== "all") {
      result = result.filter((p) => p.publication_type === selectedType);
    }

    // Author
    if (selectedAuthor !== "all") {
      const auth = selectedAuthor.toLowerCase();
      result = result.filter(
        (p) =>
          (p.authors_text && p.authors_text.toLowerCase().includes(auth)) ||
          p.authors?.some((a) => a.name.toLowerCase().includes(auth) || (a.slug && a.slug.includes(auth)))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "latest") {
        return b.publication_year - a.publication_year || new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return a.publication_year - b.publication_year || new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "citations") {
        return (b.citation_count || 0) - (a.citation_count || 0);
      }
      if (sortBy === "impact") {
        return (b.impact_factor || 0) - (a.impact_factor || 0);
      }
      if (sortBy === "az") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [publications, searchQuery, selectedYears, selectedArea, selectedType, selectedAuthor, sortBy]);

  // Paginated subset of publications
  const totalPages = Math.ceil(filteredPublications.length / ITEMS_PER_PAGE) || 1;
  const paginatedPublications = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPublications.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredPublications, currentPage]);

  // Featured publications list (for spotlight section)
  const featuredPublications = useMemo(() => {
    return publications.filter((p) => p.is_featured);
  }, [publications]);

  // Grouped by Year for Timeline Archive
  const publicationsByYear = useMemo(() => {
    const grouped: Record<number, PublicationWithRelations[]> = {};
    publications.forEach((p) => {
      const yr = p.publication_year;
      if (!grouped[yr]) grouped[yr] = [];
      grouped[yr].push(p);
    });
    return grouped;
  }, [publications]);

  // Copy BibTeX action
  const handleCopyBibtex = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBibtex(true);
    setTimeout(() => setCopiedBibtex(false), 2000);
  };

  // Copy DOI citation action
  const handleCopyDoi = (doi: string, id: string) => {
    navigator.clipboard.writeText(`https://doi.org/${doi}`);
    setCopiedDoiId(id);
    setTimeout(() => setCopiedDoiId(null), 2000);
  };

  const toggleAbstract = (id: string) => {
    setExpandedAbstracts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const formatPublicationTypeLabel = (type: PublicationType) => {
    switch (type) {
      case "journal_article":
        return "Journal Article";
      case "review":
        return "Review Article";
      case "conference_paper":
        return "Conference Paper";
      case "book_chapter":
        return "Book Chapter";
      case "technical_report":
        return "Technical Report";
      case "preprint":
        return "Preprint";
      default:
        return "Scientific Paper";
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070B12] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      <Navbar />

      {/* ========================================================================= */}
      {/* 01 — PUBLICATIONS HERO                                                    */}
      {/* ========================================================================= */}
      <section className="relative pt-32 sm:pt-40 pb-16 sm:pb-24 overflow-hidden border-b border-slate-200/80 dark:border-slate-800/60 bg-gradient-to-b from-[#EBF5EF] via-[#F4F9F6] to-[#F8FAFC] dark:from-[#091510] dark:via-[#070E12] dark:to-[#070B12]">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 left-10 w-[400px] h-[300px] bg-teal-500/10 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
          <div className="max-w-4xl space-y-6">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 border border-emerald-300/80 dark:border-emerald-800/50 text-emerald-900 dark:text-[#34D399] text-xs font-semibold uppercase tracking-wider shadow-xs">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-[#34D399]" />
              <span>Scientific Outputs &amp; Discovery Repository</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] leading-[1.12]">
              Peer-Reviewed Publications &amp; <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600 dark:from-emerald-300 dark:via-[#34D399] dark:to-teal-200 bg-clip-text text-transparent">
                High-Impact Discoveries
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-[family-name:var(--font-inter)] font-medium max-w-3xl">
              Exploring empirical evidence on microplastic kinetics, hazardous trace metal speciation,
              environmental ecotoxicology, and watershed health. Access published manuscripts, DOI links,
              and open datasets.
            </p>

            {/* Hero Quick Search Bar */}
            <div className="pt-2 max-w-2xl">
              <div className="relative flex items-center shadow-lg shadow-emerald-950/5 dark:shadow-black/40 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-300 dark:border-slate-800 p-1.5 focus-within:border-emerald-600 dark:focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                <Search className="w-5 h-5 ml-3 text-slate-500 dark:text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search papers by keyword, title, author, journal, or DOI..."
                  className="w-full px-3 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 outline-none font-[family-name:var(--font-inter)] font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="p-1.5 mr-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <a
                  href="#publications-archive"
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 dark:from-emerald-500 dark:to-teal-500 text-white dark:text-slate-950 font-bold text-xs transition hover:opacity-95 shrink-0"
                >
                  <span>Browse Papers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 02 — RESEARCH OUTPUT STATS                                                */}
      {/* ========================================================================= */}
      <section className="py-8 sm:py-10 bg-white dark:bg-[#0B1120]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
            {/* Stat 1: Total Publications */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-[#34D399] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  {stats.totalPublications > 0 ? `${stats.totalPublications}+` : "50+"}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Publications
                </div>
              </div>
            </div>

            {/* Stat 2: Total Citations */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 flex items-center justify-center shrink-0">
                <Quote className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  {stats.totalCitations > 0 ? `${stats.totalCitations}+` : "750+"}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Citations
                </div>
              </div>
            </div>

            {/* Stat 3: Top Impact Factor */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] font-mono">
                  {stats.topImpactFactor > 0 ? stats.topImpactFactor : "13.6"}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Peak Impact Factor
                </div>
              </div>
            </div>

            {/* Stat 4: Q1 Journals */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-900 dark:text-purple-300 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  85%
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Q1 Tier Journals
                </div>
              </div>
            </div>

            {/* Stat 5: Open Access */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A]/70 border border-slate-200 dark:border-slate-800 flex items-center gap-3.5 col-span-2 lg:col-span-1">
              <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  {stats.openAccessRatio}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Open Science / DOI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 04 — FEATURED PUBLICATIONS (LANDMARK HIGHLIGHTS)                          */}
      {/* ========================================================================= */}
      {featuredPublications.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#F4F9F6] dark:bg-[#090F1B] border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#34D399] border border-emerald-300/80 dark:border-emerald-800/50 text-[11px] font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Flagship Scientific Discoveries</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
                  Featured Landmark Publications
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                {featuredPublications.length} High-Impact Manuscripts
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPublications.slice(0, 3).map((pub) => (
                <div
                  key={pub.id}
                  className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 p-7 shadow-xs hover:shadow-xl hover:border-emerald-600 dark:hover:border-emerald-400/40 transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-950 dark:text-[#34D399] border border-emerald-300 dark:border-emerald-800 text-[11px] font-bold font-mono">
                          {pub.publication_year}
                        </span>
                        {pub.quartile && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 text-[10px] font-bold font-mono">
                            {pub.quartile}
                          </span>
                        )}
                      </div>
                      {pub.impact_factor && (
                        <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                          IF: <strong className="text-emerald-800 dark:text-[#34D399] font-extrabold">{pub.impact_factor}</strong>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight font-[family-name:var(--font-manrope)] group-hover:text-emerald-800 dark:group-hover:text-[#34D399] transition-colors">
                      {pub.title}
                    </h3>

                    {/* Authors */}
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold line-clamp-2 leading-relaxed font-[family-name:var(--font-inter)]">
                      {pub.authors_text}
                    </p>

                    {/* Journal */}
                    <div className="text-xs font-bold italic text-emerald-900 dark:text-[#34D399]">
                      {pub.journal} {pub.volume && `· Vol. ${pub.volume}`}
                    </div>

                    {/* Short Abstract */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-normal">
                      {pub.abstract}
                    </p>
                  </div>

                  {/* Card Bottom Links */}
                  <div className="pt-5 mt-6 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-3 text-xs">
                    {pub.doi ? (
                      <a
                        href={pub.doi_url || `https://doi.org/${pub.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-emerald-800 dark:text-[#34D399] hover:underline"
                      >
                        <span>View on Publisher (DOI)</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-slate-600 dark:text-slate-400 font-medium">Peer-Reviewed Article</span>
                    )}

                    <button
                      onClick={() => setActiveBibtexPub(pub)}
                      className="p-2 rounded-lg text-slate-600 hover:text-emerald-800 dark:hover:text-[#34D399] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      title="Cite & BibTeX"
                    >
                      <Quote className="w-4 h-4 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 03 & 05 — PUBLICATION 2-COLUMN PARALLEL LAYOUT (LEFT SIDEBAR & RIGHT PAPERS) */}
      {/* ========================================================================= */}
      <section id="publications-archive" className="py-16 sm:py-20 relative">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* =================================================================== */}
            {/* LEFT COLUMN: STICKY FILTERS & SIDEBAR (ORDER: Discipline, Year, Author Dropdown) */}
            {/* =================================================================== */}
            <aside className="lg:col-span-4 xl:col-span-3.5 space-y-6 lg:sticky lg:top-24">
              
              {/* Sidebar Header & Clear Actions */}
              <div className="rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4 text-emerald-700 dark:text-[#34D399] stroke-[2.2]" />
                    <h2 className="text-base font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                      Filters &amp; Search
                    </h2>
                  </div>
                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="text-xs font-bold text-rose-700 dark:text-rose-400 hover:underline flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                {/* Instant Search Bar inside Sidebar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Search Archive
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Title, topic, DOI..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-600 font-medium"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 1. FILTER BY RESEARCH DISCIPLINE */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <FlaskConical className="w-3.5 h-3.5 text-emerald-700 dark:text-[#34D399]" />
                      <span>Research Discipline</span>
                    </span>
                    {selectedArea !== "all" && (
                      <button
                        onClick={() => setSelectedArea("all")}
                        className="text-[11px] font-bold text-emerald-800 dark:text-[#34D399] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </label>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedArea("all")}
                      className={`w-full p-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${
                        selectedArea === "all"
                          ? "bg-emerald-800 text-white dark:bg-[#34D399] dark:text-slate-950 shadow-xs"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span>All Disciplines</span>
                      <span className="font-mono text-[11px] opacity-75">{publications.length}</span>
                    </button>

                    {researchAreas.map((area) => {
                      const isSelected = selectedArea === area.slug;
                      const count = publications.filter((p) =>
                        p.research_areas?.some((a) => a.slug === area.slug || a.id === area.id)
                      ).length;

                      return (
                        <button
                          key={area.id}
                          type="button"
                          onClick={() => setSelectedArea(isSelected ? "all" : area.slug)}
                          className={`w-full p-2 rounded-xl text-left text-xs transition flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-emerald-800 text-white dark:bg-[#34D399] dark:text-slate-950 shadow-xs font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                          }`}
                        >
                          <span className="truncate">{area.title}</span>
                          <span className={`text-[10.5px] font-mono px-1.5 py-0.5 rounded-md ${
                            isSelected
                              ? "bg-emerald-900/40 dark:bg-slate-900/40 text-white dark:text-slate-950 font-bold"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. FILTER BY PUBLICATION YEAR */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-[#34D399]" />
                      <span>Publication Year</span>
                    </span>
                    {selectedYears.length > 0 && (
                      <button
                        onClick={() => setSelectedYears([])}
                        className="text-[11px] font-bold text-emerald-800 dark:text-[#34D399] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </label>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedYears([])}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border shadow-xs ${
                        selectedYears.length === 0
                          ? "bg-emerald-800 text-white dark:bg-[#34D399] dark:text-slate-950 border-emerald-800 dark:border-[#34D399]"
                          : "bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-800 hover:border-emerald-600"
                      }`}
                    >
                      All
                    </button>
                    {availableYears.map((yr) => {
                      const isSelected = selectedYears.includes(yr);
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => toggleYear(yr)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold transition border flex items-center gap-1 shadow-xs ${
                            isSelected
                              ? "bg-emerald-800 text-white dark:bg-[#34D399] dark:text-slate-950 border-emerald-800 dark:border-[#34D399]"
                              : "bg-slate-50 dark:bg-[#0F172A] text-slate-900 dark:text-slate-200 border-slate-300 dark:border-slate-800 hover:border-emerald-600"
                          }`}
                        >
                          <span>{yr}</span>
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. FILTER BY AUTHOR (DROPDOWN TYPE) */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700 dark:text-[#34D399]" />
                      <span>Filter by Author</span>
                    </span>
                    {selectedAuthor !== "all" && (
                      <button
                        onClick={() => setSelectedAuthor("all")}
                        className="text-[11px] font-bold text-emerald-800 dark:text-[#34D399] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </label>

                  <div className="relative">
                    <select
                      value={selectedAuthor}
                      onChange={(e) => setSelectedAuthor(e.target.value)}
                      className="w-full pl-3 pr-9 py-2.5 text-xs font-bold rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 appearance-none shadow-xs cursor-pointer"
                    >
                      <option value="all">All Lab Authors ({publications.length} Papers)</option>
                      {teamMembers.map((res) => {
                        const authorPubCount = publications.filter((p) =>
                          (p.authors_text && p.authors_text.toLowerCase().includes(res.name.toLowerCase())) ||
                          p.authors?.some((a) => a.name.toLowerCase().includes(res.name.toLowerCase()))
                        ).length;
                        return (
                          <option key={res.id} value={res.name}>
                            {res.name} — ({authorPubCount} {authorPubCount === 1 ? "Paper" : "Papers"})
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* 4. FILTER BY PUBLICATION TYPE */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Publication Type
                  </label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 shadow-xs"
                  >
                    <option value="all">All Types</option>
                    <option value="journal_article">Journal Article</option>
                    <option value="review">Review Article</option>
                    <option value="conference_paper">Conference Proceeding</option>
                    <option value="book_chapter">Book Chapter</option>
                    <option value="technical_report">Technical Report</option>
                    <option value="preprint">Preprint</option>
                  </select>
                </div>
              </div>
            </aside>

            {/* =================================================================== */}
            {/* RIGHT COLUMN: MAIN PUBLICATIONS LIST FEED (PARALLEL & PAGINATED)    */}
            {/* =================================================================== */}
            <main className="lg:col-span-8 xl:col-span-8.5 space-y-4">
              
              {/* Top Control Feed Bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                    Showing {filteredPublications.length} Scientific Outputs
                  </div>
                  {selectedAuthor !== "all" && (
                    <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-[#34D399]">
                      <span>Filtering by author: <strong>{selectedAuthor}</strong></span>
                      <button onClick={() => setSelectedAuthor("all")} className="hover:text-rose-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100 outline-none focus:border-emerald-600 shadow-xs"
                  >
                    <option value="latest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="citations">Most Cited</option>
                    <option value="impact">Highest Impact Factor</option>
                    <option value="az">Title (A–Z)</option>
                  </select>
                </div>
              </div>

              {/* Publications Cards List (Paginated 6 per page) */}
              {isLoading ? (
                <div className="p-16 text-center space-y-3 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading publications repository...</p>
                </div>
              ) : filteredPublications.length === 0 ? (
                <div className="p-16 text-center space-y-4 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
                  <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No publications matched your query</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    Try resetting active author filters or searching for different keywords such as &ldquo;microplastic&rdquo; or &ldquo;ecotoxicology&rdquo;.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 rounded-xl bg-emerald-800 dark:bg-[#34D399] text-white dark:text-slate-950 text-xs font-bold"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                paginatedPublications.map((pub, index) => {
                  const isAbstractExpanded = !!expandedAbstracts[pub.id];

                  return (
                    <article
                      key={pub.id}
                      className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-600 dark:hover:border-emerald-400/40 hover:shadow-md transition-all space-y-4 text-left"
                    >
                      {/* Top Meta Line: Year, Journal Badge, Quartile, Impact Factor */}
                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-950 dark:text-[#34D399] border border-emerald-300 dark:border-emerald-800 font-mono font-bold">
                            {pub.publication_year}
                          </span>

                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 font-bold text-[11px] border border-slate-200 dark:border-slate-700">
                            {formatPublicationTypeLabel(pub.publication_type)}
                          </span>

                          {pub.quartile && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60 font-mono font-bold text-[10.5px]">
                              {pub.quartile}
                            </span>
                          )}

                          {pub.impact_factor && (
                            <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-medium">
                              Impact Factor: <strong className="text-slate-950 dark:text-slate-100 font-bold">{pub.impact_factor}</strong>
                            </span>
                          )}

                          {pub.citation_count && pub.citation_count > 0 ? (
                            <span className="text-[11px] font-mono text-slate-700 dark:text-slate-300 font-medium">
                              Citations: <strong className="text-slate-950 dark:text-slate-100 font-bold">{pub.citation_count}</strong>
                            </span>
                          ) : null}
                        </div>

                        {/* Research area tags */}
                        {pub.research_areas && pub.research_areas.length > 0 && (
                          <div className="hidden sm:flex items-center gap-1.5">
                            {pub.research_areas.map((area) => (
                              <span
                                key={area.id}
                                className="text-[11px] font-semibold px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                              >
                                {area.title}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Publication Title */}
                      <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight font-[family-name:var(--font-manrope)]">
                        {pub.title}
                      </h3>

                      {/* Author String */}
                      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed font-[family-name:var(--font-inter)]">
                        {pub.authors_text}
                      </p>

                      {/* Journal Citation Line */}
                      <div className="text-xs sm:text-[13px] font-bold text-emerald-900 dark:text-[#34D399] flex flex-wrap items-center gap-2">
                        <span className="italic">{pub.journal}</span>
                        {pub.volume && <span>· Vol. {pub.volume}</span>}
                        {pub.issue && <span>({pub.issue})</span>}
                        {pub.pages && <span>· pp. {pub.pages}</span>}
                      </div>

                      {/* Expandable Abstract */}
                      {pub.abstract && (
                        <div className="space-y-2 pt-1">
                          <div
                            className={`text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-[family-name:var(--font-inter)] transition-all ${
                              isAbstractExpanded ? "" : "line-clamp-2"
                            }`}
                          >
                            <strong className="text-slate-950 dark:text-slate-100 font-bold">Abstract: </strong>
                            {pub.abstract}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleAbstract(pub.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 dark:text-[#34D399] hover:underline cursor-pointer"
                          >
                            <span>{isAbstractExpanded ? "Hide Abstract" : "Read Full Abstract"}</span>
                            {isAbstractExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      )}

                      {/* Cross-linked Projects if any */}
                      {pub.projects && pub.projects.length > 0 && (
                        <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Linked Project:</span>
                          {pub.projects.map((proj) => (
                            <Link
                              key={proj.id}
                              href={`/projects/${proj.slug}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300 border border-teal-300 dark:border-teal-800/40 hover:bg-teal-100 transition text-[11px] font-bold"
                            >
                              <FlaskConical className="w-3 h-3" />
                              <span>{proj.title}</span>
                              <ArrowUpRight className="w-3 h-3 opacity-70" />
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Actions Row: DOI direct button, Copy DOI, BibTeX Modal, PDF */}
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {pub.doi ? (
                            <a
                              href={pub.doi_url || `https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-[#34D399] dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold transition shadow-xs"
                            >
                              <span>Open via Publisher (DOI)</span>
                              <ExternalLink className="w-3.5 h-3.5 stroke-[2.5]" />
                            </a>
                          ) : null}

                          {pub.doi && (
                            <button
                              type="button"
                              onClick={() => handleCopyDoi(pub.doi!, pub.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 font-bold transition border border-slate-300 dark:border-slate-700"
                              title="Copy DOI Link"
                            >
                              {copiedDoiId === pub.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#34D399]" />
                                  <span className="text-emerald-800 dark:text-[#34D399]">DOI Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span className="font-mono text-[11px]">{pub.doi}</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveBibtexPub(pub)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-200 font-bold transition shadow-xs"
                          >
                            <Quote className="w-3.5 h-3.5 text-emerald-700 dark:text-[#34D399] stroke-[2.2]" />
                            <span>Cite / BibTeX</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}

              {/* Pagination Controls (6 items per page) */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Showing <strong className="text-slate-900 dark:text-white font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredPublications.length)}
                    </strong>{" "}
                    of <strong className="text-slate-900 dark:text-white font-bold">{filteredPublications.length}</strong> publications
                  </div>

                  <div className="flex items-center gap-2 self-center sm:self-auto">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        document.getElementById("publications-archive")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        currentPage === 1
                          ? "opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => {
                            setCurrentPage(page);
                            document.getElementById("publications-archive")?.scrollIntoView({ behavior: "smooth" });
                          }}
                          className={`w-8 h-8 rounded-xl text-xs font-bold font-mono transition border ${
                            currentPage === page
                              ? "bg-emerald-800 text-white dark:bg-[#34D399] dark:text-slate-950 border-emerald-800 dark:border-[#34D399] shadow-xs"
                              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-300 hover:border-emerald-600 cursor-pointer"
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1));
                        document.getElementById("publications-archive")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                        currentPage === totalPages
                          ? "opacity-40 cursor-not-allowed border-slate-200 dark:border-slate-800 text-slate-400"
                          : "border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
                      }`}
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 06 — RESEARCH-BY-YEAR / TIMELINE ARCHIVE                                 */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-20 bg-[#EEF5F1] dark:bg-[#090E17] border-t border-slate-200 dark:border-slate-800/80">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-10">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-[#34D399] border border-emerald-300 dark:border-emerald-800/50 text-[11px] font-bold uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>Chronological Productivity</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
              Research Timeline Archive
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              A chronological trajectory of peer-reviewed articles and research reports published by our laboratory members.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {availableYears.map((year) => {
              const yearPubs = publicationsByYear[year] || [];
              return (
                <div
                  key={year}
                  onClick={() => {
                    setSelectedYears([year]);
                    const el = document.getElementById("publications-archive");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="p-6 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-600 dark:hover:border-emerald-400 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-mono font-[family-name:var(--font-manrope)] group-hover:text-emerald-800 dark:group-hover:text-[#34D399] transition-colors">
                      {year}
                    </span>
                    <span className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-[#34D399] border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xs font-extrabold font-mono">
                      {yearPubs.length}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 line-clamp-2">
                    {yearPubs.map((p) => p.journal).filter(Boolean).slice(0, 2).join(", ")}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-extrabold text-emerald-800 dark:text-[#34D399]">
                    <span>View {yearPubs.length} Papers</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 07 — PUBLICATION CTA / COLLABORATION & DATA REQUEST                       */}
      {/* ========================================================================= */}
      <section className="py-20 sm:py-24 bg-gradient-to-br from-[#092B19] via-[#04160B] to-[#020F07] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
          <div className="max-w-3xl space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#34D399] text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Collaborative Science &amp; Open Access</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-[family-name:var(--font-manrope)] leading-tight tracking-tight">
              Request Full Datasets, Reprints, or Propose a Co-Authored Study.
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-[family-name:var(--font-inter)]">
              Our laboratory is committed to FAIR (Findable, Accessible, Interoperable, Reusable) scientific data.
              If you require raw mass spectrometry runs, micro-FTIR library matches, or would like to initiate a joint grant, connect with our principal investigators.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
              >
                <span>Contact Principal Investigator</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs tracking-wider transition-all"
              >
                <span>Explore Ongoing Research</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 08 — FOOTER                                                               */}
      {/* ========================================================================= */}
      <Footer />

      {/* ========================================================================= */}
      {/* BIBTEX CITATION MODAL                                                     */}
      {/* ========================================================================= */}
      {activeBibtexPub && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Quote className="w-5 h-5 text-emerald-600 dark:text-[#34D399]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  Citation &amp; BibTeX Reference
                </h3>
              </div>
              <button
                onClick={() => setActiveBibtexPub(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                APA 7th Edition Format
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#070B12] border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-[family-name:var(--font-inter)]">
                {activeBibtexPub.authors_text} ({activeBibtexPub.publication_year}). {activeBibtexPub.title}.{" "}
                <em className="font-semibold">{activeBibtexPub.journal}</em>
                {activeBibtexPub.volume ? `, ${activeBibtexPub.volume}` : ""}
                {activeBibtexPub.pages ? `, ${activeBibtexPub.pages}` : ""}.{" "}
                {activeBibtexPub.doi ? `https://doi.org/${activeBibtexPub.doi}` : ""}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  BibTeX Record
                </span>
                <button
                  type="button"
                  onClick={() =>
                    handleCopyBibtex(
                      activeBibtexPub.bibtex ||
                        `@article{${activeBibtexPub.slug.slice(0, 15)},\n  title={${activeBibtexPub.title}},\n  author={${activeBibtexPub.authors_text}},\n  journal={${activeBibtexPub.journal}},\n  year={${activeBibtexPub.publication_year}}\n}`
                    )
                  }
                  className="inline-flex items-center gap-1 text-emerald-700 dark:text-[#34D399] font-bold hover:underline"
                >
                  {copiedBibtex ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy BibTeX</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-[11px] leading-relaxed overflow-x-auto max-h-56">
                {activeBibtexPub.bibtex ||
                  `@article{${activeBibtexPub.slug.slice(0, 15)},\n  title={${activeBibtexPub.title}},\n  author={${activeBibtexPub.authors_text}},\n  journal={${activeBibtexPub.journal}},\n  year={${activeBibtexPub.publication_year}},\n  doi={${activeBibtexPub.doi || ""}}\n}`}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveBibtexPub(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200"
              >
                Close
              </button>
              {activeBibtexPub.doi && (
                <a
                  href={activeBibtexPub.doi_url || `https://doi.org/${activeBibtexPub.doi}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-800 dark:bg-[#34D399] text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5"
                >
                  <span>Open DOI Publisher</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
