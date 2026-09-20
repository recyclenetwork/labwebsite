"use client";

import * as React from "react";
import Link from "next/link";
import {
  FlaskConical,
  Sparkles,
  HeartPulse,
  Leaf,
  Activity,
  Compass,
  ArrowRight,
  Microscope,
  Sliders,
  LayoutGrid,
  Orbit,
  Atom,
  Layers,
  CheckCircle2,
  ExternalLink,
  Waves,
  Shuffle,
} from "lucide-react";
import { useLandingData } from "@/lib/landing-store";
import {
  ResearchPillar,
  fetchResearchPillarsAsync,
  getStoredResearchPillars,
} from "@/lib/research-areas/store";

interface StudyDomain {
  id: string;
  index: string;
  title: string;
  shortTitle: string;
  slug: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  icon: React.ComponentType<{ className?: string }>;
  tags: string[];
  keyHighlight: string;
  instrumentation: string;
  targetMatrices: string;
  detectionMetric: string;
  angleDeg: number;
}

const ICON_REGISTRY: Record<string, React.ComponentType<{ className?: string }>> = {
  FlaskConical,
  Sparkles,
  HeartPulse,
  Leaf,
  Activity,
  Compass,
  Microscope,
  Atom,
  Waves,
  Layers,
};

function mapPillarToDomain(p: ResearchPillar, idx: number): StudyDomain {
  const IconComp = ICON_REGISTRY[p.icon_name] || FlaskConical;
  return {
    id: p.id,
    index: p.index || String(idx + 1).padStart(2, "0"),
    title: p.title,
    shortTitle: p.shortTitle || p.title.split(" ")[0],
    slug: p.slug,
    description: p.description,
    imageSrc: p.imageSrc || "/images/areas/area-1.jpg",
    imageAlt: p.imageAlt || p.title,
    icon: IconComp,
    tags: p.tags || [],
    keyHighlight: p.keyHighlight || "Scientific Focus",
    instrumentation: p.instrumentation || "Analytical Instrumentation",
    targetMatrices: p.targetMatrices || "Environmental matrices",
    detectionMetric: p.detectionMetric || "Analytical Limit",
    angleDeg: p.angleDeg || (idx * 60) % 360,
  };
}

interface ResearchAreasProps {
  areas?: unknown;
}

