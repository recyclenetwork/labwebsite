"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, ChevronLeft, ChevronRight, Star, BookOpen } from "lucide-react";
import { useLandingData } from "@/lib/landing-store";
import { getPublishedPublications, getLocalPublications } from "@/lib/publications/queries";
import { PublicationWithRelations } from "@/lib/publications/types";

interface FeaturedPublicationsProps {
  publications?: Array<{ id: string; title: string; journal: string; year: number; doi: string; authors: string[]; type?: string; researchArea?: string }>;
}

interface DisplayPublication {
  id: string;
  title: string;
  year: number;
  type: string;
  researchArea: string;
  authors: string[];
  journal: string;
  doi?: string | null;
  doi_url?: string | null;
  is_featured?: boolean;
}

export function FeaturedPublications({ publications: propPublications }: FeaturedPublicationsProps) {
  const { data: landingData } = useLandingData();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [items, setItems] = React.useState<DisplayPublication[]>([]);
  const [loading, setLoading] = React.useState(true);

  const loadPublications = React.useCallback(() => {
    try {
      const local = getLocalPublications();
      const published = local.filter((p) => p.is_published !== false);

      // Sort: Featured first, then newest by year & created_at
      const sorted = [...published].sort((a, b) => {
        if (a.is_featured && !b.is_featured) return -1;
        if (!a.is_featured && b.is_featured) return 1;
        return (
          b.publication_year - a.publication_year ||
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      // Limit to 10 max
      const top10 = sorted.slice(0, 10);

      const mapped: DisplayPublication[] = top10.map((pub) => {
        const areaTitle =
          pub.research_areas?.[0]?.title ||
          (pub.publication_type ? pub.publication_type.replace(/_/g, " ").toUpperCase() : "ECOTOXICOLOGY");

        const authorsList =
          pub.authors && pub.authors.length > 0
            ? pub.authors.map((a) => a.name)
            : pub.authors_text
            ? pub.authors_text.split(/,\s*|\s*;\s*|\s*•\s*/).filter(Boolean)
            : ["Lab Researchers"];

        return {
          id: pub.id,
          title: pub.title,
          year: pub.publication_year || new Date().getFullYear(),
          type: (pub.publication_type || "journal_article").replace(/_/g, " ").toUpperCase(),
          researchArea: areaTitle,
          authors: authorsList,
          journal: pub.journal || "Journal of Hazardous Materials",
          doi: pub.doi,
          doi_url: pub.doi_url || (pub.doi ? `https://doi.org/${pub.doi}` : null),
          is_featured: pub.is_featured,
        };
      });

      setItems(mapped);
    } catch (e) {
      console.error("Failed to load dynamic publications:", e);
      if (propPublications && propPublications.length > 0) {
        setItems(
          propPublications.slice(0, 10).map((p) => ({
            id: p.id,
            title: p.title,
            year: p.year,
            type: p.type || "journal_article",
            researchArea: p.researchArea || "",
            authors: p.authors,
            journal: p.journal,
            doi: p.doi,
            doi_url: p.doi ? `https://doi.org/${p.doi}` : null,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [propPublications]);

  React.useEffect(() => {
    loadPublications();

    // Also fetch fresh from database if available
    getPublishedPublications({}, false).then((fetched) => {
      if (fetched && fetched.length > 0) {
        const sorted = [...fetched].sort((a, b) => {
          if (a.is_featured && !b.is_featured) return -1;
          if (!a.is_featured && b.is_featured) return 1;
          return (
            b.publication_year - a.publication_year ||
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        const top10 = sorted.slice(0, 10);
        setItems(
          top10.map((pub) => ({
            id: pub.id,
            title: pub.title,
            year: pub.publication_year || new Date().getFullYear(),
            type: (pub.publication_type || "journal_article").replace(/_/g, " ").toUpperCase(),
            researchArea:
              pub.research_areas?.[0]?.title ||
              (pub.publication_type ? pub.publication_type.replace(/_/g, " ").toUpperCase() : "ECOTOXICOLOGY"),
            authors:
              pub.authors && pub.authors.length > 0
                ? pub.authors.map((a) => a.name)
                : pub.authors_text
                ? pub.authors_text.split(/,\s*|\s*;\s*|\s*•\s*/).filter(Boolean)
                : ["Lab Researchers"],
            journal: pub.journal || "Journal of Hazardous Materials",
            doi: pub.doi,
            doi_url: pub.doi_url || (pub.doi ? `https://doi.org/${pub.doi}` : null),
            is_featured: pub.is_featured,
          }))
        );
      } else {
        setItems([]);
      }
    }).catch(() => {});

    const handleUpdate = () => {
      loadPublications();
    };

    window.addEventListener("lab_publications_updated", handleUpdate);

    return () => {
      window.removeEventListener("lab_publications_updated", handleUpdate);
    };
  }, [loadPublications]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -460 : 460;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-[#F4F8F5] dark:bg-[#0B1120] border-y border-slate-200/80 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 space-y-10 sm:space-y-12">
        
        {/* Section Header with Left/Right Controls & View All Link */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex flex-col space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/40 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-[#34D399] w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>{landingData?.publicationsSection?.badge || "PEER-REVIEWED EVIDENCE"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] leading-tight">
              {landingData?.publicationsSection?.title || "Featured Publications"}
            </h2>
            {landingData?.publicationsSection?.subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl font-[family-name:var(--font-inter)]">
                {landingData.publicationsSection.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-[#14532D] hover:text-white dark:hover:bg-[#10B981] dark:hover:text-slate-900 transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                aria-label="Previous publications"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-[#14532D] hover:text-white dark:hover:bg-[#10B981] dark:hover:text-slate-900 transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                aria-label="Next publications"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Link
              href="/publications"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#14532D] dark:text-[#34D399] uppercase tracking-wider hover:underline ml-2"
            >
              <span>View All ({items.length})</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Publication Cards Carousel */}
        <div className="relative">
          {items.length > 0 ? (
            <div
              ref={scrollRef}
              className="flex items-stretch gap-6 overflow-x-auto scrollbar-none py-2 snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {items.map((pub) => (
                <div
                  key={pub.id}
                  className="flex-shrink-0 w-[300px] sm:w-[380px] md:w-[440px] lg:w-[480px] p-7 sm:p-8 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-6 hover:border-[#14532D] dark:hover:border-[#10B981] hover:shadow-md transition-all group/card snap-start text-left"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#059669] dark:text-[#34D399] font-semibold flex items-center gap-1.5">
                        {pub.is_featured && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider">
                            <Star className="w-3 h-3 fill-amber-500" />
                            Featured
                          </span>
                        )}
                        <span>{pub.year} · {pub.type}</span>
                      </span>
                      <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-xs font-semibold text-emerald-800 dark:text-[#34D399] border border-emerald-200/80 dark:border-emerald-800/40 truncate max-w-[170px]">
                        {pub.researchArea}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight font-[family-name:var(--font-manrope)] group-hover/card:text-[#14532D] dark:group-hover/card:text-[#34D399] transition-colors line-clamp-3">
                      {pub.title}
                    </h3>

                    <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed font-[family-name:var(--font-inter)] line-clamp-2">
                      {pub.authors.join(" · ")}
                    </p>

                    <p className="text-xs sm:text-[13px] italic text-[#14532D] dark:text-[#34D399] font-semibold truncate">
                      {pub.journal}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate max-w-[200px] font-mono text-[11px]">
                      {pub.doi ? `DOI: ${pub.doi}` : "Peer-Reviewed Article"}
                    </span>
                    {pub.doi_url ? (
                      <a
                        href={pub.doi_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-[#14532D] dark:text-[#34D399] hover:underline flex-shrink-0 cursor-pointer"
                      >
                        <span>Read Article</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <Link
                        href={`/publications#${pub.id}`}
                        className="inline-flex items-center gap-1.5 font-semibold text-[#14532D] dark:text-[#34D399] hover:underline flex-shrink-0"
                      >
                        <span>View Publication</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                No publications published yet. Add papers in Admin → Publications.
              </p>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
