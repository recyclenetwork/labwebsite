"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { useLandingData } from "@/lib/landing-store";
import { useGalleryItems } from "@/lib/gallery-store";
import {
  FlaskConical,
  Compass,
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  Database,
  Dna,
  ShieldCheck,
  Globe,
  FolderGit2,
  FileText,
  ChevronDown,
  Microscope,
  CheckCircle2,
  ExternalLink,
  MapPin,
  Layers,
  Atom,
  Network
} from "lucide-react";

export default function AboutPage() {
  const { data: landingData } = useLandingData();
  const about = landingData?.aboutPage;
  const { items: galleryItems } = useGalleryItems();

  const timelineYears = about?.milestones && about.milestones.length > 0 ? about.milestones : [
    {
      year: "2019",
      title: "Microplastics Cleanroom Inception",
      badge: "Spectroscopy Hub",
      desc: "Established micro-FTIR chemical imaging facility for microplastic debris mapping in deltaic food webs.",
    },
    {
      year: "2021",
      title: "Molecular Ecotoxicology Expansion",
      badge: "Cellular Bioassays",
      desc: "Integrated mammalian in-vitro assays and flow cytometry to evaluate cellular oxidative stress.",
    },
    {
      year: "2023",
      title: "Delta-Scale GIS & Remote Sensing",
      badge: "Spatial Modeling",
      desc: "Deployed Sentinel-2 multi-spectral satellite pipelines and watershed hydrodynamic contaminant flow tracking.",
    },
    {
      year: "2025",
      title: "Autonomous Telemetry & Circular Systems",
      badge: "In-Situ Sensing",
      desc: "Developed real-time autonomous water quality monitoring sondes and catalytic nutrient recovery frameworks.",
    },
    {
      year: "2026",
      title: "Global Consortia & Policy Leadership",
      badge: "Active Milestone",
      desc: "Over 140+ peer-reviewed papers and 5,000+ citations, spearheading regional environmental health resilience.",
    },
  ];

  const defaultLabImages = [
    {
      title: "Ultra-Trace Spectrometry & Chromatography",
      category: "Laboratory Analysis",
      image: "/images/gallery/analytical-instrumentation.jpg",
    },
    {
      title: "Microscopic Imaging & Micro-FTIR",
      category: "Microscopy & Imaging",
      image: "/images/gallery/microscopy-imaging.jpg",
    },
    {
      title: "Molecular Bioassay & Toxicogenomics",
      category: "Biological Exposure",
      image: "/images/slide-3-analysis.jpg",
    },
    {
      title: "Delta Aquatic Sampling & Field Coring",
      category: "Field Expedition",
      image: "/images/gallery/field-sampling.jpg",
    },
    {
      title: "Environmental GIS & Hydrodynamics",
      category: "Campus & Field Mapping",
      image: "/images/jahangirnagar-campus-map.jpg",
    },
    {
      title: "Ecosystem Health & Bioremediation",
      category: "Resource Recovery",
      image: "/images/slide-4-impact.jpg",
    },
  ];

  // Prioritize user-configured gallery images (if not old unsplash stock), or dynamic live gallery items from gallery store, or authentic default lab images
  const labImages =
    about?.galleryImages &&
    about.galleryImages.length > 0 &&
    !about.galleryImages.some((img) => img.image.includes("images.unsplash.com"))
      ? about.galleryImages
      : galleryItems && galleryItems.length > 0
      ? galleryItems.map((item) => ({
          title: item.title,
          category: item.category,
          image: item.image_url,
        }))
      : defaultLabImages;

  const heroBackgroundUrl =
    about?.hero?.backgroundImageUrl && !about.hero.backgroundImageUrl.includes("images.unsplash.com")
      ? about.hero.backgroundImageUrl
      : "/images/hero-clean-bg.jpg";

  const whoWeAreImageSrc =
    about?.whoWeAre?.imageSrc && !about.whoWeAre.imageSrc.includes("images.unsplash.com")
      ? about.whoWeAre.imageSrc
      : "/images/slide-2-lab.jpg";

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#090D16] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-[family-name:var(--font-inter)] selection:bg-[#10B981] selection:text-black">
      <Navbar />

      <main className="w-full">
        {/* ========================================================================= */}
        {/* 1. FULL CANVAS HERO: BACKGROUND LAB IMAGE WITH AMBIENT GLOW & MINIMAL TEXT */}
        {/* ========================================================================= */}
        <section className="relative w-full min-h-[85vh] lg:min-h-[92vh] flex items-center justify-center overflow-hidden bg-slate-950">
          {/* Full Canvas Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat filter brightness-[0.45] scale-105"
            style={{
              backgroundImage: `url('${heroBackgroundUrl}')`,
            }}
          />

          {/* Ambient Glows & Gradient Mask */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/60 to-black/80 pointer-events-none" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10B981]/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />

          {/* Minimalist Centered Hero Content */}
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-20">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-black tracking-widest uppercase backdrop-blur-md shadow-lg">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              <span>{about?.hero.badge || "ABOUT THE LAB"}</span>
            </div>

            {/* Main Bold Minimal Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl 2xl:text-8xl font-black text-white tracking-tight leading-[1.05] font-[family-name:var(--font-manrope)]">
              {about?.hero.headline || "Science with purpose."}
            </h1>

            {/* Supporting Minimal Context */}
            <p className="text-sm sm:text-base lg:text-lg text-emerald-100/90 font-medium max-w-2xl mx-auto tracking-wide">
              {about?.hero.supportingText || "Department of Environmental Sciences • Jahangirnagar University, Savar, Dhaka"}
            </p>

            {/* Quick Metrics Strip */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-white/90 text-xs font-semibold uppercase tracking-wider">
              {(about?.hero.metrics && about.hero.metrics.length > 0
                ? about.hero.metrics
                : [
                    { label: "15+ Years Active Research" },
                    { label: "140+ Peer-Reviewed Papers" },
                    { label: "5,000+ Citations" },
                  ]
              ).map((m, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Down Arrow Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-emerald-400/80 animate-bounce pointer-events-none">
            <ChevronDown className="w-6 h-6" />
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. WHO WE ARE */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-white dark:bg-[#0B1120] relative overflow-hidden border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
            
            <div className="max-w-2xl space-y-2 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#10B981]">
                <span>{about?.whoWeAre.badge || "WHO WE ARE"}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight leading-tight">
                {about?.whoWeAre.headlinePrefix || "Understanding the environment."} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#14532D] via-[#059669] to-[#10B981] dark:from-[#34D399] dark:to-emerald-400">
                  {about?.whoWeAre.headlineHighlight || "Protecting what depends on it."}
                </span>
              </h2>
            </div>

            {/* Split Grid: Narrative + Lab Photo */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
              
              {/* Left Column: Narrative */}
              <div className="lg:col-span-6 space-y-6 text-left">
                <p className="text-base sm:text-lg text-slate-700 dark:text-slate-300 font-normal leading-relaxed">
                  {about?.whoWeAre.paragraph1 || "Based within the biodiverse wetland ecosystem of Jahangirnagar University in Savar, Dhaka, our laboratory is an interdisciplinary research community investigating the unseen chemistry of environmental pollution."}
                </p>

                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-normal leading-relaxed">
                  {about?.whoWeAre.paragraph2 || "We track persistent contaminants, microplastics, endocrine disruptors, and trace metals across river sediment cores, agricultural soils, aquatic food webs, and human cell lines to generate actionable scientific evidence."}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#14532D] dark:text-[#34D399]">
                      {about?.whoWeAre.rigorTitle || "Empirical Rigor"}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {about?.whoWeAre.rigorText || "ISO/EPA benchmarked analytical methods with certified standards and ultra-trace limits."}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#14532D] dark:text-[#34D399]">
                      {about?.whoWeAre.policyTitle || "Policy Translation"}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {about?.whoWeAre.policyText || "Translating lab discoveries into environmental guidelines and public health protection."}
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href="/team"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#14532D] hover:bg-[#064E3B] dark:bg-[#10B981] dark:hover:bg-emerald-400 text-white dark:text-slate-950 text-xs font-extrabold uppercase tracking-wider transition shadow-md active:scale-95"
                  >
                    <span>Meet Our Research Team</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Lab Image Card */}
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[16/11] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 group">
                  <img
                    src={whoWeAreImageSrc}
                    alt={about?.whoWeAre.imageCaptionTitle || "Laboratory Researchers Conducting Environmental Analysis"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.95]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute bottom-6 left-6 right-6 text-white space-y-1 z-10">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-[10px] font-bold uppercase tracking-widest text-white shadow">
                      {about?.whoWeAre.imageCaptionBadge || "DEPARTMENT OF ENVIRONMENTAL SCIENCES"}
                    </span>
                    <h3 className="text-lg font-bold font-[family-name:var(--font-manrope)]">
                      {about?.whoWeAre.imageCaptionTitle || "Faculty of Mathematical & Physical Sciences"}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {about?.whoWeAre.imageCaptionSubtitle || "Jahangirnagar University Campus, Savar, Dhaka-1342, Bangladesh."}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. ONE LAB. MANY CONNECTIONS. (EXACT ARCHITECTURAL TREE DIAGRAM) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 space-y-14">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#10B981]">
                <span>ECOSYSTEM ARCHITECTURE</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
                One Lab. Many Connections.
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                The central hub uniting researchers, research areas, funded projects, publications, and global collaborators.
              </p>
            </div>

            {/* ARCHITECTURAL TREE GRAPH CONTAINER */}
            <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center space-y-8">
                
                {/* TOP NODE: RESEARCHERS */}
                <div className="flex flex-col items-center">
                  <Link
                    href="/team"
                    className="px-6 py-3 rounded-2xl bg-white dark:bg-[#0B1120] border-2 border-emerald-500/50 hover:border-emerald-500 hover:shadow-lg transition-all flex items-center gap-3 text-slate-900 dark:text-white group"
                  >
                    <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">PEOPLE</div>
                      <div className="text-sm font-black tracking-wider">RESEARCHERS</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform ml-2" />
                  </Link>

                  {/* Vertical Connecting Line */}
                  <div className="w-0.5 h-8 bg-emerald-500/40 my-1" />
                </div>

                {/* MIDDLE ROW: RESEARCH ─────── LAB ─────── PROJECTS */}
                <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2">
                  
                  {/* LEFT: RESEARCH */}
                  <Link
                    href="/research"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-[#0B1120] border-2 border-emerald-500/50 hover:border-emerald-500 hover:shadow-lg transition-all flex items-center gap-3 text-slate-900 dark:text-white group flex-1 max-w-[240px]"
                  >
                    <FlaskConical className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">6 DOMAINS</div>
                      <div className="text-sm font-black tracking-wider">RESEARCH</div>
                    </div>
                  </Link>

                  {/* Horizontal Connector Left */}
                  <div className="hidden sm:block flex-grow h-0.5 bg-emerald-500/40 mx-2" />

                  {/* CENTER: LAB CORE NODE */}
                  <div className="px-7 py-4 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#043324] to-[#011B10] text-white border-2 border-emerald-400 shadow-2xl flex flex-col items-center justify-center text-center space-y-1 ring-4 ring-emerald-500/20">
                    <Atom className="w-6 h-6 text-emerald-300 animate-spin" style={{ animationDuration: "20s" }} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">CORE HUB</span>
                    <span className="text-base sm:text-lg font-black tracking-wider">LAB</span>
                  </div>

                  {/* Horizontal Connector Right */}
                  <div className="hidden sm:block flex-grow h-0.5 bg-emerald-500/40 mx-2" />

                  {/* RIGHT: PROJECTS */}
                  <Link
                    href="/projects"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-[#0B1120] border-2 border-emerald-500/50 hover:border-emerald-500 hover:shadow-lg transition-all flex items-center gap-3 text-slate-900 dark:text-white group flex-1 max-w-[240px]"
                  >
                    <FolderGit2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">FUNDED</div>
                      <div className="text-sm font-black tracking-wider">PROJECTS</div>
                    </div>
                  </Link>

                </div>

                {/* BOTTOM STACK: PUBLICATIONS & COLLABORATORS */}
                <div className="flex flex-col items-center space-y-2">
                  {/* Vertical Connector Down */}
                  <div className="w-0.5 h-8 bg-emerald-500/40" />

                  {/* NODE: PUBLICATIONS */}
                  <Link
                    href="/publications"
                    className="px-6 py-3 rounded-2xl bg-white dark:bg-[#0B1120] border-2 border-emerald-500/50 hover:border-emerald-500 hover:shadow-lg transition-all flex items-center gap-3 text-slate-900 dark:text-white group w-64 justify-center"
                  >
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">140+ ARTICLES</div>
                      <div className="text-sm font-black tracking-wider">PUBLICATIONS</div>
                    </div>
                  </Link>

                  {/* Vertical Connector Down */}
                  <div className="w-0.5 h-8 bg-emerald-500/40" />

                  {/* NODE: COLLABORATORS */}
                  <Link
                    href="/contact"
                    className="px-6 py-3 rounded-2xl bg-white dark:bg-[#0B1120] border-2 border-emerald-500/50 hover:border-emerald-500 hover:shadow-lg transition-all flex items-center gap-3 text-slate-900 dark:text-white group w-64 justify-center"
                  >
                    <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div className="text-left">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">GLOBAL NETWORK</div>
                      <div className="text-sm font-black tracking-wider">COLLABORATORS</div>
                    </div>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. OUR JOURNEY (MILESTONES TIMELINE) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-[#F8FAF9] dark:bg-[#090D16] border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 space-y-14">
            
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#10B981]">
                <span>MILESTONES</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
                Our Journey
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Key scientific breakthroughs and institutional milestones from 2019 to 2026.
              </p>
            </div>

            {/* Horizontal Timeline Track */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 sm:gap-5">
              {timelineYears.map((t, idx) => (
                <div
                  key={idx}
                  className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3 text-left shadow-sm hover:border-emerald-500/50 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl sm:text-3xl font-black font-[family-name:var(--font-manrope)] text-[#14532D] dark:text-[#34D399]">
                      {t.year}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
                  </div>

                  <div className="text-[10.5px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                    {t.badge}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {t.title}
                  </h4>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 6. LAB IMAGES GALLERY (SOME IMAGES OF THE LAB) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-28 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10 space-y-12">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="space-y-2 text-left">
                <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#10B981]">
                  <span>VISUAL ARCHIVE</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
                  Inside Our Facilities &amp; Expeditions
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  A glimpse into our cleanrooms, analytical instrumentation, and delta fieldwork.
                </p>
              </div>

              <Link
                href="/admin/media"
                className="hidden sm:inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#14532D] dark:text-[#34D399] hover:underline"
              >
                <span>Media Archive</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Gallery Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {labImages.map((img, idx) => (
                <div
                  key={idx}
                  className="group relative aspect-[16/11] rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all"
                >
                  <img
                    src={img.image}
                    alt={img.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.92]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  <div className="absolute bottom-4 left-4 right-4 text-white z-10 space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300">
                      {img.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold font-[family-name:var(--font-manrope)] leading-tight">
                      {img.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ========================================================================= */}
        {/* 7. ENGAGE WITH OUR WORK (CTA) */}
        {/* ========================================================================= */}
        <section className="py-20 sm:py-24 bg-gradient-to-br from-[#064E3B] via-[#043324] to-[#011B10] text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 relative z-10 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-emerald-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>{about?.cta.badge || "ENGAGE WITH OUR WORK"}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-[family-name:var(--font-manrope)] tracking-tight text-white leading-tight max-w-3xl mx-auto">
              {about?.cta.headline || "Curious About Environmental Research?"}
            </h2>

            <p className="text-sm sm:text-base text-emerald-50/90 max-w-2xl mx-auto leading-relaxed font-normal">
              {about?.cta.description || "Whether you are an aspiring researcher interested in graduate thesis opportunities, a researcher seeking collaborative projects, or an agency in need of empirical data—our doors are open."}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href={about?.cta.primaryBtnHref || "/team#opportunities"}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white text-[#064E3B] hover:bg-emerald-50 text-xs font-extrabold uppercase tracking-wider transition-all shadow-xl active:scale-95 group"
              >
                <span>{about?.cta.primaryBtnText || "Explore Opportunities"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href={about?.cta.secondaryBtnHref || "/contact"}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold uppercase tracking-wider transition-all backdrop-blur-md active:scale-95"
              >
                <FlaskConical className="w-3.5 h-3.5 text-emerald-300" />
                <span>{about?.cta.secondaryBtnText || "Contact Lab"}</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