export function ResearchAreas({ areas }: ResearchAreasProps = {}) {
  const { data: landingData } = useLandingData();
  const [viewMode, setViewMode] = React.useState<"deck" | "radial" | "grid">("deck");
  const [domains, setDomains] = React.useState<StudyDomain[]>([]);
  const [activeCard, setActiveCard] = React.useState<StudyDomain | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const [isHovering, setIsHovering] = React.useState(false);
  const [isShuffling, setIsShuffling] = React.useState(false);

  // Shuffle array helper
  const shuffleArray = React.useCallback((array: StudyDomain[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, []);

  // Fetch live research pillars from Supabase / storage
  const loadPillars = React.useCallback(async () => {
    try {
      const latest = await fetchResearchPillarsAsync();
      if (Array.isArray(latest) && latest.length > 0) {
        const mapped = latest.map(mapPillarToDomain);
        setDomains(mapped);
        setActiveCard((prev) => {
          const match = mapped.find((m) => m.id === prev?.id);
          return match || mapped[0];
        });
      } else {
        setDomains([]);
        setActiveCard(null);
      }
    } catch (err) {
      console.warn("Could not fetch remote research pillars:", err);
      setDomains([]);
      setActiveCard(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    // Sync with client-side cache immediately on mount to prevent SSR mismatch
    const stored = getStoredResearchPillars();
    if (stored && stored.length > 0) {
      const mapped = stored.map(mapPillarToDomain);
      setDomains(mapped);
      setActiveCard((prev) => {
        const match = mapped.find((m) => m.id === prev?.id);
        return match || mapped[0];
      });
    }

    loadPillars();

    const handleUpdate = () => {
      loadPillars();
    };

    window.addEventListener("lab_research_areas_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("lab_research_areas_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [loadPillars]);

  // Randomize View Mode & Cards on client load based on admin settings
  React.useEffect(() => {
    const shouldShuffleMode = landingData?.researchFocus?.shuffleViewMode !== false;
    const viewModes: Array<"deck" | "radial" | "grid"> = ["deck", "radial", "grid"];

    if (shouldShuffleMode) {
      const randomMode = viewModes[Math.floor(Math.random() * viewModes.length)];
      setViewMode(randomMode);
    } else if (landingData?.researchFocus?.defaultViewMode) {
      setViewMode(landingData.researchFocus.defaultViewMode);
    }
  }, [
    landingData?.researchFocus?.shuffleViewMode,
    landingData?.researchFocus?.defaultViewMode,
  ]);

  // Interactive shuffle button handler
  const handleShuffle = () => {
    setIsShuffling(true);
    const viewModes: Array<"deck" | "radial" | "grid"> = ["deck", "radial", "grid"];
    const randomMode = viewModes[Math.floor(Math.random() * viewModes.length)];
    setViewMode(randomMode);

    const shuffled = shuffleArray(domains);
    setDomains(shuffled);
    setActiveCard(shuffled[0]);

    setTimeout(() => {
      setIsShuffling(false);
    }, 400);
  };

  if (domains.length === 0 || !activeCard) {
    return null;
  }

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-[#F0FDF4]/60 via-[#F8FAF9] to-white dark:from-[#08130B] dark:via-[#090D16] dark:to-[#0B1120] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 space-y-12">
        {/* Top Header Row with View Switcher Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-3 text-left">
            {/* Scientific Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E8F5EE] dark:bg-emerald-950/80 border border-emerald-900/10 dark:border-emerald-800/40 text-[11.5px] font-bold uppercase tracking-wider text-[#047857] dark:text-[#34D399]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span>{landingData?.researchFocus?.badge || "What we study"}</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-[42px] font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug font-[family-name:var(--font-manrope)]">
              {landingData?.researchFocus?.title || "Our Research Focus on Environment, Biology & Health"}
            </h2>
            {landingData?.researchFocus?.subtitle && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl font-[family-name:var(--font-inter)]">
                {landingData.researchFocus.subtitle}
              </p>
            )}
          </div>

          {/* Right Controls: View Mode Switcher + Shuffle Button + Explore Link */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            {/* Interactive View Mode Switcher (Deck, Orbit, Grid, Shuffle) */}
            <div className="inline-flex items-center p-1 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-sm gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode("deck")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  viewMode === "deck"
                    ? "bg-[#14532D] dark:bg-[#10B981] text-white dark:text-slate-950 shadow-md font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#14532D] dark:hover:text-[#34D399]"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Pillar Deck</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("radial")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  viewMode === "radial"
                    ? "bg-[#14532D] dark:bg-[#10B981] text-white dark:text-slate-950 shadow-md font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#14532D] dark:hover:text-[#34D399]"
                }`}
              >
                <Orbit className="w-3.5 h-3.5" />
                <span>Orbit Map</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  viewMode === "grid"
                    ? "bg-[#14532D] dark:bg-[#10B981] text-white dark:text-slate-950 shadow-md font-bold"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#14532D] dark:hover:text-[#34D399]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid Matrix</span>
              </button>

              <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-1" />

              {/* Shuffle / Randomize Button */}
              <button
                type="button"
                onClick={handleShuffle}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer text-slate-600 dark:text-slate-300 hover:text-[#14532D] dark:hover:text-[#34D399] hover:bg-slate-100 dark:hover:bg-slate-800/80 active:scale-95 ${
                  isShuffling ? "text-emerald-500 scale-105" : ""
                }`}
                title="Shuffle & Randomize Research Pillars"
              >
                <Shuffle className={`w-3.5 h-3.5 transition-transform duration-500 ${isShuffling ? "rotate-180 text-emerald-500 scale-125" : ""}`} />
                <span className="hidden xs:inline">Shuffle</span>
              </button>
            </div>

            {/* "Explore all research areas →" Link */}
            <Link
              href="/research"
              className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#14532D] dark:text-[#34D399] hover:text-[#059669] dark:hover:text-white transition-colors group"
            >
              <span className="hidden md:inline">Explore research</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/40 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-[#10B981] group-hover:text-black transition-all">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Link>
          </div>
        </div>

        {/* VIEW MODE 1: HOLOGRAPHIC EXPANDING PILLAR DECK */}
        {viewMode === "deck" && (
          <div className="space-y-5">
            {/* Top Interactive Deck Header Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="uppercase tracking-wider">Interactive Science Monolith Deck</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Hover or click any pillar to expand its laboratory instrumentation and live telemetry
              </div>
            </div>

            {/* Expanding Horizontal Monolith Deck */}
            <div className="flex flex-col lg:flex-row items-stretch gap-3 sm:gap-4 min-h-[580px] lg:min-h-[620px]">
              {domains.map((domain, idx) => {
                const Icon = domain.icon;
                const isExpanded = activeCard?.id === domain.id || (!activeCard && idx === 0);

                return (
                  <div
                    key={domain.id}
                    onClick={() => setActiveCard(domain)}
                    onMouseEnter={() => setActiveCard(domain)}
                    className={`rounded-3xl border relative overflow-hidden flex flex-col justify-between cursor-pointer will-change-[flex,max-width,transform,box-shadow] [transition:all_1100ms_cubic-bezier(0.25,1,0.3,1)] ${
                      isExpanded
                        ? "flex-1 lg:flex-[3.8] bg-white dark:bg-[#0F172A] border-emerald-500/80 dark:border-emerald-500/70 shadow-2xl shadow-emerald-950/20 dark:shadow-emerald-950/40 p-6 sm:p-8"
                        : "flex-none h-20 lg:h-auto lg:flex-[0.65] lg:max-w-[105px] bg-slate-50 dark:bg-[#0B1120] border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-slate-100/80 dark:hover:bg-[#0F172A]/80 p-4 lg:py-8 lg:px-4"
                    }`}
                  >
                    {/* Collapsed State View (Smoothly cross-fades out when expanding) */}
                    <div
                      className={`absolute inset-0 p-4 lg:py-8 lg:px-4 flex lg:flex-col items-center justify-between w-full h-full [transition:all_800ms_cubic-bezier(0.25,1,0.3,1)] ${
                        isExpanded
                          ? "opacity-0 pointer-events-none scale-90 -translate-y-2 lg:translate-y-0 lg:-translate-x-2"
                          : "opacity-100 pointer-events-auto scale-100 translate-y-0 translate-x-0"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="hidden lg:flex items-center justify-center flex-1 my-4">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 whitespace-nowrap [writing-mode:vertical-rl] rotate-180">
                          {domain.index} • {domain.shortTitle}
                        </span>
                      </div>

                      <span className="lg:hidden text-xs font-bold text-slate-700 dark:text-slate-300">
                        {domain.index} · {domain.title}
                      </span>

                      <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                        {domain.index}
                      </span>
                    </div>

                    {/* Expanded Active View (Smoothly cross-fades in with velvety slow slide) */}
                    <div
                      className={`w-full h-full flex flex-col justify-between space-y-6 [transition:opacity_900ms_cubic-bezier(0.25,1,0.3,1)_200ms,transform_1000ms_cubic-bezier(0.25,1,0.3,1)_150ms] ${
                        isExpanded
                          ? "opacity-100 scale-100 pointer-events-auto translate-y-0 relative z-10"
                          : "opacity-0 scale-[0.98] pointer-events-none translate-y-3 absolute inset-0 p-6 sm:p-8 overflow-hidden"
                      }`}
                    >
                      {/* Top Banner */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                              PILLAR {domain.index}
                            </div>
                            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
                              {domain.title}
                            </h3>
                          </div>
                        </div>

                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20 w-fit">
                          {domain.keyHighlight}
                        </span>
                      </div>

                      {/* Mid Grid: Viewport Image + Live Telemetry Waveform */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Image Viewport */}
                        <div className="md:col-span-6 relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md group/img">
                          <img
                            src={domain.imageSrc}
                            alt={domain.imageAlt}
                            className="w-full h-full object-cover object-center filter brightness-[0.98] group-hover/img:scale-105 [transition:transform_1400ms_cubic-bezier(0.25,1,0.3,1)]"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                          <div className="absolute top-3 left-3 z-10">
                            <span className="px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1.5 shadow">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                              <span>LIVE VIEWPORT</span>
                            </span>
                          </div>

                          <div className="absolute bottom-3 left-3 right-3 text-white z-10">
                            <div className="text-[11px] font-semibold text-emerald-300">
                              Detection Benchmark:
                            </div>
                            <div className="text-xs font-black">
                              {domain.detectionMetric}
                            </div>
                          </div>
                        </div>

                        {/* Technical Telemetry & Specifications */}
                        <div className="md:col-span-6 space-y-4 text-left">
                          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                            {domain.description}
                          </p>

                          {/* Simulated Live Spectral Waveform HUD */}
                          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                                <Waves className="w-3.5 h-3.5" />
                                <span>Live Telemetry Spectrum</span>
                              </span>
                              <span>100Hz • CALIBRATED</span>
                            </div>

                            {/* Stylized Sine/Peak Waveform */}
                            <svg
                              viewBox="0 0 400 45"
                              className="w-full h-9 text-emerald-500 dark:text-emerald-400 overflow-visible"
                            >
                              <path
                                d="M0,22 Q25,22 40,8 T80,36 T120,4 T160,30 T200,22 T240,10 T280,38 T320,14 T360,28 T400,22"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                              />
                              <circle cx="120" cy="4" r="3.5" fill="#10B981" className="animate-ping" />
                            </svg>
                          </div>

                          {/* Technical Specs Tags */}
                          <div className="space-y-1.5 text-xs">
                            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                              Primary Instrumentation &amp; Matrices
                            </div>
                            <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                              {domain.instrumentation}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              Matrices: {domain.targetMatrices}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions Row */}
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-1.5">
                          {domain.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0B1120] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-800"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <Link
                          href={`/research#${domain.slug}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition shadow-md shadow-emerald-950/20 active:scale-95 ml-auto"
                        >
                          <span>Explore Full Pillar Research</span>
                          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW MODE 2: RADIAL ORBIT / MINDMAP */}
        {viewMode === "radial" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

            {/* LEFT / CENTER: Interactive Radial Mindmap Canvas */}
            <div className="lg:col-span-8 rounded-3xl bg-white dark:bg-[#0F172A]/80 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-sm flex flex-col justify-between min-h-[640px] lg:min-h-[680px]">

              {/* Background Concentric Radar & Orbital Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[280px] h-[280px] rounded-full border border-dashed border-emerald-500/15 animate-[spin_60s_linear_infinite]" />
                <div className="absolute w-[450px] h-[450px] rounded-full border border-emerald-500/15 dark:border-emerald-800/25" />
                <div className="absolute w-[580px] h-[580px] rounded-full border border-slate-200/50 dark:border-slate-800/40" />
              </div>

              {/* Top Hint Bar */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/50 text-xs font-semibold text-emerald-800 dark:text-[#34D399] shadow-xs">
                  <Atom className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Interactive Research Pillars</span>
                </div>

                <div className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Click or hover any pillar to inspect</span>
                </div>
              </div>

              {/* Radial Orbit Arena */}
              <div className="relative z-10 w-full flex-grow my-auto flex items-center justify-center min-h-[500px]">

                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="-320 -260 640 520"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="orbit-grad-active" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#059669" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  <circle
                    cx="0"
                    cy="0"
                    r="225"
                    fill="none"
                    stroke="currentColor"
                    strokeDasharray="6 8"
                    className="text-emerald-500/20 dark:text-emerald-500/15"
                  />

                  {domains.map((domain, idx) => {
                    const angleDeg = (idx * (360 / (domains.length || 6)) + 270) % 360;
                    const rad = (angleDeg * Math.PI) / 180;
                    const r = 225;
                    const targetX = Math.round(r * Math.cos(rad));
                    const targetY = Math.round(r * Math.sin(rad));

                    const ctrlX1 = Math.round(targetX * 0.35 - Math.sin(rad) * 20);
                    const ctrlY1 = Math.round(targetY * 0.35 + Math.cos(rad) * 20);
                    const ctrlX2 = Math.round(targetX * 0.7 + Math.sin(rad) * 12);
                    const ctrlY2 = Math.round(targetY * 0.7 - Math.cos(rad) * 12);

                    const isSelected = activeCard.id === domain.id;

                    return (
                      <g key={`orbit-line-${domain.id}`}>
                        <path
                          d={`M0,0 C${ctrlX1},${ctrlY1} ${ctrlX2},${ctrlY2} ${targetX},${targetY}`}
                          fill="none"
                          stroke={isSelected ? "url(#orbit-grad-active)" : "currentColor"}
                          strokeWidth={isSelected ? "2.5" : "1.2"}
                          strokeDasharray={isSelected ? "none" : "4 4"}
                          className={
                            isSelected
                              ? "text-[#10B981] transition-all duration-300"
                              : "text-slate-300 dark:text-emerald-900/40 transition-all duration-300"
                          }
                        />
                        {isSelected && (
                          <circle cx={targetX} cy={targetY} r="4.5" fill="#10B981" className="animate-ping" />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Central Core Circle Node */}
                <div className="relative z-20 w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-[#14532D] via-[#064E3B] to-[#022C19] text-white p-4 flex flex-col items-center justify-center text-center shadow-2xl border-4 border-white dark:border-[#072214] ring-4 ring-[#10B981]/25 select-none">
                  <div className="w-8 h-8 rounded-full bg-white/15 border border-white/20 flex items-center justify-center mb-1 shadow-inner">
                    <FlaskConical className="w-4 h-4 text-[#34D399]" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#34D399] leading-none mb-0.5 font-[family-name:var(--font-inter)]">
                    RESEARCH CORE
                  </span>
                  <h3 className="text-xs sm:text-[13px] font-extrabold tracking-tight font-[family-name:var(--font-manrope)] leading-tight text-white px-1">
                    Our Research <br />
                    Focus on
                  </h3>
                  <span className="text-[10px] text-emerald-100 font-medium mt-0.5">
                    6 Key Pillars
                  </span>
                </div>

                {/* 6 Orbiting Satellite Circular Nodes */}
                {domains.map((domain, idx) => {
                  const Icon = domain.icon;
                  const angleDeg = (idx * (360 / (domains.length || 6)) + 270) % 360;
                  const rad = (angleDeg * Math.PI) / 180;
                  const r = 225;
                  const x = Math.round(r * Math.cos(rad));
                  const y = Math.round(r * Math.sin(rad));

                  const isSelected = activeCard.id === domain.id;

                  return (
                    <button
                      key={`satellite-${domain.id}`}
                      type="button"
                      onClick={() => setActiveCard(domain)}
                      onMouseEnter={() => {
                        setActiveCard(domain);
                        setIsHovering(true);
                      }}
                      onMouseLeave={() => setIsHovering(false)}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                      className={`absolute z-30 group flex flex-col items-center justify-center -ml-12 -mt-12 sm:-ml-[50px] sm:-mt-[50px] w-24 h-24 sm:w-[100px] sm:h-[100px] rounded-full transition-all duration-300 cursor-pointer ${isSelected
                          ? "bg-gradient-to-br from-[#064E3B] to-[#022C19] text-white scale-110 shadow-2xl ring-4 ring-[#10B981] border-2 border-white dark:border-[#090D16]"
                          : "bg-white dark:bg-[#0F172A] text-slate-900 dark:text-white border-2 border-slate-200/90 dark:border-slate-700 shadow-md hover:scale-105 hover:border-[#10B981] hover:shadow-lg"
                        }`}
                    >
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-0.5 ${isSelected
                            ? "bg-[#10B981] text-black shadow-xs"
                            : "bg-slate-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-[#34D399]"
                          }`}
                      >
                        {domain.index}
                      </span>

                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${isSelected ? "text-[#34D399]" : "text-[#059669] dark:text-[#34D399]"
                          }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2.2]" />
                      </div>

                      <span className="text-[10.5px] sm:text-[11.5px] font-bold text-center leading-tight px-1 max-w-[85px] line-clamp-2 font-[family-name:var(--font-inter)]">
                        {domain.shortTitle}
                      </span>
                    </button>
                  );
                })}

              </div>

            </div>

            {/* RIGHT: Tall Discovery Inspector Card */}
            <div className="lg:col-span-4 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#043324] to-[#011B10] text-white shadow-2xl p-7 sm:p-8 2xl:p-9 flex flex-col justify-between relative overflow-hidden border border-emerald-500/25 min-h-[600px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold uppercase text-emerald-200">
                    <Microscope className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Domain Spotlight</span>
                  </div>

                  <span className="text-xs font-bold text-[#34D399] px-3 py-1 rounded-full bg-black/40 border border-emerald-500/30">
                    PILLAR {activeCard.index}
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-white/15 shadow-md">
                  <img
                    src={activeCard.imageSrc}
                    alt={activeCard.imageAlt}
                    className="w-full h-full object-cover filter brightness-[0.95] transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#34D399] font-bold">
                      {activeCard.keyHighlight}
                    </span>
                    <span className="text-white/90 text-[11px]">
                      Field-Assayed Framework
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight font-[family-name:var(--font-manrope)] text-white leading-snug">
                    {activeCard.title}
                  </h3>
                  <p className="text-sm sm:text-[15px] text-emerald-50/90 dark:text-slate-100 leading-relaxed font-normal font-[family-name:var(--font-inter)]">
                    {activeCard.description}
                  </p>
                </div>

                <div className="p-4 sm:p-4.5 rounded-2xl bg-black/40 border border-emerald-500/30 backdrop-blur-md space-y-2.5 shadow-inner text-xs sm:text-[13px] font-[family-name:var(--font-inter)]">
                  <div className="flex items-start gap-2 text-emerald-200">
                    <Sliders className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-slate-400 font-medium">Methodology: </span>
                      <span className="text-white font-semibold">{activeCard.instrumentation}</span>
                    </div>
                  </div>
                  <div className="text-emerald-200 pl-6">
                    <span className="text-slate-400 font-medium">Target Matrices: </span>
                    <span className="text-emerald-100 font-normal">{activeCard.targetMatrices}</span>
                  </div>
                  <div className="text-[#34D399] font-bold pl-6 pt-0.5 flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Detection Limit: </span>
                    <span>{activeCard.detectionMetric}</span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-white/15">
                <Link
                  href={`/research#${activeCard.slug}`}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-white text-[#064E3B] hover:bg-emerald-50 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-lg active:scale-95 group/btn"
                >
                  <span>Explore {activeCard.shortTitle} Focus</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>

            </div>

          </div>
        )}

        {/* VIEW MODE 2: GRID MATRIX VIEW */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

            <div className="lg:col-span-4 flex flex-col justify-between p-7 sm:p-8 2xl:p-9 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#043324] to-[#011B10] text-white shadow-2xl relative overflow-hidden border border-emerald-500/25 group min-h-[580px]">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#10B981]/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

              <div className="relative z-10 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold uppercase text-emerald-200">
                    <Microscope className="w-3.5 h-3.5 text-[#34D399]" />
                    <span>Analytical Matrix Core</span>
                  </div>

                  <span className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                    <span>Live Program</span>
                  </span>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-2xl sm:text-[28px] font-extrabold tracking-tight font-[family-name:var(--font-manrope)] leading-tight text-white">
                    Integrated Scientific Framework
                  </h3>
                  <p className="text-sm text-emerald-50/90 leading-relaxed font-normal font-[family-name:var(--font-inter)]">
                    Our laboratory pairs ultra-trace mass spectrometry with in-vitro toxicogenomics and watershed GIS to produce high-impact, peer-reviewed environmental intelligence.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-black/40 border border-emerald-500/30 backdrop-blur-md space-y-3 transition-all duration-300 shadow-inner">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      <Sliders className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>METHODOLOGY INSPECT</span>
                    </div>
                    <span className="text-xs font-bold text-[#34D399] px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/60">
                      PILLAR {activeCard.index}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                      <span>{activeCard.title}</span>
                    </p>

                    <div className="space-y-1.5 text-xs sm:text-[13px] font-[family-name:var(--font-inter)]">
                      <div className="text-emerald-200">
                        <span className="text-slate-400 font-medium">Standard: </span>
                        <span className="text-white font-semibold">{activeCard.instrumentation}</span>
                      </div>
                      <div className="text-emerald-200">
                        <span className="text-slate-400 font-medium">Matrices: </span>
                        <span className="text-emerald-100 font-normal">{activeCard.targetMatrices}</span>
                      </div>
                      <div className="text-[#34D399] font-bold pt-0.5">
                        <span className="text-slate-400 font-medium">Threshold: </span>
                        <span>{activeCard.detectionMetric}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-6 border-t border-white/15 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="block text-xl font-extrabold text-[#34D399]">
                      0.1 ppt
                    </span>
                    <span className="text-xs text-emerald-100/80 font-medium tracking-wide">
                      Mass Spec LOD
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <span className="block text-xl font-extrabold text-[#34D399]">
                      ISO 17025
                    </span>
                    <span className="text-xs text-emerald-100/80 font-medium tracking-wide">
                      QA/QC Standard
                    </span>
                  </div>
                </div>

                <Link
                  href="/research"
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-[#064E3B] hover:bg-emerald-50 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 shadow-lg active:scale-95 group/btn"
                >
                  <span>View Full Research Program</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
              {domains.map((domain) => {
                const Icon = domain.icon;
                const isSelected = activeCard.id === domain.id;

                return (
                  <Link
                    key={domain.id}
                    href={`/research#${domain.slug}`}
                    onMouseEnter={() => {
                      setActiveCard(domain);
                      setIsHovering(true);
                    }}
                    onMouseLeave={() => setIsHovering(false)}
                    className={`group relative rounded-3xl bg-white dark:bg-[#0F172A] border transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1.5 shadow-sm hover:shadow-2xl hover:shadow-black/20 ${isSelected
                        ? "border-[#10B981] ring-1 ring-[#10B981]/30 dark:border-[#10B981]"
                        : "border-slate-200/90 dark:border-slate-800 hover:border-[#10B981] dark:hover:border-[#10B981]"
                      }`}
                  >
                    <div className="relative w-full aspect-[16/10] overflow-hidden bg-slate-900">
                      <img
                        src={domain.imageSrc}
                        alt={domain.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.93]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/15 to-black/25 pointer-events-none" />

                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                        <span className="text-xs font-extrabold text-white px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow">
                          {domain.index}
                        </span>

                        <div className="w-7 h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-[#34D399] flex items-center justify-center shadow group-hover:bg-[#10B981] group-hover:text-black transition-colors">
                          <Icon className="w-3.5 h-3.5 stroke-[2.2]" />
                        </div>
                      </div>
                    </div>

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

                    <div className="p-4 sm:p-5 pt-1 flex-grow flex flex-col justify-between space-y-3">
                      <div className="space-y-2 text-left">
                        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight font-[family-name:var(--font-manrope)] group-hover:text-[#059669] dark:group-hover:text-[#34D399] transition-colors leading-snug">
                          {domain.title}
                        </h3>

                        <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal line-clamp-2 font-[family-name:var(--font-inter)]">
                          {domain.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[#047857] dark:text-[#34D399] truncate">
                          {domain.keyHighlight}
                        </span>

                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#14532D] dark:text-[#10B981] group-hover:translate-x-1 transition-transform flex-shrink-0">
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </section>
  );
}
