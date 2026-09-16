"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Leaf,
  Atom,
  Droplets,
  Activity,
  Heart,
  ChevronDown,
} from "lucide-react";
import type { HeroData } from "@/data/mock-homepage";
import { useLandingData } from "@/lib/landing-store";

interface HeroProps {
  data?: HeroData;
}

interface WorkflowStage {
  id: string;
  step: string;
  name: string;
  flow: string;
  eyebrow: string;
  headline: string;
  highlightPrefix: string;
  highlightWord: string;
  subheadline: string;
  imageSrc: string;
  imageAlt: string;
  associatedNodeId: string;
}

const WORKFLOW_STAGES: WorkflowStage[] = [
  {
    id: "stage-1",
    step: "01",
    name: "FIELD",
    flow: "ENVIRONMENT → EXPOSURE",
    eyebrow: "ENVIRONMENT • HEALTH • ECOTOXICOLOGY",
    headline: "Understanding",
    highlightPrefix: "what ",
    highlightWord: "surrounds us.",
    subheadline: "From environmental exposure to biological response.",
    imageSrc: "/images/slide-1-field.jpg",
    imageAlt: "Environmental scientist collecting water sample in pristine mountain watershed",
    associatedNodeId: "environment",
  },
  {
    id: "stage-2",
    step: "02",
    name: "LAB",
    flow: "CONTAMINANT → BIOLOGICAL RESPONSE",
    eyebrow: "MOLECULAR TOXICOLOGY • MASS SPECTROMETRY • BIOASSAYS",
    headline: "Quantifying",
    highlightPrefix: "molecular ",
    highlightWord: "cellular risk.",
    subheadline: "High-resolution micro-FTIR, chemical fate, and sub-lethal bioassays.",
    imageSrc: "/images/slide-2-lab.jpg",
    imageAlt: "Scientist performing analytical spectrometry in modern molecular toxicology lab",
    associatedNodeId: "contaminant",
  },
  {
    id: "stage-3",
    step: "03",
    name: "ANALYSIS",
    flow: "DATA → EVIDENCE",
    eyebrow: "DATA SCIENCE • BIOINFORMATICS • PATHWAY MODELING",
    headline: "Transforming",
    highlightPrefix: "signals into ",
    highlightWord: "clear evidence.",
    subheadline: "Predictive toxicogenomic modeling and multi-scale ecological datasets.",
    imageSrc: "/images/slide-3-analysis.jpg",
    imageAlt: "Researchers analyzing global ecotoxicological data and mapping screens",
    associatedNodeId: "response",
  },
  {
    id: "stage-4",
    step: "04",
    name: "IMPACT",
    flow: "EVIDENCE → HEALTH",
    eyebrow: "BIOREMEDIATION • HEALTH STANDARDS • RESTORATION",
    headline: "Protecting",
    highlightPrefix: "future ",
    highlightWord: "resilient ecosystems.",
    subheadline: "Translating empirical discoveries into actionable standards and remediation.",
    imageSrc: "/images/slide-4-impact.jpg",
    imageAlt: "Pristine restored watershed river valley and thriving ecosystem canopy",
    associatedNodeId: "health",
  },
];

const NODE_ICONS: Record<string, any> = {
  environment: Leaf,
  contaminant: Atom,
  exposure: Droplets,
  response: Activity,
  health: Heart,
};

const ARC_NODES = [
  {
    id: "environment",
    label: "ENVIRONMENT",
    icon: Leaf,
    desc: "Natural watersheds, alpine ecosystems & ambient exposure vectors",
    stageNumber: "STAGE 01 OF 05",
  },
  {
    id: "contaminant",
    label: "CONTAMINANT",
    icon: Atom,
    desc: "Microplastics, PFAS, pesticides & industrial chemical persistence",
    stageNumber: "STAGE 02 OF 05",
  },
  {
    id: "exposure",
    label: "EXPOSURE",
    icon: Droplets,
    desc: "Aqueous uptake, atmospheric deposition & trophic bioaccumulation",
    stageNumber: "STAGE 03 OF 05",
  },
  {
    id: "response",
    label: "BIOLOGICAL RESPONSE",
    icon: Activity,
    desc: "Sub-lethal physiological stress, toxicogenomics & DNA damage",
    stageNumber: "STAGE 04 OF 05",
  },
  {
    id: "health",
    label: "HEALTH",
    icon: Heart,
    desc: "Organism survival, biodiversity indices & human community well-being",
    stageNumber: "STAGE 05 OF 05",
  },
];

