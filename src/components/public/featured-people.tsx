"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, UserCheck, ChevronLeft, ChevronRight, Sparkles, User } from "lucide-react";
import { useLandingData } from "@/lib/landing-store";
import { getTeamMembers } from "@/lib/team/store";
import { TeamMember } from "@/lib/team/types";

// Fisher-Yates Random Shuffle
function shuffleList<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const CATEGORY_LABELS: Record<string, string> = {
  graduate: "Graduate Researcher",
  undergraduate: "Undergraduate Researcher",
  phd: "Ph.D. Scholar",
  postdoc: "Postdoctoral Fellow",
  faculty: "Co-Investigator",
  staff: "Research Staff",
};

interface FeaturedPeopleProps {
  people?: any[];
}

export function FeaturedPeople({ people: initialPeople }: FeaturedPeopleProps) {
  const { data: landingData } = useLandingData();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [researchers, setResearchers] = React.useState<TeamMember[]>([]);
  const [isPaused, setIsPaused] = React.useState(false);

  // Load team members, filter out PI and Alumni, and randomly shuffle
  React.useEffect(() => {
    async function load() {
      try {
        const allMembers = await getTeamMembers();
        
        // Filter: ONLY current members (Exclude PI and Alumni)
        const currentMembers = allMembers.filter((m) => {
          if (m.isActive === false) return false;
          const isPI = m.category === "pi" || m.role?.toLowerCase().includes("principal investigator");
          const isAlumni = m.category === "alumni" || (m as any).isAlumni;
          return !isPI && !isAlumni;
        });

        const shouldShuffle = landingData?.peopleSection?.enableShuffle !== false;
        const finalRoster = shouldShuffle ? shuffleList(currentMembers) : currentMembers;
        setResearchers(finalRoster);
      } catch (err) {
        console.error("Failed to load researchers for homepage slideshow:", err);
      }
    }
    load();
  }, [landingData?.peopleSection?.enableShuffle]);

  // Slideshow auto-advance interval (moving from left to right / advancing cards)
  React.useEffect(() => {
    if (isPaused || researchers.length === 0) return;

    const intervalSeconds = landingData?.peopleSection?.autoSlideSeconds || 3.5;
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const cardWidth = 340;
        
        // If reached end, smoothly loop back to start
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [isPaused, researchers.length, landingData?.peopleSection?.autoSlideSeconds]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 340;
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      if (direction === "left" && scrollLeft <= 10) {
        scrollRef.current.scrollTo({ left: scrollWidth, behavior: "smooth" });
      } else if (direction === "right" && scrollLeft + clientWidth >= scrollWidth - 10) {
        scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    }
  };

  return (
    <section className="py-20 lg:py-28 bg-[#F4F8F5] dark:bg-[#0B1120] border-t border-slate-200/90 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 space-y-10 sm:space-y-14 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2 border-b border-slate-200/70 dark:border-slate-800">
          <div className="space-y-3 max-w-3xl text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/40 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-[#34D399] shadow-xs w-fit">
              <UserCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{landingData?.peopleSection?.badge || "LAB ROSTER"}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-manrope)]">
              {landingData?.peopleSection?.title || "Meet the Researchers"}
            </h2>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal font-[family-name:var(--font-inter)]">
              {landingData?.peopleSection?.subtitle ||
                "The multidisciplinary faculty, doctoral scholars, graduate students, and fellows advancing environmental ecotoxicology research at Jahangirnagar University."}
            </p>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0 self-start lg:self-end">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-[#14532D] hover:text-white dark:hover:bg-[#10B981] dark:hover:text-slate-900 transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                aria-label="Previous researchers"
                title="Previous Researcher"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-slate-700 dark:text-slate-200 hover:bg-[#14532D] hover:text-white dark:hover:bg-[#10B981] dark:hover:text-slate-900 transition-all flex items-center justify-center shadow-xs active:scale-95 cursor-pointer"
                aria-label="Next researchers"
                title="Next Researcher"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Link
              href="/team"
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#14532D] hover:bg-[#166534] dark:bg-[#10B981] dark:hover:bg-[#34D399] text-white dark:text-slate-900 text-xs sm:text-[13px] font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
            >
              <span>View Full Team</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>
          </div>
        </div>

        {/* Horizontal Moving Slideshow Track */}
        <div
          className="relative group/track"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            ref={scrollRef}
            className="flex items-stretch gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-3 snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {researchers.map((person) => {
              const categoryBadge = CATEGORY_LABELS[person.category] || person.category;
              const interests = person.researchInterests && person.researchInterests.length > 0
                ? person.researchInterests.slice(0, 2)
                : ["Environmental Science", "Ecotoxicology"];

              return (
                <Link
                  key={person.id}
                  href={`/team/${person.slug || person.id}`}
                  className="flex-shrink-0 w-[280px] sm:w-[320px] md:w-[350px] group/card rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:shadow-black/20 hover:border-[#10B981] dark:hover:border-[#10B981] transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-2 snap-start"
                >
                  <div>
                    {/* Researcher Photo with Badge */}
                    <div className="relative aspect-[4/3.8] overflow-hidden bg-slate-900">
                      <img
                        src={person.imageSrc || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                        alt={person.name}
                        className="w-full h-full object-cover object-top group-hover/card:scale-105 transition-transform duration-700 filter brightness-[0.96] contrast-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

                      <div className="absolute top-3 right-3 z-10">
                        <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 shadow">
                          {categoryBadge}
                        </span>
                      </div>
                    </div>

                    {/* Wave Separator */}
                    <div className="relative -mt-4 z-10 w-full overflow-hidden leading-none pointer-events-none">
                      <svg
                        className="w-full h-5 text-white dark:text-[#0F172A] transition-colors"
                        viewBox="0 0 100 25"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,8 C25,22 65,-4 100,12 L100,25 L0,25 Z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>

                    {/* Name, Role & Topics */}
                    <div className="p-5 sm:p-6 pt-1 space-y-3.5 text-left">
                      <div className="space-y-1">
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight font-[family-name:var(--font-manrope)] group-hover/card:text-[#059669] dark:group-hover/card:text-[#34D399] transition-colors leading-snug">
                          {person.name}
                        </h3>
                        <p className="text-xs sm:text-[13px] text-[#047857] dark:text-[#34D399] font-semibold leading-snug">
                          {person.role}
                        </p>
                      </div>

                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {interests.map((interest, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-medium text-emerald-950 dark:text-emerald-200 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/40"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Link */}
                  <div className="p-5 sm:p-6 pt-0">
                    <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-[#14532D] dark:text-[#34D399]">
                      <span className="group-hover/card:translate-x-0.5 transition-transform">
                        View Academic Profile
                      </span>
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover/card:bg-[#14532D] group-hover/card:text-white dark:group-hover/card:bg-[#10B981] dark:group-hover/card:text-black flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
