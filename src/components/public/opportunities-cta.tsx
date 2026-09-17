"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, GraduationCap, Send } from "lucide-react";
import { useLandingData } from "@/lib/landing-store";

export function OpportunitiesCTA() {
  const { data: landingData } = useLandingData();
  const opp = landingData?.opportunitiesSection;

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white dark:bg-[#090D16] transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
        <div className="relative rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#090D16] border border-slate-700/80 text-white p-8 sm:p-12 lg:p-16 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#34D399] border border-white/20 text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <GraduationCap className="w-4 h-4 text-[#10B981]" />
              <span>{opp?.badge || "Join Our Research Team"}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white font-[family-name:var(--font-manrope)]">
              {opp?.title || "Interested in doing research with us?"}
            </h2>

            {opp?.highlightText && (
              <p className="text-sm font-semibold text-emerald-300 tracking-wide font-[family-name:var(--font-inter)]">
                {opp.highlightText}
              </p>
            )}

            <p className="text-base sm:text-lg text-emerald-100/90 leading-relaxed max-w-2xl font-normal font-[family-name:var(--font-inter)]">
              {opp?.description ||
                "We welcome prospective graduate researchers, undergraduate research fellows, postdocs, and visiting scholars passionate about environmental contaminants, ecotoxicology, and ecological health."}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                href={opp?.ctaHref || "/opportunities"}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#10B981] hover:bg-[#34D399] text-[#021008] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-lg hover:shadow-emerald-500/25 transition-all active:scale-95"
              >
                <span>{opp?.ctaLabel || "Explore Open Positions"}</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <Link
                href="/opportunities#apply"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/10 border border-white/25 text-white hover:bg-white/20 text-xs sm:text-sm font-semibold uppercase tracking-wider transition-all backdrop-blur-md"
              >
                <Send className="w-4 h-4 text-[#34D399]" />
                <span>Apply for Internship / RA</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
