"use client";

import * as React from "react";
import Link from "next/link";
import { TeamMember } from "@/lib/team/types";
import { useLandingData } from "@/lib/landing-store";
import { CVModal } from "./cv-modal";
import {
  Award,
  BookOpen,
  GraduationCap,
  Mail,
  MapPin,
  FileText,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Quote,
  CheckCircle2,
  User,
} from "lucide-react";

interface PIShowcaseProps {
  pi: TeamMember;
}

export function PIShowcase({ pi }: PIShowcaseProps) {
  const [showCV, setShowCV] = React.useState(false);
  const { data: landingData } = useLandingData();

  if (!pi) return null;

  const formatMetric = (val?: string | number | null, fallback: string = "") => {
    if (val === undefined || val === null) return fallback;
    const str = String(val).trim();
    if (!str || str === "0" || str === "0+") return fallback;
    return str;
  };

  const publicationsText = formatMetric(
    landingData?.piSection?.publicationsCount,
    pi.publicationsCount && Number(pi.publicationsCount) > 0 ? `${pi.publicationsCount}+` : "120+"
  );
  const citationsText = formatMetric(
    landingData?.piSection?.citationsCount,
    pi.citationsCount && Number(pi.citationsCount) > 0 ? `${Number(pi.citationsCount).toLocaleString()}+` : "8,095+"
  );
  const hIndexText = formatMetric(
    landingData?.piSection?.hIndex,
    pi.hIndex && Number(pi.hIndex) > 0 ? `${pi.hIndex}` : "44"
  );

  return (
    <>
      <div id="section-pi" className="scroll-mt-24 space-y-6">
        {/* Section Subhead & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Founding Director &amp; Senior Supervisor</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
                Principal Investigator &amp; Lab Leadership
              </h2>
            </div>
          </div>

          <button
            onClick={() => setShowCV(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:scale-98 transition-all cursor-pointer self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" />
            <span>View Full Academic CV</span>
          </button>
        </div>

        {/* Main Clean Academic Container */}
        <div className="rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-12 shadow-2xl shadow-slate-950/5 dark:shadow-black/40 relative overflow-hidden">
          
          {/* Ambient Background Aura */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center relative z-10">
            
            {/* Left Column: Scaled Image with Soft Back Glow & Slight Pop-up (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col items-center w-full">
              
              {/* Outer Wrapper with Back Glow */}
              <div className="relative w-full max-w-[395px] sm:max-w-[410px] group">
                
                {/* Emerald/Teal Back Glow on Hover */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-emerald-500/0 via-teal-500/0 to-emerald-500/0 group-hover:from-emerald-500/35 group-hover:via-teal-400/30 group-hover:to-emerald-500/35 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none -z-10" />

                {/* Portrait Card with Pop-up Lift */}
                <div className="relative aspect-[4/4.9] rounded-3xl overflow-hidden shadow-xl border-4 border-white dark:border-slate-700/80 ring-1 ring-emerald-500/20 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-emerald-500/20 group-hover:border-emerald-400 dark:group-hover:border-emerald-400 transition-all duration-300 cursor-pointer">
                  
                  {/* High-Resolution Main Portrait Image */}
                  <img
                    src={pi.imageSrc}
                    alt={pi.name}
                    className="w-full h-full object-cover object-top filter brightness-[0.98] contrast-[1.03] transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark Vignette & Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent pointer-events-none" />

                  {/* Floating Top Credential Badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold border border-emerald-500/40 shadow-xl flex items-center gap-2 group-hover:border-emerald-400 group-hover:bg-emerald-950/80 transition-colors">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Lab Director &amp; PI</span>
                    </span>
                  </div>

                  {/* Bottom Image Caption Overlay */}
                  <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-1">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30 backdrop-blur-sm">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Dept. of Environmental Sciences</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black tracking-tight font-[family-name:var(--font-manrope)] text-white group-hover:text-emerald-300 transition-colors">
                      {pi.name}
                    </h3>

                    <p className="text-xs text-emerald-300 font-semibold">
                      {pi.role}
                    </p>

                    <p className="text-[11px] text-slate-300/90 font-medium">
                      {pi.affiliation}
                    </p>
                  </div>
                </div>

              </div>

              {/* Academic Impact Metrics Strip */}
              <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full max-w-[395px] sm:max-w-[410px] mt-4">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center shadow-xs hover:border-emerald-500/40 transition-colors">
                  <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400 font-[family-name:var(--font-manrope)]">
                    {publicationsText}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Peer Papers
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center shadow-xs hover:border-emerald-500/40 transition-colors">
                  <span className="block text-xl font-black text-teal-600 dark:text-teal-400 font-[family-name:var(--font-manrope)]">
                    {citationsText}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    Citations
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-center shadow-xs hover:border-emerald-500/40 transition-colors">
                  <span className="block text-xl font-black text-emerald-600 dark:text-emerald-400 font-[family-name:var(--font-manrope)]">
                    {hIndexText}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    h-Index
                  </span>
                </div>
              </div>

              {/* Action Button & Academic Profile Links */}
              <div className="flex flex-wrap items-center justify-center gap-2 w-full max-w-[395px] sm:max-w-[410px] mt-3">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <Link
                    href={`/team/${pi.slug}`}
                    className="py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-xs active:scale-98"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </Link>

                  <button
                    onClick={() => setShowCV(true)}
                    className="py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-extrabold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
                  >
                    <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Academic CV</span>
                  </button>
                </div>

                {pi.googleScholarUrl && (
                  <a
                    href={pi.googleScholarUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[110px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>Google Scholar</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  </a>
                )}
                {pi.orcid && (
                  <a
                    href={`https://orcid.org/${pi.orcid}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[130px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#A6CE39]" />
                    <span>ORCID: {pi.orcid}</span>
                  </a>
                )}
                {pi.researchGateUrl && (
                  <a
                    href={pi.researchGateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 min-w-[110px] px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>ResearchGate</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                  </a>
                )}
              </div>

            </div>

            {/* Right Column: Narrative, Research Focus, Education & Contacts (7 Cols) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Header / Subhead */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-bold tracking-wide">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Founding Director &amp; Senior Supervisor</span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-[family-name:var(--font-manrope)] leading-tight">
                  Pioneering Environmental Toxicology &amp; Contaminant Risk Science
                </h3>
              </div>

              {/* Philosophy / Vision Quote */}
              {pi.quote && (
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border-l-4 border-emerald-500 space-y-2">
                  <Quote className="w-5 h-5 text-emerald-600 dark:text-emerald-400 opacity-70" />
                  <p className="text-xs sm:text-sm font-medium italic text-slate-800 dark:text-slate-200 leading-relaxed font-[family-name:var(--font-inter)]">
                    "{pi.quote}"
                  </p>
                </div>
              )}

              {/* Detailed Biography */}
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <p>{pi.bio}</p>
              </div>

              {/* Research Focus Tags */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                  Primary Research Domains
                </span>
                <div className="flex flex-wrap gap-2">
                  {pi.researchInterests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-emerald-300 shadow-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Education Credentials Timeline */}
              {pi.education && pi.education.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                    Academic Background &amp; Fellowships
                  </span>
                  <div className="space-y-2">
                    {pi.education.map((edu, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{edu}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Direct Contact Card */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pi.email && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Email</div>
                      <a
                        href={`mailto:${pi.email}`}
                        className="text-xs font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-500 transition-colors truncate block"
                      >
                        {pi.email}
                      </a>
                    </div>
                  </div>
                )}

                {pi.officeLocation && (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <MapPin className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Office &amp; Lab</div>
                      <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                        {pi.officeLocation}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Interactive CV Modal */}
      <CVModal
        isOpen={showCV}
        onClose={() => setShowCV(false)}
        pi={pi}
      />
    </>
  );
}
