"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Newspaper,
  Search,
  SlidersHorizontal,
  Calendar,
  Clock,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  Flame,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  Compass,
  Award,
  Radio,
  FileText,
  Share2,
  Check
} from "lucide-react";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { NewsArticle, NewsCategory } from "@/lib/news/types";
import { getPublishedNews, getNewsStats, getAvailableNewsYears } from "@/lib/news/queries";
import { NEWS_CATEGORIES_META } from "@/lib/news/seed-data";
import { getTeamMembers, getCachedTeamMembers } from "@/lib/team/store";

export default function NewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>(() => getCachedTeamMembers());
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalArticles: 0,
    breakthroughCount: 0,
    expeditionCount: 0,
    grantCount: 0,
    symposiumCount: 0,
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "az">("latest");

  // Pagination (6 articles per page)
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  // Load Data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [newsData, statsData, members] = await Promise.all([
        getPublishedNews({}, false),
        getNewsStats(),
        getTeamMembers(),
      ]);
      setArticles(newsData);
      setStats(statsData);
      if (members && members.length > 0) setTeamMembers(members);
    } catch (err) {
      console.error("Error loading news articles:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener("lab_news_updated", handleUpdate);
    return () => window.removeEventListener("lab_news_updated", handleUpdate);
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedYears, selectedAuthor, sortBy]);

  // Dynamic available years
  const availableYears = useMemo(() => getAvailableNewsYears(articles), [articles]);

  // Dynamic authors list from articles and team
  const availableAuthors = useMemo(() => {
    const names = new Set<string>();
    articles.forEach((a) => {
      if (a.author_name) names.add(a.author_name);
    });
    teamMembers.forEach((m) => {
      if (m.name) names.add(m.name);
    });
    return Array.from(names).sort();
  }, [articles, teamMembers]);

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedYears([]);
    setSelectedAuthor("all");
    setSortBy("latest");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "all" ||
    selectedYears.length > 0 ||
    selectedAuthor !== "all";

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    let result = [...articles];

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.summary.toLowerCase().includes(q) ||
          a.author_name.toLowerCase().includes(q) ||
          a.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category
    if (selectedCategory !== "all") {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Years (Multi-select)
    if (selectedYears.length > 0) {
      result = result.filter((a) => {
        const yr = new Date(a.published_at).getFullYear();
        return selectedYears.includes(yr);
      });
    }

    // Author
    if (selectedAuthor !== "all") {
      const auth = selectedAuthor.toLowerCase();
      result = result.filter((a) => a.author_name.toLowerCase().includes(auth));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      }
      if (sortBy === "az") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

    return result;
  }, [articles, searchQuery, selectedCategory, selectedYears, selectedAuthor, sortBy]);

  // Featured Spotlight Articles
  const featuredArticles = useMemo(() => {
    return articles.filter((a) => a.is_featured);
  }, [articles]);

  // Paginated articles
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#040810] text-slate-900 dark:text-slate-100 font-[family-name:var(--font-inter)] selection:bg-emerald-500 selection:text-white">
      {/* Global Navbar */}
      <Navbar />

      {/* ========================================================================= */}
      {/* 01 — HERO SECTION                                                         */}
      {/* ========================================================================= */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 relative overflow-hidden bg-gradient-to-b from-[#E8F3ED] via-[#F4F9F6] to-[#F8FAFC] dark:from-[#06120C] dark:via-[#040A14] dark:to-[#040810] border-b border-slate-200 dark:border-slate-800/80">
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 space-y-12">
          <div className="max-w-4xl space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/90 text-emerald-950 dark:text-[#34D399] border border-emerald-300 dark:border-emerald-800/60 text-xs font-bold uppercase tracking-wider shadow-xs">
              <Newspaper className="w-4 h-4 stroke-[2.4] text-emerald-700 dark:text-[#34D399]" />
              <span>Scientific Dispatches &amp; Field Insights</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12] font-[family-name:var(--font-manrope)]">
              Research Breakthroughs, Field Dispatches, and Lab News.
            </h1>

            <p className="text-base sm:text-lg text-slate-800 dark:text-slate-300 font-medium leading-relaxed max-w-3xl font-[family-name:var(--font-inter)]">
              Follow real-time scientific updates from our estuarine sampling expeditions, newly commissioned analytical spectroscopy facilities, grant announcements, and international conference keynotes.
            </p>
          </div>

          {/* 02 — RESEARCH OUTPUT & NEWS STATS BAR */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-[#34D399] flex items-center justify-center font-bold shrink-0">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  {stats.totalArticles}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Total Dispatches
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-900 dark:text-teal-300 flex items-center justify-center font-bold shrink-0">
                <Sparkles className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  {stats.breakthroughCount}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Breakthroughs
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-900 dark:text-blue-300 flex items-center justify-center font-bold shrink-0">
                <Compass className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  {stats.expeditionCount}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Field Expeditions
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 flex items-center justify-center font-bold shrink-0">
                <Award className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                  {stats.grantCount}
                </div>
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Grants &amp; Awards
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 03 — FEATURED LANDMARK STORIES SHOWCASE                                   */}
      {/* ========================================================================= */}
      {featuredArticles.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#F4F9F6] dark:bg-[#090F1B] border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#34D399] border border-emerald-300/80 dark:border-emerald-800/50 text-[11px] font-bold uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Spotlight Headlines</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
                  Featured Research Stories
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold">
                {featuredArticles.length} Landmark Articles
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArticles.slice(0, 3).map((article) => {
                const meta = NEWS_CATEGORIES_META[article.category] || NEWS_CATEGORIES_META.lab_update;

                return (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="group rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-600 dark:hover:border-emerald-400/40 transition-all flex flex-col justify-between"
                  >
                    {/* Cover Image */}
                    {article.cover_image_url && (
                      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img
                          src={article.cover_image_url}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-bold uppercase tracking-wider border shadow-xs ${meta.bgLight} ${meta.bgDark} ${meta.color} ${meta.borderLight} ${meta.borderDark}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Card Content */}
                    <div className="p-6 sm:p-7 space-y-3 flex-1 flex flex-col justify-between text-left">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{article.read_time_minutes} min read</span>
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug tracking-tight font-[family-name:var(--font-manrope)] group-hover:text-emerald-800 dark:group-hover:text-[#34D399] transition-colors">
                          {article.title}
                        </h3>

                        <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 leading-relaxed font-normal">
                          {article.summary}
                        </p>
                      </div>

                      {/* Author row & read link */}
                      <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {article.author_avatar ? (
                            <img
                              src={article.author_avatar}
                              alt={article.author_name}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-[#34D399] flex items-center justify-center text-[10px] font-bold">
                              {article.author_name[0]}
                            </div>
                          )}
                          <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                            {article.author_name}
                          </span>
                        </div>

                        <div className="inline-flex items-center gap-1 text-xs font-extrabold text-emerald-800 dark:text-[#34D399] group-hover:translate-x-1 transition-transform">
                          <span>Read Story</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 04 — NEWS ARCHIVE 2-COLUMN PARALLEL LAYOUT (LEFT SIDEBAR & RIGHT FEED)   */}
      {/* ========================================================================= */}
      <section id="news-archive" className="py-16 sm:py-20 relative">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* =================================================================== */}
            {/* LEFT COLUMN: STICKY FILTERS & SIDEBAR                               */}
            {/* =================================================================== */}
            <aside className="lg:col-span-4 xl:col-span-3.5 space-y-6 lg:sticky lg:top-24">
              
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

                {/* Search Bar */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Search Dispatches
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Keywords, field site, author..."
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

                {/* 1. FILTER BY TOPIC / CATEGORY */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Newspaper className="w-3.5 h-3.5 text-emerald-700 dark:text-[#34D399]" />
                      <span>Category / Topic</span>
                    </span>
                    {selectedCategory !== "all" && (
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="text-[11px] font-bold text-emerald-800 dark:text-[#34D399] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </label>

                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={`w-full p-2 rounded-xl text-left text-xs font-bold transition flex items-center justify-between ${
                        selectedCategory === "all"
                          ? "bg-emerald-800 text-white dark:bg-[#34D399] dark:text-slate-950 shadow-xs"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <span>All Categories</span>
                      <span className="font-mono text-[11px] opacity-75">{articles.length}</span>
                    </button>

                    {Object.entries(NEWS_CATEGORIES_META).map(([key, cat]) => {
                      const isSelected = selectedCategory === key;
                      const count = articles.filter((a) => a.category === key).length;

                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedCategory(isSelected ? "all" : key)}
                          className={`w-full p-2 rounded-xl text-left text-xs transition flex items-center justify-between gap-2 ${
                            isSelected
                              ? "bg-emerald-800 text-white dark:bg-[#34D399] dark:text-slate-950 shadow-xs font-bold"
                              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold"
                          }`}
                        >
                          <span className="truncate">{cat.label}</span>
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

                {/* 2. FILTER BY YEAR */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700 dark:text-[#34D399]" />
                      <span>Year</span>
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
                      <span>Author / Contributor</span>
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
                      <option value="all">All Authors ({articles.length} Stories)</option>
                      {availableAuthors.map((name) => {
                        const count = articles.filter((a) =>
                          a.author_name.toLowerCase().includes(name.toLowerCase())
                        ).length;
                        return (
                          <option key={name} value={name}>
                            {name} — ({count} {count === 1 ? "Story" : "Stories"})
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                      <ChevronRight className="w-4 h-4 rotate-90" />
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* =================================================================== */}
            {/* RIGHT COLUMN: MAIN NEWS FEED (PARALLEL & PAGINATED)                 */}
            {/* =================================================================== */}
            <main className="lg:col-span-8 xl:col-span-8.5 space-y-4">
              
              {/* Top Control Bar */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
                    Showing {filteredArticles.length} News &amp; Insights
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
                    <option value="az">Title (A–Z)</option>
                  </select>
                </div>
              </div>

              {/* Articles Cards Feed (6 per page) */}
              {isLoading ? (
                <div className="p-16 text-center space-y-3 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Loading scientific dispatches...</p>
                </div>
              ) : filteredArticles.length === 0 ? (
                <div className="p-16 text-center space-y-4 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800">
                  <Newspaper className="w-10 h-10 text-slate-400 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No articles matched your criteria</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                    Try adjusting your keywords or clearing category filters.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="px-4 py-2 rounded-xl bg-emerald-800 dark:bg-[#34D399] text-white dark:text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                paginatedArticles.map((article) => {
                  const meta = NEWS_CATEGORIES_META[article.category] || NEWS_CATEGORIES_META.lab_update;

                  return (
                    <article
                      key={article.id}
                      className="p-5 sm:p-6 lg:p-7 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-600 dark:hover:border-emerald-400/40 hover:shadow-md transition-all text-left flex flex-col md:flex-row gap-5 sm:gap-6 group overflow-hidden"
                    >
                      {/* Cover Thumbnail if present */}
                      {article.cover_image_url && (
                        <div className="w-full md:w-60 lg:w-64 xl:w-72 h-48 sm:h-52 md:h-auto md:min-h-[180px] md:self-stretch rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 relative">
                          <img
                            src={article.cover_image_url}
                            alt={article.title}
                            className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-2.5 left-2.5 z-10">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border shadow-xs ${meta.bgLight} ${meta.bgDark} ${meta.color} ${meta.borderLight} ${meta.borderDark}`}>
                              {meta.label}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Content Area */}
                      <div className="flex-1 flex flex-col justify-between space-y-3 min-w-0">
                        <div className="space-y-2">
                          {/* Top Meta */}
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            <div className="flex items-center gap-2">
                              {!article.cover_image_url && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${meta.bgLight} ${meta.bgDark} ${meta.color} ${meta.borderLight} ${meta.borderDark}`}>
                                  {meta.label}
                                </span>
                              )}
                              <span className="flex items-center gap-1 font-mono">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{new Date(article.published_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              </span>
                            </div>

                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{article.read_time_minutes} min read</span>
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight font-[family-name:var(--font-manrope)] group-hover:text-emerald-800 dark:group-hover:text-[#34D399] transition-colors">
                            <Link href={`/news/${article.slug}`}>
                              {article.title}
                            </Link>
                          </h3>

                          {/* Summary */}
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2">
                            {article.summary}
                          </p>

                          {/* Tags */}
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {article.tags.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Bottom Author Row & Action */}
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {article.author_avatar ? (
                              <img
                                src={article.author_avatar}
                                alt={article.author_name}
                                className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-[#34D399] flex items-center justify-center text-[10px] font-bold">
                                {article.author_name[0]}
                              </div>
                            )}
                            <div className="text-left">
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                {article.author_name}
                              </span>
                              {article.author_role && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                                  {article.author_role}
                                </span>
                              )}
                            </div>
                          </div>

                          <Link
                            href={`/news/${article.slug}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 dark:bg-[#34D399] dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-bold text-xs transition shadow-xs"
                          >
                            <span>Read Article</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}

              {/* Pagination Bar (6 items per page) */}
              {totalPages > 1 && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Showing <strong className="text-slate-900 dark:text-white font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</strong> to{" "}
                    <strong className="text-slate-900 dark:text-white font-bold">
                      {Math.min(currentPage * ITEMS_PER_PAGE, filteredArticles.length)}
                    </strong>{" "}
                    of <strong className="text-slate-900 dark:text-white font-bold">{filteredArticles.length}</strong> articles
                  </div>

                  <div className="flex items-center gap-2 self-center sm:self-auto">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(1, prev - 1));
                        document.getElementById("news-archive")?.scrollIntoView({ behavior: "smooth" });
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
                            document.getElementById("news-archive")?.scrollIntoView({ behavior: "smooth" });
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
                        document.getElementById("news-archive")?.scrollIntoView({ behavior: "smooth" });
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

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
