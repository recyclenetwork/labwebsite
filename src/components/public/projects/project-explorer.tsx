"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ProjectWithRelations,
  ProjectResearchArea,
  ProjectFilterParams,
  ProjectStats as StatsType,
} from "@/lib/projects/types";
import { getPublishedProjects, getProjectStats } from "@/lib/projects/queries";
import { ProjectsHero } from "./projects-hero";
import { FeaturedProjectsSlider } from "./featured-projects-slider";
import { ProjectFilters } from "./project-filters";
import { ProjectList } from "./project-list";
import { ProjectSkeleton } from "./project-skeleton";
import { ProjectEmptyState } from "./project-empty-state";
import { ProjectWorkflowBanner } from "./project-workflow-banner";
import { Search, X, SlidersHorizontal, ArrowRight, ArrowLeft, Layers, ArrowUpDown } from "lucide-react";
import { DeveloperWatermark, isCreatorQuery } from "../developer-watermark";

interface ProjectExplorerProps {
  initialProjects: ProjectWithRelations[];
  initialStats: StatsType;
  researchAreas: ProjectResearchArea[];
}

export function ProjectExplorer({
  initialProjects,
  initialStats,
  researchAreas,
}: ProjectExplorerProps) {
  const searchParams = useSearchParams();

  // Extract initial filters from URL query parameters
  const [filters, setFilters] = useState<ProjectFilterParams>({
    status: searchParams.get("status") || "all",
    area: searchParams.get("area") || "all",
    year: searchParams.get("year") || "all",
    sort: (searchParams.get("sort") as any) || "latest",
    search: searchParams.get("search") || "",
  });

  const [projects, setProjects] = useState<ProjectWithRelations[]>(initialProjects);
  const [stats, setStats] = useState<StatsType>(initialStats);
  const [loading, setLoading] = useState(false);
  const [hasRealtimeUpdate, setHasRealtimeUpdate] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  // Search input state with debounce
  const [searchInput, setSearchInput] = useState(filters.search || "");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchInput !== (filters.search || "")) {
        handleFilterChange({ search: searchInput });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput]);

  // Extract all unique individual calendar project years for box filter (e.g. 2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019)
  const availableYears = useMemo(() => {
    const yearSet = new Set<string>();
    initialProjects.forEach((p) => {
      if (p.year) {
        const matches = p.year.match(/\b(19\d\d|20\d\d)\b/g);
        if (matches) {
          matches.forEach((y) => yearSet.add(y));
          if (matches.length >= 2) {
            const start = Math.min(...matches.map(Number));
            const end = Math.max(...matches.map(Number));
            for (let y = start; y <= end; y++) {
              yearSet.add(y.toString());
            }
          }
        }
      }
      if (p.start_date) {
        const startYear = new Date(p.start_date).getFullYear();
        if (!isNaN(startYear)) yearSet.add(startYear.toString());
      }
      if (p.end_date) {
        const endYear = new Date(p.end_date).getFullYear();
        if (!isNaN(endYear)) yearSet.add(endYear.toString());
      }
    });

    // Ensure recent history years (e.g., 2019 to current) are present
    for (let y = 2019; y <= 2026; y++) {
      yearSet.add(y.toString());
    }

    return Array.from(yearSet).sort((a, b) => Number(b) - Number(a));
  }, [initialProjects]);

  // Sync state to URL Query Parameters
  const updateUrlParams = (newFilters: ProjectFilterParams) => {
    const params = new URLSearchParams();
    if (newFilters.status && newFilters.status !== "all") params.set("status", newFilters.status);
    if (newFilters.area && newFilters.area !== "all") params.set("area", newFilters.area);
    if (newFilters.year && newFilters.year !== "all") params.set("year", newFilters.year);
    if (newFilters.sort && newFilters.sort !== "latest") params.set("sort", newFilters.sort);
    if (newFilters.search && newFilters.search.trim() !== "") params.set("search", newFilters.search.trim());

    const queryString = params.toString();
    const targetUrl = queryString ? `/projects?${queryString}` : "/projects";
    window.history.replaceState(null, "", targetUrl);
  };

  // Fetch / apply filters
  const applyFilters = async (updatedFilters: ProjectFilterParams) => {
    setLoading(true);
    try {
      const filtered = await getPublishedProjects(updatedFilters, false);
      setProjects(filtered);
      setCurrentPage(1);
    } catch (err) {
      console.error("Error applying project filters:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (partial: Partial<ProjectFilterParams>) => {
    const updated = { ...filters, ...partial };
    setFilters(updated);
    updateUrlParams(updated);
    applyFilters(updated);
  };

  // Handle reset
  const handleReset = () => {
    const resetFilters: ProjectFilterParams = {
      status: "all",
      area: "all",
      year: "all",
      sort: "latest",
      search: "",
    };
    setSearchInput("");
    setFilters(resetFilters);
    updateUrlParams(resetFilters);
    applyFilters(resetFilters);
  };

  // Supabase Realtime Subscription setup
  useEffect(() => {
    let channel: any = null;
    try {
      const supabase = createClient();
      channel = supabase
        .channel("public:projects:realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "projects" },
          () => {
            setHasRealtimeUpdate(true);
          }
        )
        .subscribe();
    } catch (err) {
      console.warn("Realtime subscription initialization:", err);
    }

    const handleStorageUpdate = () => {
      setHasRealtimeUpdate(true);
    };
    window.addEventListener("lab_projects_updated", handleStorageUpdate);

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // ignore
        }
      }
      window.removeEventListener("lab_projects_updated", handleStorageUpdate);
    };
  }, []);

  const handleRefreshRealtime = async () => {
    setHasRealtimeUpdate(false);
    const [freshProjects, freshStats] = await Promise.all([
      getPublishedProjects(filters, false),
      getProjectStats(),
    ]);
    setProjects(freshProjects);
    setStats(freshStats);
  };

  // Pagination calculation
  const totalPages = Math.ceil(projects.length / pageSize);
  const paginatedProjects = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-0">
      {/* 1. Panoramic Lush Nature Hero with Centered Title & Floating Stats */}
      <ProjectsHero stats={stats} />

      {/* 2. Featured Projects Spotlight Carousel */}
      <FeaturedProjectsSlider projects={projects} />

      {/* 3. Main All Projects Explorer Section */}
      <section className="py-16 md:py-24 bg-[var(--bg-page)] relative">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-10">
          
          {/* Sleek Search & Sort Toolbar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {/* Left: Search Input with glassmorphism */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search projects, contaminants, methods..."
                className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-[#14532D] dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#090D16] transition shadow-xs"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    handleFilterChange({ search: "" });
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Center: Live Count Badge */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                All Projects
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60">
                {projects.length} results
              </span>
            </div>

            {/* Right: Sort By Dropdown & Mobile Filter Button */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white shadow-xs cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span>Filters</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline flex items-center gap-1 font-medium">
                  <ArrowUpDown className="w-3 h-3" />
                  <span>Sort by:</span>
                </span>
                <select
                  value={filters.sort || "latest"}
                  onChange={(e) => handleFilterChange({ sort: e.target.value as any })}
                  className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-white outline-none focus:border-[#14532D] transition cursor-pointer shadow-xs font-medium"
                >
                  <option value="latest">Latest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="az">A — Z Title</option>
                  <option value="featured">Featured First</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2-Column Split Layout: Left Filters + Right Project Cards Stack */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Sidebar Filters */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-24 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#0F172A] p-6 shadow-sm">
              <ProjectFilters
                researchAreas={researchAreas}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={handleReset}
                availableYears={availableYears}
              />
            </aside>

            {/* Right Main Projects Stack */}
            <main className="lg:col-span-8 xl:col-span-9 space-y-6">
              {loading ? (
                <ProjectSkeleton />
              ) : isCreatorQuery(searchInput) ? (
                <div className="py-4">
                  <DeveloperWatermark />
                </div>
              ) : projects.length === 0 ? (
                <ProjectEmptyState onReset={handleReset} />
              ) : (
                <>
                  <ProjectList
                    projects={paginatedProjects}
                    hasRealtimeUpdate={hasRealtimeUpdate}
                    onRefresh={handleRefreshRealtime}
                  />

                  {/* Clean Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Showing page <strong className="text-slate-900 dark:text-white font-bold">{currentPage}</strong> of {totalPages}
                      </div>

                      <div className="flex items-center gap-2">
                        {currentPage > 1 && (
                          <button
                            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs active:scale-95 text-slate-800 dark:text-slate-200"
                          >
                            <ArrowLeft className="w-3.5 h-3.5" />
                            <span>Previous</span>
                          </button>
                        )}

                        {currentPage < totalPages && (
                          <button
                            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#0F5132] via-[#14532D] to-[#047857] text-white hover:from-[#14532D] hover:to-[#065F46] transition shadow-md active:scale-95 cursor-pointer"
                          >
                            <span>Next Page</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* 4. Bottom Scientific Research Workflow Banner ("From question to impact.") */}
      <ProjectWorkflowBanner />

      {/* Mobile Filter Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-xs bg-white dark:bg-[#090D16] h-full p-6 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
                <div className="font-bold text-sm text-slate-900 dark:text-white">
                  Filter Archive
                </div>
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <ProjectFilters
                researchAreas={researchAreas}
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={() => {
                  handleReset();
                  setMobileDrawerOpen(false);
                }}
                availableYears={availableYears}
              />
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#14532D] text-white text-center hover:bg-[#064E3B] transition shadow-md cursor-pointer"
              >
                Show {projects.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
