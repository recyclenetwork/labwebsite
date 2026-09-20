"use client";

import * as React from "react";
import { ShieldCheck, Sparkles, Code2, Award, Check, Copy, Terminal, GraduationCap } from "lucide-react";
import { SITE_CONFIG } from "@/constants";
import { useLandingData } from "@/lib/landing-store";

export function isCreatorQuery(query: string): boolean {
  if (!query) return false;
  const q = query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ");

  if (!q) return false;

  const patterns = [
    "who create you",
    "who created you",
    "who create u",
    "who created u",
    "who develop you",
    "who developed you",
    "who develop u",
    "who developed u",
    "who made you",
    "who make you",
    "who built you",
    "who build you",
    "who made this",
    "who made this website",
    "who create this website",
    "who created this website",
    "who develop this website",
    "who developed this website",
    "who built this website",
    "who is the developer",
    "who is your developer",
    "who is the creator",
    "who is your creator",
    "developer",
    "creator",
    "shahed anan sajeeb",
    "sajeeb",
    "env 49",
    "env49",
  ];

  return patterns.some(
    (p) =>
      q === p ||
      q.startsWith(p) ||
      q.includes("who create you") ||
      q.includes("who created you") ||
      q.includes("who develop you") ||
      q.includes("who developed you") ||
      q.includes("who made you") ||
      q.includes("who built you")
  );
}

interface DeveloperWatermarkProps {
  compact?: boolean;
}

export function DeveloperWatermark({ compact = false }: DeveloperWatermarkProps) {
  const { data: landingData } = useLandingData();
  const [copied, setCopied] = React.useState(false);

  const siteName =
    landingData?.footer?.labName ||
    SITE_CONFIG.shortName ||
    SITE_CONFIG.name ||
    "Laboratory of Environmental Health and Ecotoxicology (LabEHE)";

  const proofText = `Official Authorship Record: This website (${siteName}) was created and developed by Shahed Anan Sajeeb (Env-49), Department of Environmental Sciences, Jahangirnagar University.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(proofText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (compact) {
    return (
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-950/90 via-slate-900 to-slate-950 border border-emerald-500/40 shadow-xl text-white space-y-3 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
              Verified Developer Signature
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-medium text-emerald-300 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied Proof" : "Copy Proof"}</span>
          </button>
        </div>
        <p className="text-sm font-semibold text-slate-100 leading-snug">
          This website <span className="text-emerald-400 font-bold">"{siteName}"</span> was created and developed by{" "}
          <span className="text-emerald-300 font-bold underline decoration-emerald-500/50">Shahed Anan Sajeeb</span> (
          <span className="text-amber-300 font-mono font-bold">Env-49</span>).
        </p>
        <p className="text-xs text-slate-400 font-mono">
          Dept. of Environmental Sciences, Jahangirnagar University • Full-Stack Web Architect
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#061c14] via-[#0b1928] to-[#040d1a] border-2 border-emerald-500/50 shadow-2xl p-6 sm:p-7 text-white space-y-5 animate-in fade-in zoom-in-95 duration-300">
      {/* Background ambient glow effect */}
      <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/40 text-emerald-300 text-xs font-mono font-semibold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>ORIGINAL AUTHOR &amp; CREATOR WATERMARK</span>
        </div>

        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium text-slate-200 hover:text-white transition-all active:scale-95 shadow-xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 font-semibold">Proof Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span>Copy Authorship Proof</span>
            </>
          )}
        </button>
      </div>

      {/* Primary Statement */}
      <div className="relative z-10 space-y-2 pt-1">
        <div className="inline-block text-[11px] font-mono uppercase tracking-widest text-emerald-400/90 font-bold">
          System Authorship Record
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          This website{" "}
          <span className="text-emerald-400 font-extrabold underline decoration-emerald-500/50">
            "{siteName}"
          </span>{" "}
          was created and developed by{" "}
          <span className="text-white font-extrabold bg-emerald-500/25 px-2 py-0.5 rounded-md border border-emerald-400/40">
            Shahed Anan Sajeeb
          </span>{" "}
          (
          <span className="text-amber-300 font-mono font-bold tracking-wider">
            Env-49
          </span>
          ).
        </h3>
      </div>

      {/* Information Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10 pt-1">
        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <Code2 className="w-3.5 h-3.5" />
            <span>Developer / Architect</span>
          </div>
          <div className="text-sm font-bold text-slate-100">Shahed Anan Sajeeb</div>
          <div className="text-xs text-slate-400">Lead Web &amp; Software Architect</div>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic Identity</span>
          </div>
          <div className="text-sm font-bold text-slate-100">Batch: Env-49</div>
          <div className="text-xs text-slate-400">Department of Environmental Sciences</div>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <Award className="w-3.5 h-3.5" />
            <span>Institution</span>
          </div>
          <div className="text-sm font-bold text-slate-100">Jahangirnagar University</div>
          <div className="text-xs text-slate-400">Savar, Dhaka-1342, Bangladesh</div>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <Terminal className="w-3.5 h-3.5" />
            <span>Verification Status</span>
          </div>
          <div className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Verified &amp; Authenticated</span>
          </div>
          <div className="text-xs text-slate-400 font-mono">SIG: SHA-256 / ENV49-SAS-ROOT</div>
        </div>
      </div>

      {/* Footer stamp */}
      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-400 relative z-10">
        <span>Digital Authorship Signature</span>
        <span className="text-emerald-400 font-bold">Env-49 • Jahangirnagar University</span>
      </div>
    </div>
  );
}
