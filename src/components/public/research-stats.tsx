"use client";

import * as React from "react";
import { useLandingData } from "@/lib/landing-store";

interface ResearchStatsProps {
  metrics?: Array<{ value: string; label: string; sublabel?: string; description: string }>;
}

export function ResearchStats({ metrics }: ResearchStatsProps) {
  const { data: landingData } = useLandingData();
  const currentMetrics =
    landingData?.metrics && landingData.metrics.length > 0
      ? landingData.metrics
      : metrics || [];

  return (
    <section className="relative z-30 pt-16 pb-8 sm:pt-20 sm:pb-12 bg-white dark:bg-[#090D16] transition-colors duration-300">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        <div className="rounded-3xl bg-gradient-to-b from-[#F0FDF4] to-white dark:from-[#0F172A] dark:to-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xl shadow-black/20 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 lg:divide-x divide-slate-200/80 dark:divide-slate-800">
            {currentMetrics.map((item, index) => (
              <div
                key={item.label}
                className={`flex flex-col space-y-2 ${index > 0 ? "pt-4 sm:pt-0 lg:pl-8" : ""
                  }`}
              >
                <span className="font-[family-name:var(--font-manrope)] text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#14532D] dark:text-[#34D399] tracking-tight">
                  {item.value}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {item.label}
                </span>
                <span className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed hidden sm:block font-[family-name:var(--font-inter)]">
                  {item.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