export function Hero({ data }: HeroProps) {
  const landingData = useLandingData();
  const currentStages =
    landingData.hero?.stages && landingData.hero.stages.length > 0
      ? landingData.hero.stages
      : WORKFLOW_STAGES;

  const currentArcNodes =
    landingData.hero?.arcNodes && landingData.hero.arcNodes.length > 0
      ? landingData.hero.arcNodes.map((n, idx) => ({
          id: n.id,
          label: n.label,
          desc: n.desc,
          icon: NODE_ICONS[n.id] || Leaf,
          stageNumber: n.stageNumber || `STAGE 0${idx + 1} OF 05`,
        }))
      : ARC_NODES;

  const [activeStage, setActiveStage] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [hoveredNodeId, setHoveredNodeId] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);

  const durationSec = landingData.hero?.slideDurationSeconds || 4;
  const slideDurationMs = durationSec * 1000;

  // Auto-advancing Slideshow Timer with smooth deterministic Ping-Pong Progression (1 → 2 → 3 → 4 → 3 → 2 → 1)
  React.useEffect(() => {
    if (hoveredNodeId) return;

    const startTime = Date.now();
    const intervalMs = 25; // 40fps smooth bar progress

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / slideDurationMs) * 100);
      setProgress(pct);

      if (elapsed >= slideDurationMs) {
        clearInterval(timer);
        setProgress(0);
        setActiveStage((curr) => {
          const total = currentStages.length;
          if (total <= 1) return 0;

          if (direction === 1) {
            if (curr >= total - 1) {
              setDirection(-1);
              return Math.max(0, total - 2);
            }
            return curr + 1;
          } else {
            if (curr <= 0) {
              setDirection(1);
              return Math.min(total - 1, 1);
            }
            return curr - 1;
          }
        });
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [activeStage, direction, hoveredNodeId, slideDurationMs, currentStages.length]);

  const selectStage = (index: number) => {
    setActiveStage(index);
    setProgress(0);
    if (index >= currentStages.length - 1) {
      setDirection(-1);
    } else if (index <= 0) {
      setDirection(1);
    }
  };

  const stage = currentStages[activeStage % currentStages.length] || currentStages[0];

  const scrollToNext = () => {
    window.scrollTo({
      top: window.innerHeight - 80,
      behavior: "smooth",
    });
  };

  return (
    <section
      aria-label="Environmental Research Slideshow Hero"
      className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#090D16] select-none"
    >
      {/* Background Slides with Smooth Cross-Fade Transitions */}
      <div className="absolute inset-0 z-0">
        {currentStages.map((s, idx) => {
          const isActive = idx === activeStage;
          return (
            <div
              key={s.id}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                isActive
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 z-0 pointer-events-none"
              }`}
            >
              <img
                src={s.imageSrc}
                alt={(s as any).imageAlt || s.name}
                className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
              />

              {/* Gradient Scrims for crisp contrast */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-black/55" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-transparent to-black/50" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 w-full pt-28 sm:pt-36 lg:pt-44 flex-grow flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          
          {/* Left Column: Headlines, Tag, and Dual CTAs */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-left">
            {/* Official Academic Laboratory Credential Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-black/50 border border-[#10B981]/40 backdrop-blur-md text-[10.5px] sm:text-[13px] font-mono-scientific font-bold text-emerald-300 tracking-[0.12em] uppercase shadow-lg max-w-full">
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
              </span>
              <span className="truncate">{stage.eyebrow}</span>
            </div>

            {/* Main Animated Headline with Strong Manrope Weight */}
            <div key={stage.id} className="animate-in fade-in slide-in-from-bottom-3 duration-500">
              <h1 className="text-[2rem] xs:text-[2.35rem] sm:text-5xl lg:text-[4.75rem] font-extrabold text-white leading-[1.12] sm:leading-[1.08] tracking-[-0.03em] font-heading drop-shadow-md">
                {stage.headline} <br />
                <span className="font-extrabold text-white">{stage.highlightPrefix}</span>
                <span className="font-extrabold text-[#34D399] drop-shadow-[0_0_35px_rgba(52,211,153,0.5)]">
                  {stage.highlightWord}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-xs xs:text-sm sm:text-base lg:text-lg text-slate-200/90 font-normal max-w-xl leading-relaxed drop-shadow mt-2.5 sm:mt-4">
                {stage.subheadline}
              </p>
            </div>

            {/* Dual Action Buttons (Side by Side or Stacked on narrow mobile) */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-row sm:items-center gap-2.5 sm:gap-4 pt-1 max-w-md sm:max-w-none">
              <Link
                href={landingData.hero.primaryCtaHref || "/research"}
                className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-white/35 bg-black/40 hover:bg-white/20 backdrop-blur-md text-white text-xs sm:text-[13px] font-mono-scientific uppercase tracking-wider font-bold transition-all shadow-lg hover:border-[#34D399] hover:shadow-[0_0_20px_rgba(52,211,153,0.3)] active:scale-95 text-center"
              >
                <span>{landingData.hero.primaryCtaLabel || "EXPLORE RESEARCH"}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#34D399] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>

              <Link
                href={landingData.hero.secondaryCtaHref || "/people"}
                className="group inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#10B981] hover:bg-[#34D399] text-[#04150C] text-xs sm:text-[13px] font-mono-scientific uppercase tracking-wider font-extrabold transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 text-center"
              >
                <span>{landingData.hero.secondaryCtaLabel || "MEET OUR LAB"}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[3] group-hover:translate-x-0.5 transition-transform shrink-0" />
              </Link>
            </div>
          </div>

          {/* Right Column: 5-Node Interactive Scientific Pathway Arc (Visible only on Desktop/Tablet Landscape) */}
          <div className="hidden lg:flex lg:col-span-5 relative flex-col items-end justify-center">
            <div className="relative w-full max-w-[340px] flex flex-col items-end min-h-[360px] justify-center">
              
              {/* 5 Nodes Arc List */}
              <div className="relative flex flex-col space-y-4 sm:space-y-5 w-full items-end z-20">
                
                {/* SVG Curve Background */}
                <svg
                  className="absolute right-4 top-2 bottom-2 w-28 h-full pointer-events-none hidden sm:block opacity-50"
                  viewBox="0 0 100 360"
                  fill="none"
                >
                  <path
                    d="M 60,10 Q 95,180 60,350"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                  <path
                    d="M 60,350 C 40,390 10,410 0,440"
                    stroke="#34D399"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                    className="animate-pulse"
                  />
                </svg>

                {currentArcNodes.map((node) => {
                  const Icon = node.icon;
                  const isHovered = hoveredNodeId === node.id;
                  const isSlideAssociated =
                    stage.associatedNodeId === node.id ||
                    (activeStage === 0 && node.id === "environment") ||
                    (activeStage === 1 && node.id === "contaminant") ||
                    (activeStage === 2 && node.id === "response") ||
                    (activeStage === 3 && node.id === "health");
                  const isHighlighted = isHovered || isSlideAssociated;

                  return (
                    <div
                      key={node.id}
                      onMouseEnter={() => setHoveredNodeId(node.id)}
                      onMouseLeave={() => setHoveredNodeId(null)}
                      onClick={() => setHoveredNodeId((prev) => (prev === node.id ? null : node.id))}
                      className="group relative flex items-center justify-end gap-3 cursor-pointer select-none text-right py-1 px-2 rounded-lg"
                    >
                      {/* Node Label */}
                      <span
                        className={`text-xs sm:text-[13px] font-mono-scientific uppercase tracking-widest transition-colors duration-200 ${
                          isHighlighted
                            ? "text-[#34D399] drop-shadow-[0_0_12px_rgba(52,211,153,0.8)] font-bold"
                            : "text-white/80 group-hover:text-white"
                        }`}
                      >
                        {node.label}
                      </span>

                      {/* Node Icon Circle */}
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
                          isHighlighted
                            ? "border-[#34D399] bg-[#10B981]/35 text-[#34D399] shadow-[0_0_20px_rgba(52,211,153,0.6)] scale-105"
                            : "border-white/30 bg-black/30 backdrop-blur-md text-white/90 group-hover:border-white group-hover:bg-white/20"
                        }`}
                      >
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hover Details Panel */}
              <div
                className={`absolute top-full right-0 mt-3 w-full max-w-[320px] p-4 rounded-2xl bg-[#04150C]/95 backdrop-blur-xl border border-[#10B981]/60 shadow-2xl text-left z-30 transition-all duration-200 pointer-events-none ${
                  hoveredNodeId
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 translate-y-2 invisible"
                }`}
              >
                {(() => {
                  const activeNode = currentArcNodes.find((n) => n.id === hoveredNodeId) || currentArcNodes[0];
                  const ActiveIcon = activeNode.icon;
                  const activeIdx = currentArcNodes.findIndex((n) => n.id === hoveredNodeId);

                  return (
                    <>
                      <div className="flex items-center gap-2.5 pb-2 mb-2 border-b border-white/15">
                        <div className="w-7 h-7 rounded-lg bg-[#10B981]/20 border border-[#10B981]/50 flex items-center justify-center text-[#34D399] shadow-sm flex-shrink-0">
                          <ActiveIcon className="w-3.5 h-3.5 stroke-[2.2]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                            <span className="text-[10px] font-mono-scientific uppercase tracking-widest text-[#34D399] font-bold">
                              {activeNode.stageNumber || `Stage 0${activeIdx >= 0 ? activeIdx + 1 : 1} of 05`}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white font-mono-scientific tracking-wider mt-0.5">
                            {activeNode.label}
                          </h4>
                        </div>
                      </div>

                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {activeNode.desc}
                      </p>
                    </>
                  );
                })()}
              </div>

            </div>
          </div>

        </div>
      </div>

      {/* Bottom Ticker & Workflow Stage Bar (Interactive Slide Selector & Auto-Progress) */}
      <div className="relative z-20 w-full border-t border-white/15 bg-gradient-to-t from-black/85 via-black/50 to-transparent backdrop-blur-[4px] mt-8 sm:mt-12 py-4 sm:py-6 lg:py-8">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          
          {/* Left: Dynamic Progress Track */}
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            <div className="flex items-center gap-2.5 text-xs text-white/80 font-mono-scientific font-semibold">
              <span className="text-[10px] font-bold text-[#34D399] tracking-wider uppercase">STAGE</span>
              <span className="font-extrabold text-white text-sm">0{activeStage + 1}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/60">
                {currentStages.length < 10 ? `0${currentStages.length}` : currentStages.length}
              </span>
            </div>
            
            {/* Horizontal Line Progress Indicator */}
            <div className="flex-1 md:w-28 h-[3px] bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#10B981] transition-all duration-100 ease-linear shadow-[0_0_8px_#10B981]"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Mobile-only stage navigation quick pills */}
            <div className="flex md:hidden items-center gap-1.5">
              {currentStages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => selectStage(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    idx === activeStage ? "bg-[#34D399] scale-125" : "bg-white/30"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Center: Interactive Workflow Slides (Desktop/Tablet Grid) */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 w-full max-w-4xl">
            {currentStages.map((item, idx) => {
              const isActive = idx === activeStage;
              return (
                <button
                  key={item.id || `stage-${idx}`}
                  onClick={() => selectStage(idx)}
                  className={`text-left group transition-all duration-300 cursor-pointer p-2 rounded-xl border ${
                    isActive
                      ? "bg-white/10 border-[#10B981]/60 shadow-lg opacity-100"
                      : "border-transparent opacity-60 hover:opacity-100 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                    )}
                    <span
                      className={`text-xs font-bold tracking-wide truncate ${
                        isActive ? "text-[#34D399]" : "text-white/90 group-hover:text-white"
                      }`}
                    >
                      {item.step} {item.name}
                    </span>
                  </div>
                  <p className="text-[10px] font-medium text-white/70 group-hover:text-white/90 truncate">
                    {item.flow}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Far Right: SCROLL Indicator */}
          <button
            onClick={scrollToNext}
            aria-label="Scroll down to page content"
            className="hidden md:flex flex-shrink-0 items-center gap-2 group text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <span className="text-[11px] font-bold tracking-wider uppercase font-mono-scientific">
              SCROLL
            </span>
            <div className="w-6 h-6 rounded-full border border-white/30 flex items-center justify-center group-hover:border-[#34D399] transition-colors">
              <ChevronDown className="w-3.5 h-3.5 stroke-[2.5] text-[#34D399] animate-bounce" />
            </div>
          </button>

        </div>
      </div>
    </section>
  );
}
