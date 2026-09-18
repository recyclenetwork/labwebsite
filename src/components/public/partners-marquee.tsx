"use client";

import * as React from "react";
import { Building2 } from "lucide-react";
import { useLandingData } from "@/lib/landing-store";

interface Partner {
  id: string;
  name: string;
  shortName?: string;
  type?: string;
  badge?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export function PartnersMarquee() {
  const { data: landingData } = useLandingData();
  const [isPaused, setIsPaused] = React.useState(false);

  // Dynamic partners from landingData — only real partners with uploaded logos
  const activePartners: Partner[] = React.useMemo(() => {
    const custom = landingData?.partnersSection?.partners;
    if (Array.isArray(custom) && custom.length > 0) {
      return custom.filter((p) => Boolean(p.logoUrl && p.logoUrl.trim()));
    }
    return [];
  }, [landingData?.partnersSection?.partners]);

  // If no real partner logos are configured by admin, do not display section
  if (activePartners.length === 0) {
    return null;
  }

  // Duplicate for smooth seamless infinite scroll ribbon
  const marqueePartners =
    activePartners.length < 5
      ? [...activePartners, ...activePartners, ...activePartners, ...activePartners]
      : [...activePartners, ...activePartners];

  return (
    <section className="py-12 sm:py-14 bg-[#F4F8F5] dark:bg-[#0B1120] border-y border-slate-200/80 dark:border-slate-800 relative overflow-hidden transition-colors duration-300 w-full">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      {/* Header text */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 text-center space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8F5EE] dark:bg-emerald-950/80 border border-emerald-900/10 dark:border-emerald-800/40 text-[11px] font-bold uppercase tracking-wider text-[#047857] dark:text-[#34D399]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>{landingData?.partnersSection?.badge || "INSTITUTIONAL NETWORK"}</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          {landingData?.partnersSection?.title ||
            "Collaborating Institutions & Research Sponsors"}
        </p>
      </div>

      {/* Edge-to-Edge Moving Marquee */}
      <div
        className="relative w-full overflow-hidden py-2 group"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Left & Right Subtle Fade Gradients */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-[#F4F8F5] dark:from-[#0B1120] to-transparent z-20" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-[#F4F8F5] dark:from-[#0B1120] to-transparent z-20" />

        {/* Continuous Marquee Track */}
        <div
          className="animate-marquee-scroll flex items-center gap-4 sm:gap-6 group-hover:[animation-play-state:paused]"
          style={{ animationPlayState: isPaused ? "paused" : "running" }}
        >
          {marqueePartners.map((partner, index) => {
            const cardContent = (
              <div
                title={partner.name || "Collaborating Organization"}
                className="flex-shrink-0 h-16 sm:h-20 min-w-[140px] sm:min-w-[180px] max-w-[240px] px-4 sm:px-6 py-2.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-emerald-500 dark:hover:border-emerald-500 flex items-center justify-center transition-all duration-300 group/partner"
              >
                {partner.logoUrl ? (
                  <img
                    src={partner.logoUrl}
                    alt={partner.name || "Partner Logo"}
                    className="h-10 sm:h-12 w-auto max-w-full object-contain filter contrast-[1.05] group-hover/partner:scale-105 transition-all duration-300"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 group-hover/partner:text-emerald-500 transition-colors whitespace-nowrap">
                    <Building2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>{partner.name}</span>
                  </div>
                )}
              </div>
            );

            if (partner.websiteUrl && partner.websiteUrl.trim()) {
              return (
                <a
                  key={`${partner.id}-${index}`}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  {cardContent}
                </a>
              );
            }

            return <React.Fragment key={`${partner.id}-${index}`}>{cardContent}</React.Fragment>;
          })}
        </div>
      </div>
    </section>
  );
}
