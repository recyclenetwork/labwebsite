"use client";

import * as React from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Mail,
  ArrowRight,
  ExternalLink,
  GraduationCap,
  Quote,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useLandingData } from "@/lib/landing-store";
import { getTeamMembers, getCachedPI } from "@/lib/team/store";
import { INITIAL_TEAM_MEMBERS } from "@/lib/team/seed-data";
import { TeamMember } from "@/lib/team/types";

export function PrincipalInvestigator() {
  const [mounted, setMounted] = React.useState(false);
  const landingData = useLandingData();
  const [teamPI, setTeamPI] = React.useState<TeamMember | null>(null);

  React.useEffect(() => {
    setMounted(true);
    const cached = getCachedPI();
    if (cached) {
      setTeamPI(cached);
    }

    async function loadPI() {
      try {
        const members = await getTeamMembers();
        const found = members.find((m) => m.category === "pi" && m.isActive !== false) || members.find((m) => m.category === "pi") || members[0];
        if (found) {
          setTeamPI(found);
        }
      } catch (err) {
        console.error("Failed to load PI from team store:", err);
      }
    }
    loadPI();

    const handleUpdate = () => {
      loadPI();
    };

    window.addEventListener("team-members-updated", handleUpdate);
    window.addEventListener("landing-content-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("team-members-updated", handleUpdate);
      window.removeEventListener("landing-content-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filter out any obsolete legacy mock images
  const cleanImage = (img?: string | null) => {
    if (!img) return null;
    if (img === "/images/hero-scientist.jpg") return null;
    if (img.includes("photo-1534528741775-53994a69daeb")) return null;
    return img;
  };

  // Use team database PI data, falling back to landing store customizations
  const piName = teamPI?.name || landingData.piSection?.name || "Dr. Mohammad S. Kabir";
  const piRole = teamPI?.role || landingData.piSection?.designation || "Professor & Principal Investigator";
  const piDepartment = teamPI?.department || landingData.piSection?.department || "Department of Environmental Sciences";
  const piAffiliation = teamPI?.affiliation || landingData.piSection?.institution || "Jahangirnagar University";
  
  const piImage =
    cleanImage(teamPI?.imageSrc) ||
    cleanImage(landingData.piSection?.imageSrc) ||
    cleanImage(getCachedPI()?.imageSrc) ||
    "";

  const piQuote = teamPI?.quote || teamPI?.bio || landingData.piSection?.bioQuote || "Our mission is to unravel the intricate mechanisms of environmental contaminants and translate rigorous experimental toxicology into actionable ecological conservation and community health protection.";
  
  const publicationsText = teamPI?.publicationsCount ? `${teamPI.publicationsCount}+` : landingData.piSection?.publicationsCount || "74+";
  const citationsText = teamPI?.citationsCount ? `${teamPI.citationsCount.toLocaleString()}+` : "2,840+";
  const hIndexText = teamPI?.hIndex ? `${teamPI.hIndex}` : "26";
  const scholarUrl = teamPI?.googleScholarUrl || landingData.piSection?.scholarUrl;
  const emailAddress = teamPI?.email || "msk@juniv.edu";

  // Dynamic research highlights from PI's research interests
  const highlights = teamPI?.researchInterests && teamPI.researchInterests.length > 0
    ? teamPI.researchInterests.slice(0, 4)
    : [
        "Aquatic Ecotoxicology & Persistent Contaminants (POPs/PFAS)",
        "Microplastic-Contaminant Interactions & Bioaccumulation",
        "High-Resolution Environmental Mass Spectrometry",
        "Evidence-based National Water & Ecosystem Health Policy",
      ];

  if (!mounted) {
    return (
      <section className="py-20 lg:py-28 bg-white dark:bg-[#090D16] border-t border-slate-200/90 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 space-y-12">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/40 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-[#34D399] w-fit shadow-xs">
            <Award className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Principal Investigator &amp; Lab Director</span>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-[#F4F8F5] to-white dark:from-[#0F172A] dark:to-[#090D16] border border-slate-200 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xl shadow-black/10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="relative w-full max-w-[420px] aspect-[4/4.6] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700 ring-1 ring-emerald-500/20 bg-slate-900/60 animate-pulse flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                  <GraduationCap className="w-12 h-12 text-emerald-400" />
                </div>
                <span className="text-base font-bold text-white tracking-wide">Principal Investigator</span>
                <span className="text-xs text-emerald-400 font-medium mt-1">Laboratory Leadership</span>
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="space-y-2">
                <div className="h-4 bg-emerald-500/20 rounded-full w-48 animate-pulse" />
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-5/6 animate-pulse" />
              </div>
              <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-2xl w-full animate-pulse" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 lg:py-28 bg-white dark:bg-[#090D16] border-t border-slate-200/90 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 space-y-12">
        {/* Section Kicker */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/40 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-[#34D399] w-fit shadow-xs">
          <Award className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Principal Investigator &amp; Lab Director</span>
        </div>

        {/* Main PI Showcase Grid */}
        <div className="rounded-3xl bg-gradient-to-br from-[#F4F8F5] to-white dark:from-[#0F172A] dark:to-[#090D16] border border-slate-200 dark:border-slate-800 p-6 sm:p-10 lg:p-12 shadow-xl shadow-black/10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center" suppressHydrationWarning>
          
          {/* Left 5 Cols: PI Portrait & Badges */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="relative w-full max-w-[420px] aspect-[4/4.6] rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-slate-700 ring-1 ring-emerald-500/20 group bg-slate-900" suppressHydrationWarning>
              {piImage ? (
                <img
                  src={piImage}
                  alt={piName}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 filter brightness-[0.97]"
                  suppressHydrationWarning
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                    <GraduationCap className="w-12 h-12 text-emerald-400" />
                  </div>
                  <span className="text-base font-bold text-white tracking-wide">{piName}</span>
                  <span className="text-xs text-emerald-400 font-medium mt-1">{piRole}</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              {/* Floating Top Credential Badge */}
              <div className="absolute top-4 left-4 z-10">
                <span className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-semibold border border-emerald-500/30 shadow flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Lab Director &amp; PI</span>
                </span>
              </div>

              {/* Bottom Image Caption */}
              <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1" suppressHydrationWarning>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight font-[family-name:var(--font-manrope)]" suppressHydrationWarning>
                  {piName}
                </h3>
                <p className="text-xs sm:text-sm text-emerald-300 font-medium" suppressHydrationWarning>
                  {piRole}
                </p>
                <p className="text-[11px] text-slate-300" suppressHydrationWarning>
                  {piDepartment}, {piAffiliation}
                </p>
              </div>
            </div>

            {/* Quick Stats Strip */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-[420px] mt-4">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <span className="block text-lg font-bold text-[#14532D] dark:text-[#34D399] font-[family-name:var(--font-manrope)]">
                  {publicationsText}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Peer Papers</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <span className="block text-lg font-bold text-[#14532D] dark:text-[#34D399] font-[family-name:var(--font-manrope)]">
                  {citationsText}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Citations</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200/80 dark:border-slate-800 text-center shadow-xs">
                <span className="block text-lg font-bold text-[#14532D] dark:text-[#34D399] font-[family-name:var(--font-manrope)]">
                  {hIndexText}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">h-Index</span>
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Narrative, Vision, Affiliations & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#059669] dark:text-[#34D399] uppercase tracking-wider">
                <GraduationCap className="w-4 h-4" />
                <span>
                  {piDepartment}, {piAffiliation}
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight font-[family-name:var(--font-manrope)] leading-tight">
                Pioneering evidence-based environmental toxicology.
              </h2>
            </div>

            {/* Quote / PI Statement */}
            <div className="relative p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border-l-4 border-[#10B981] border-y border-r border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
              <Quote className="w-6 h-6 text-[#10B981] opacity-70" />
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed italic font-normal font-[family-name:var(--font-inter)]">
                &ldquo;{piQuote}&rdquo;
              </p>
            </div>

            {/* Academic Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              {highlights.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-700 dark:text-slate-200 font-[family-name:var(--font-inter)]">
                  <CheckCircle2 className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Action Links */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              <Link
                href="/team"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#14532D] hover:bg-[#166534] dark:bg-[#10B981] dark:hover:bg-[#34D399] text-white dark:text-slate-900 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>Read Full Lab Team &amp; Bio</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              {scholarUrl && (
                <a
                  href={scholarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4.5 py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-[#10B981] transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
                  <span>Google Scholar</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              )}

              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-4.5 py-3 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-[#10B981] transition-colors"
              >
                <Mail className="w-4 h-4 text-[#059669] dark:text-[#34D399]" />
                <span>Contact Lab</span>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
