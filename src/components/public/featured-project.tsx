"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  CheckCircle2,
  Sparkles,
  FolderGit2,
  Calendar,
  Layers,
  Activity
} from "lucide-react";
import { useLandingData } from "@/lib/landing-store";
import { getPublishedProjects, getLocalProjects } from "@/lib/projects/queries";
import { SEED_PROJECTS } from "@/lib/projects/seed-data";
import { ProjectWithRelations } from "@/lib/projects/types";

interface DisplayProject {
  id: string;
  projectCode: string;
  title: string;
  slug: string;
  status: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  researchArea: string;
  timeline: string;
  leadResearcher: string;
  funding: string;
  keyOutcome: string;
  isFeatured?: boolean;
}

export function FeaturedProject() {
  const { data: landingData } = useLandingData();
  const [projects, setProjects] = React.useState<DisplayProject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [windowWidth, setWindowWidth] = React.useState(1200);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatProjects = React.useCallback((items: ProjectWithRelations[]): DisplayProject[] => {
    const published = (items || []).filter((p) => p.is_published !== false);

    // Sort: Featured first, then display_order, then newest
    const sorted = [...published].sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      const orderA = a.display_order ?? 99;
      const orderB = b.display_order ?? 99;
      if (orderA !== orderB) return orderA - orderB;
      const dateA = new Date(a.start_date || a.created_at || 0).getTime();
      const dateB = new Date(b.start_date || b.created_at || 0).getTime();
      return dateB - dateA;
    });

    return sorted.map((p, idx) => {
      const primaryArea =
        p.research_areas?.[0]?.title || "Ecotoxicology & Environmental Science";

      const leadPerson =
        p.researchers?.[0]?.name ||
        (p.researchers && p.researchers.length > 0
          ? p.researchers.map((r) => r.name).join(" & ")
          : "Lab Research Team");

      const fundingSource =
        p.funding_org || p.funding_info?.split("#")[0] || "National Research Grant";

      // Valid scientific project image
      let validImage = p.hero_image || p.featured_image;
      if (!validImage || validImage.includes("photo-1582719478250-c89cae4dc85b")) {
        validImage = "/images/slide-1-field.jpg";
      }

      const projectIndexFormatted = `#${String(idx + 1).padStart(2, "0")}`;

      return {
        id: p.id || `proj-${idx}`,
        projectCode: (p.funding_info && p.funding_info.includes("#"))
          ? p.funding_info.split("#")[1]?.trim() || projectIndexFormatted
          : projectIndexFormatted,
        title: p.title,
        slug: p.slug || (p.title ? p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-") : "project"),
        status: (p.status || "ongoing").toUpperCase(),
        description: p.short_description || p.full_description?.slice(0, 160) || "Comprehensive ecotoxicological investigation assessing environmental exposure pathways.",
        imageSrc: validImage,
        imageAlt: p.image_alt || p.title,
        researchArea: primaryArea,
        timeline: p.year || (p.start_date ? `${p.start_date.slice(0, 4)} — ${p.end_date?.slice(0, 4) || "Present"}` : "2024 — 2026"),
        leadResearcher: leadPerson,
        funding: fundingSource,
        keyOutcome: p.findings ? p.findings.slice(0, 50) + "..." : (p.outputs || "Peer-Reviewed Scientific Breakthrough"),
        isFeatured: p.is_featured,
      };
    });
  }, []);

  const loadAllProjects = React.useCallback(() => {
    try {
      const local = getLocalProjects();
      if (local && local.length > 0) {
        setProjects(formatProjects(local));
      } else {
        setProjects(formatProjects(SEED_PROJECTS));
      }
    } catch (e) {
      console.error("Failed to load local projects:", e);
      setProjects(formatProjects(SEED_PROJECTS));
    } finally {
      setLoading(false);
    }
  }, [formatProjects]);

  React.useEffect(() => {
    loadAllProjects();

    // Fetch fresh from Supabase if online
    getPublishedProjects({}, false).then((remote) => {
      if (remote && remote.length > 0) {
        setProjects(formatProjects(remote));
      }
    }).catch(() => {});

    const handleUpdate = () => {
      loadAllProjects();
    };

    window.addEventListener("lab_projects_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("lab_projects_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadAllProjects, formatProjects]);

  const visibleCards = windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 4;
  const maxIndex = Math.max(0, projects.length - visibleCards);

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < maxIndex;

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50 && canGoNext) {
      handleNext();
    } else if (diff < -50 && canGoPrev) {
      handlePrev();
    }
    setTouchStart(null);
  };

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-[#090D16] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-[#10B981]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-32 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

      <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 space-y-8 sm:space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-2 text-left max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/50 text-emerald-800 dark:text-[#34D399] text-xs font-semibold tracking-wider uppercase shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>{landingData?.projectsSection?.badge || "FLAGSHIP RESEARCH"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug font-[family-name:var(--font-manrope)]">
              {landingData?.projectsSection?.title || "Research Projects & Scientific Breakthroughs"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal pt-1 max-w-2xl font-[family-name:var(--font-inter)]">
              {landingData?.projectsSection?.subtitle ||
                "High-impact investigative projects funded by national and international scientific bodies."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {projects.length > 0 && (
              <span className="text-xs font-semibold text-emerald-800 dark:text-[#34D399] bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/30 font-mono">
                {currentIndex + 1} – {Math.min(currentIndex + visibleCards, projects.length)} of {projects.length} Projects
              </span>
            )}

            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!canGoPrev}
                aria-label="Previous projects"
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer active:scale-95 ${
                  canGoPrev
                    ? "bg-white dark:bg-[#0F172A] text-[#14532D] dark:text-white border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-800 shadow-sm"
                    : "bg-slate-100 dark:bg-slate-900/50 text-slate-300 dark:text-slate-700 border-slate-200/50 dark:border-slate-800/40 cursor-not-allowed opacity-50"
                }`}
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <button
                type="button"
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Next projects"
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 cursor-pointer active:scale-95 ${
                  canGoNext
                    ? "bg-[#14532D] text-white border-[#14532D] hover:bg-[#064E3B] shadow-md hover:shadow-lg"
                    : "bg-slate-100 dark:bg-slate-900/50 text-slate-300 dark:text-slate-700 border-slate-200/50 dark:border-slate-800/40 cursor-not-allowed opacity-50"
                }`}
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#14532D] dark:text-[#34D399] hover:text-[#059669] dark:hover:text-white transition-colors group ml-1"
            >
              <span className="hidden xl:inline">All Projects</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-[#10B981] group-hover:text-black transition-all">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Link>
          </div>
        </div>

        {/* Carousel Grid Track */}
        <div
          className="relative overflow-hidden w-full pb-4"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {projects.length > 0 ? (
            <div
              className="flex transition-transform duration-500 ease-out gap-5 sm:gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`,
              }}
            >
              {projects.map((project) => {
                const isCompleted = project.status.toLowerCase() === "completed";
                const isOngoing = project.status.toLowerCase() === "ongoing";

                return (
                  <div
                    key={project.id}
                    className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0 flex flex-col"
                  >
                    <div className="group h-full rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 hover:border-[#10B981] dark:hover:border-[#10B981] shadow-sm hover:shadow-2xl hover:shadow-black/20 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 text-left">
                      
                      <div>
                        <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                          <img
                            src={project.imageSrc}
                            alt={project.imageAlt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.93]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/gallery/analytical-instrumentation.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

                          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                            <span className="text-xs font-bold text-[#34D399] px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md border border-emerald-500/30 shadow font-mono truncate max-w-[170px]">
                              {project.projectCode}
                            </span>

                            {isCompleted ? (
                              <span className="text-[11px] font-semibold text-emerald-200 px-2.5 py-0.5 rounded-full bg-emerald-950/85 backdrop-blur-md border border-emerald-600/50 flex items-center gap-1.5 shadow">
                                <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                                <span>COMPLETED</span>
                              </span>
                            ) : isOngoing ? (
                              <span className="text-[11px] font-semibold text-sky-200 px-2.5 py-0.5 rounded-full bg-sky-950/85 backdrop-blur-md border border-sky-600/50 flex items-center gap-1.5 shadow">
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                <span>ONGOING</span>
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-slate-200 px-2.5 py-0.5 rounded-full bg-slate-900/85 backdrop-blur-md border border-slate-700/50 flex items-center gap-1.5 shadow">
                                <span>{project.status}</span>
                              </span>
                            )}
                          </div>

                          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-xs z-10">
                            <span className="text-emerald-300 font-semibold truncate max-w-[180px]">
                              {project.funding}
                            </span>
                            <span className="text-white/80 text-[11px] font-medium font-mono">
                              {project.timeline}
                            </span>
                          </div>
                        </div>

                        <div className="relative -mt-4 z-10 w-full overflow-hidden leading-none pointer-events-none">
                          <svg
                            className="w-full h-5 text-white dark:text-[#0F172A] transition-colors"
                            viewBox="0 0 100 25"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M0,8 C25,22 65,-4 100,12 L100,25 Z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>

                        <div className="p-5 sm:p-6 pt-1 space-y-3.5 text-left">
                          <div className="space-y-2">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#059669] dark:text-[#34D399] block font-[family-name:var(--font-inter)] truncate">
                              {project.researchArea}
                            </span>

                            <h3 className="text-base sm:text-[17px] font-bold text-slate-900 dark:text-white tracking-[-0.01em] font-[family-name:var(--font-manrope)] group-hover:text-[#059669] dark:group-hover:text-[#34D399] transition-colors leading-[1.38] line-clamp-2">
                              <Link href={`/projects/${project.slug}`}>
                                {project.title}
                              </Link>
                            </h3>

                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-3 pt-0.5 font-[family-name:var(--font-inter)]">
                              {project.description}
                            </p>
                          </div>

                          <div className="p-2.5 px-3 rounded-xl bg-[#F0FDF4] dark:bg-[#0B1120] border border-emerald-900/10 dark:border-slate-800 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
                            <span className="text-xs font-semibold text-[#064E3B] dark:text-emerald-300 leading-snug line-clamp-1">
                              {project.keyOutcome}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 pt-0">
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 truncate font-[family-name:var(--font-inter)]">
                            <User className="w-3.5 h-3.5 text-[#059669] dark:text-[#34D399] flex-shrink-0" />
                            <span className="truncate">{project.leadResearcher}</span>
                          </div>

                          <Link
                            href={`/projects/${project.slug}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#14532D] dark:text-[#10B981] group-hover:translate-x-1 transition-transform flex-shrink-0"
                          >
                            <span>View Project</span>
                            <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                          </Link>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3">
              <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No active projects found. Create projects in Admin → Projects.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
