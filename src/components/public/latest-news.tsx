"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, ChevronLeft, ChevronRight, Newspaper } from "lucide-react";
import { useLandingData } from "@/lib/landing-store";
import { NewsArticle } from "@/lib/news/types";
import { getPublishedNews } from "@/lib/news/queries";
import { NEWS_CATEGORIES_META } from "@/lib/news/seed-data";

interface LatestNewsProps {
  news?: any[];
}

export function LatestNews({ news: initialNews }: LatestNewsProps) {
  const { data: landingData } = useLandingData();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [articles, setArticles] = React.useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchNews = React.useCallback(async () => {
    try {
      const data = await getPublishedNews({}, false);
      setArticles(data);
    } catch (err) {
      console.warn("Failed to load published news:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchNews();

    const handleNewsUpdate = () => {
      fetchNews();
    };

    window.addEventListener("lab_news_updated", handleNewsUpdate);

    return () => {
      window.removeEventListener("lab_news_updated", handleNewsUpdate);
    };
  }, [fetchNews]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -420 : 420;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  React.useEffect(() => {
    if (isPaused) return;

    const intervalSeconds = (landingData?.newsSection?.autoSlideSeconds || 4.5) * 1000;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 50) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 420, behavior: "smooth" });
        }
      }
    }, intervalSeconds);

    return () => clearInterval(interval);
  }, [isPaused, landingData?.newsSection?.autoSlideSeconds]);

  // Display items from dynamic articles (or fallback)
  const displayArticles = articles.length > 0 ? articles : [];

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#090D16] transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-10 sm:space-y-14">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-2 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/40 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-[#34D399] w-fit">
              <Newspaper className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{landingData?.newsSection?.badge || "LAB DISPATCHES"}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] leading-tight">
              {landingData?.newsSection?.title || "Latest News & Insights"}
            </h2>
            {landingData?.newsSection?.subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl font-[family-name:var(--font-inter)]">
                {landingData.newsSection.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-[#14532D] hover:text-white dark:hover:bg-[#10B981] dark:hover:text-slate-900 transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                aria-label="Previous news"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-[#14532D] hover:text-white dark:hover:bg-[#10B981] dark:hover:text-slate-900 transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                aria-label="Next news"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Link
              href="/news"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#14532D] dark:text-[#34D399] uppercase tracking-wider hover:underline ml-2"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* News Cards Carousel Track */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {displayArticles.length === 0 && !isLoading ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
              <p className="text-sm text-slate-500 dark:text-slate-400">No published news dispatches found.</p>
            </div>
          ) : (
            <div
              ref={scrollRef}
              className="flex items-stretch gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-2 snap-x snap-mandatory scroll-smooth"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {displayArticles.map((item) => {
                const categoryMeta = NEWS_CATEGORIES_META[item.category];
                const categoryLabel = categoryMeta?.label || item.category.replace(/_/g, " ").toUpperCase();
                const image = item.cover_image_url || "/images/gallery/field-sampling.jpg";
                const dateString = item.published_at
                  ? new Date(item.published_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Recent";

                return (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    className="flex-shrink-0 w-[300px] sm:w-[380px] md:w-[420px] lg:w-[460px] group/card rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-black/20 hover:border-[#10B981] transition-all duration-300 flex flex-col justify-between hover:-translate-y-1.5 snap-start text-left"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <img
                          src={image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 filter brightness-[0.96]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                        <div className="absolute top-3.5 left-3.5">
                          <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-white/20 shadow">
                            {categoryLabel}
                          </span>
                        </div>
                      </div>

                      <div className="p-6 sm:p-7 space-y-3">
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                            {dateString}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Clock className="w-3.5 h-3.5 text-[#10B981]" />
                            {item.read_time_minutes || 4} min read
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white leading-snug tracking-tight font-[family-name:var(--font-manrope)] group-hover/card:text-[#059669] dark:group-hover/card:text-[#34D399] transition-colors line-clamp-2">
                          {item.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-3 font-[family-name:var(--font-inter)]">
                          {item.summary}
                        </p>
                      </div>
                    </div>

                    <div className="p-6 sm:p-7 pt-0">
                      <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[#14532D] dark:text-[#34D399]">
                        <span>Read Full Story</span>
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover/card:bg-[#14532D] group-hover/card:text-white dark:group-hover/card:bg-[#10B981] dark:group-hover/card:text-black flex items-center justify-center transition-colors">
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
