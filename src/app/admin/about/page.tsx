"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  getStoredLandingData,
  saveLandingData,
  resetLandingData,
  DEFAULT_LANDING_DATA,
  LandingContentData,
  deepMerge,
  sanitizeLandingData
} from "@/lib/landing-store";
import { idbGet } from "@/lib/storage/idb-storage";
import { safeCompressImage } from "@/lib/image-compression";
import {
  ShieldCheck,
  Save,
  RotateCcw,
  ExternalLink,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  Building2,
  Eye,
  ArrowRight,
  Upload,
  Layers,
  FileImage,
  RefreshCw,
  FolderOpen
} from "lucide-react";

export default function AdminAboutPage() {
  const [data, setData] = useState<LandingContentData>(DEFAULT_LANDING_DATA);
  const [activeTab, setActiveTab] = useState<"hero" | "whoWeAre" | "milestones" | "gallery" | "cta">("hero");
  const [savedToast, setSavedToast] = useState(false);

  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const whoWeAreFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const initial = getStoredLandingData();
    if (initial) setData(initial);

    idbGet<LandingContentData>("ecotox_landing_content_v2")
      .then((idbData) => {
        if (idbData) {
          setData(sanitizeLandingData(deepMerge(DEFAULT_LANDING_DATA, idbData)));
        }
      })
      .catch(() => {});

    const handleUpdate = () => {
      const updated = getStoredLandingData();
      if (updated) setData(updated);
    };

    window.addEventListener("landing-content-updated", handleUpdate);
    return () => window.removeEventListener("landing-content-updated", handleUpdate);
  }, []);

  const about = data.aboutPage || DEFAULT_LANDING_DATA.aboutPage!;

  const handleFileUpload = async (file: File, callback: (dataUrl: string) => void) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      alert("Please select an image file under 15MB.");
      return;
    }
    try {
      const compressed = await safeCompressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.84,
      });
      callback(compressed);
    } catch (err) {
      console.error("Failed to compress image:", err);
      alert("Failed to process image file.");
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    saveLandingData(data);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  const handleReset = () => {
    if (confirm("Reset About Page content back to initial default values?")) {
      resetLandingData();
      setData(DEFAULT_LANDING_DATA);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 3000);
    }
  };

  const updateAboutHero = (fields: Partial<typeof about.hero>) => {
    setData((prev) => {
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          hero: {
            ...(prev.aboutPage?.hero || DEFAULT_LANDING_DATA.aboutPage!.hero),
            ...fields,
          },
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  const updateWhoWeAre = (fields: Partial<typeof about.whoWeAre>) => {
    setData((prev) => {
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          whoWeAre: {
            ...(prev.aboutPage?.whoWeAre || DEFAULT_LANDING_DATA.aboutPage!.whoWeAre),
            ...fields,
          },
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  const updateCTA = (fields: Partial<typeof about.cta>) => {
    setData((prev) => {
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          cta: {
            ...(prev.aboutPage?.cta || DEFAULT_LANDING_DATA.aboutPage!.cta),
            ...fields,
          },
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  const handleAddMilestone = () => {
    const newM = {
      year: "2027",
      title: "New Research Initiative",
      badge: "Upcoming",
      desc: "Expanding experimental capabilities into advanced ecotoxicological modeling.",
    };
    setData((prev) => {
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          milestones: [...(prev.aboutPage?.milestones || DEFAULT_LANDING_DATA.aboutPage!.milestones), newM],
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  const handleRemoveMilestone = (index: number) => {
    setData((prev) => {
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          milestones: (prev.aboutPage?.milestones || DEFAULT_LANDING_DATA.aboutPage!.milestones).filter((_, i) => i !== index),
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  const handleUpdateMilestone = (index: number, fields: any) => {
    setData((prev) => {
      const list = [...(prev.aboutPage?.milestones || DEFAULT_LANDING_DATA.aboutPage!.milestones)];
      list[index] = { ...list[index], ...fields };
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          milestones: list,
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  const handleAddGalleryImage = () => {
    const newImg = {
      title: "New Laboratory Facility",
      category: "Laboratory Analysis",
      image: "/images/gallery/analytical-instrumentation.jpg",
    };
    setData((prev) => {
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          galleryImages: [...(prev.aboutPage?.galleryImages || DEFAULT_LANDING_DATA.aboutPage!.galleryImages), newImg],
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  const handleRemoveGalleryImage = (index: number) => {
    setData((prev) => {
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          galleryImages: (prev.aboutPage?.galleryImages || DEFAULT_LANDING_DATA.aboutPage!.galleryImages).filter((_, i) => i !== index),
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  const handleUpdateGalleryImage = (index: number, fields: any) => {
    setData((prev) => {
      const list = [...(prev.aboutPage?.galleryImages || DEFAULT_LANDING_DATA.aboutPage!.galleryImages)];
      list[index] = { ...list[index], ...fields };
      const updated = {
        ...prev,
        aboutPage: {
          ...(prev.aboutPage || DEFAULT_LANDING_DATA.aboutPage!),
          galleryImages: list,
        },
      };
      saveLandingData(updated);
      return updated;
    });
  };

  return (
    <div className="w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 font-sans">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-emerald-600 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-white" />
          <span className="text-sm font-bold">About Page content saved successfully!</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Content Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            About Page Manager
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Edit full-canvas cover, upload background images, manage Who We Are narrative, milestone timeline, lab visual archive, and CTAs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/about"
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>

          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Full Width) */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 w-full">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
            activeTab === "hero"
              ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          1. Hero &amp; Canvas Cover
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("whoWeAre")}
          className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
            activeTab === "whoWeAre"
              ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          2. Who We Are Story
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("milestones")}
          className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
            activeTab === "milestones"
              ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          3. Journey Milestones ({about.milestones?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
            activeTab === "gallery"
              ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          4. Lab Images Archive ({about.galleryImages?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("cta")}
          className={`flex-1 min-w-[180px] px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer text-center ${
            activeTab === "cta"
              ? "bg-white dark:bg-emerald-600 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          5. Call to Action (CTA)
        </button>
      </div>

      {/* TAB 1: HERO & CANVAS COVER */}
      {activeTab === "hero" && (
        <div className="space-y-6 w-full">
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm w-full">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>Hero Canvas Cover &amp; Image Upload</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Badge Pill Text
                  </label>
                  <input
                    type="text"
                    value={about.hero.badge}
                    onChange={(e) => updateAboutHero({ badge: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                    placeholder="ABOUT THE LAB"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Main Headline
                  </label>
                  <input
                    type="text"
                    value={about.hero.headline}
                    onChange={(e) => updateAboutHero({ headline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                    placeholder="Science with purpose."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Supporting Subtitle Context
                  </label>
                  <input
                    type="text"
                    value={about.hero.supportingText}
                    onChange={(e) => updateAboutHero({ supportingText: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:border-emerald-500"
                    placeholder="Department of Environmental Sciences • Jahangirnagar University, Savar, Dhaka"
                  />
                </div>

                {/* IMAGE UPLOAD & URL CONTROLS */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Full-Canvas Background Lab Image</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Supports Direct Upload &amp; URL</span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={about.hero.backgroundImageUrl}
                      onChange={(e) => updateAboutHero({ backgroundImageUrl: e.target.value })}
                      className="flex-grow px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono focus:outline-none focus:border-emerald-500"
                      placeholder="Paste Image URL or click Upload..."
                    />

                    {/* Direct Upload Button */}
                    <input
                      type="file"
                      ref={heroFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (dataUrl) => updateAboutHero({ backgroundImageUrl: dataUrl }));
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => heroFileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer flex-shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Live Visual Canvas Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live Hero Canvas Preview</span>
                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Choose from PC</span>
                  </button>
                </div>

                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center p-6 text-center group">
                  <img
                    src={about.hero.backgroundImageUrl}
                    alt="Hero Preview"
                    className="absolute inset-0 w-full h-full object-cover filter brightness-[0.42] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

                  <div className="relative z-10 space-y-3 text-white max-w-md">
                    <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10.5px] font-bold text-emerald-300">
                      {about.hero.badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black font-[family-name:var(--font-manrope)] leading-tight">
                      {about.hero.headline}
                    </h3>
                    <p className="text-xs text-slate-300 line-clamp-2">
                      {about.hero.supportingText}
                    </p>
                  </div>

                  {/* Change Image Button Overlay */}
                  <button
                    type="button"
                    onClick={() => heroFileInputRef.current?.click()}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-emerald-600 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Change Image</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Quick Metrics */}
            <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Key Metrics Bar Tags (3 Items)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {about.hero.metrics.map((m, mIdx) => (
                  <input
                    key={mIdx}
                    type="text"
                    value={m.label}
                    onChange={(e) => {
                      const updated = [...about.hero.metrics];
                      updated[mIdx] = { label: e.target.value };
                      updateAboutHero({ metrics: updated });
                    }}
                    className="px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-500"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WHO WE ARE STORY */}
      {activeTab === "whoWeAre" && (
        <div className="space-y-6 w-full">
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-8 shadow-sm w-full">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-500" />
              <span>Who We Are Narrative &amp; Facility Image</span>
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Form */}
              <div className="lg:col-span-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Badge
                    </label>
                    <input
                      type="text"
                      value={about.whoWeAre.badge}
                      onChange={(e) => updateWhoWeAre({ badge: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-semibold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Headline Prefix
                    </label>
                    <input
                      type="text"
                      value={about.whoWeAre.headlinePrefix}
                      onChange={(e) => updateWhoWeAre({ headlinePrefix: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Headline Green Highlight
                  </label>
                  <input
                    type="text"
                    value={about.whoWeAre.headlineHighlight}
                    onChange={(e) => updateWhoWeAre({ headlineHighlight: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Paragraph 1 Narrative
                  </label>
                  <textarea
                    rows={3}
                    value={about.whoWeAre.paragraph1}
                    onChange={(e) => updateWhoWeAre({ paragraph1: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Paragraph 2 Narrative
                  </label>
                  <textarea
                    rows={3}
                    value={about.whoWeAre.paragraph2}
                    onChange={(e) => updateWhoWeAre({ paragraph2: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              {/* Right Side: Image Upload & Live Card */}
              <div className="lg:col-span-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                    <span>Department / Facility Photo</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">Upload or Paste URL</span>
                  </label>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={about.whoWeAre.imageSrc}
                      onChange={(e) => updateWhoWeAre({ imageSrc: e.target.value })}
                      className="flex-grow px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-mono"
                      placeholder="Image URL or upload..."
                    />

                    <input
                      type="file"
                      ref={whoWeAreFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (dataUrl) => updateWhoWeAre({ imageSrc: dataUrl }));
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => whoWeAreFileInputRef.current?.click()}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow-sm transition active:scale-95 cursor-pointer flex-shrink-0"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload Image</span>
                    </button>
                  </div>
                </div>

                {/* Live Card Preview */}
                <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
                  <img
                    src={about.whoWeAre.imageSrc}
                    alt="Who we are preview"
                    className="w-full h-full object-cover filter brightness-[0.9]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-3 left-4 right-4 text-white z-10 space-y-0.5">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-600 font-bold uppercase">
                      {about.whoWeAre.imageCaptionBadge}
                    </span>
                    <div className="text-xs sm:text-sm font-bold mt-1">{about.whoWeAre.imageCaptionTitle}</div>
                    <div className="text-[11px] text-slate-300">{about.whoWeAre.imageCaptionSubtitle}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => whoWeAreFileInputRef.current?.click()}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 hover:bg-emerald-600 text-white text-[11px] font-bold backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload New</span>
                  </button>
                </div>

                {/* Caption Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Caption Title
                    </label>
                    <input
                      type="text"
                      value={about.whoWeAre.imageCaptionTitle}
                      onChange={(e) => updateWhoWeAre({ imageCaptionTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Caption Subtitle
                    </label>
                    <input
                      type="text"
                      value={about.whoWeAre.imageCaptionSubtitle}
                      onChange={(e) => updateWhoWeAre({ imageCaptionSubtitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: JOURNEY MILESTONES */}
      {activeTab === "milestones" && (
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500" />
              <span>Milestone Trajectory Timeline</span>
            </h2>
            <button
              type="button"
              onClick={handleAddMilestone}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Milestone Year</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {about.milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-black flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <input
                      type="text"
                      value={m.year}
                      onChange={(e) => handleUpdateMilestone(idx, { year: e.target.value })}
                      className="w-24 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-black"
                      placeholder="Year"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveMilestone(idx)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                    title="Delete Milestone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <input
                    type="text"
                    value={m.badge}
                    onChange={(e) => handleUpdateMilestone(idx, { badge: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                    placeholder="Badge Tag"
                  />
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => handleUpdateMilestone(idx, { title: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    placeholder="Milestone Title"
                  />
                  <textarea
                    rows={2}
                    value={m.desc}
                    onChange={(e) => handleUpdateMilestone(idx, { desc: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs"
                    placeholder="Description of milestone"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: LAB VISUAL ARCHIVE */}
      {activeTab === "gallery" && (
        <div className="space-y-6 w-full">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-500" />
              <span>Laboratory Visual Archive &amp; Image Uploads</span>
            </h2>
            <button
              type="button"
              onClick={handleAddGalleryImage}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold shadow cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Facility Photo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {about.galleryImages.map((img, idx) => {
              const fileInputRef = React.createRef<HTMLInputElement>();
              return (
                <div
                  key={idx}
                  className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm relative group"
                >
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <img
                      src={img.image}
                      alt={img.title}
                      className="w-full h-full object-cover filter brightness-[0.9]"
                    />
                    
                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveGalleryImage(idx)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:text-red-400 backdrop-blur-md transition cursor-pointer"
                      title="Delete Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Upload button overlay */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file, (dataUrl) => handleUpdateGalleryImage(idx, { image: dataUrl }));
                        }
                      }}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-2 right-2 px-3 py-1 rounded-lg bg-black/75 hover:bg-emerald-600 text-white text-[10.5px] font-bold backdrop-blur-md border border-white/20 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>Upload</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={img.category}
                      onChange={(e) => handleUpdateGalleryImage(idx, { category: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400"
                      placeholder="Facility Category"
                    />
                    <input
                      type="text"
                      value={img.title}
                      onChange={(e) => handleUpdateGalleryImage(idx, { title: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-bold"
                      placeholder="Photo Title"
                    />
                    <input
                      type="text"
                      value={img.image}
                      onChange={(e) => handleUpdateGalleryImage(idx, { image: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-[11px] font-mono"
                      placeholder="Image URL"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: CALL TO ACTION */}
      {activeTab === "cta" && (
        <div className="space-y-6 w-full">
          <div className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm w-full">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-500" />
              <span>Call to Action Banner &amp; Engagement Buttons</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Badge Pill
                  </label>
                  <input
                    type="text"
                    value={about.cta.badge}
                    onChange={(e) => updateCTA({ badge: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={about.cta.headline}
                    onChange={(e) => updateCTA({ headline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-sm font-semibold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Description Text
                  </label>
                  <textarea
                    rows={3}
                    value={about.cta.description}
                    onChange={(e) => updateCTA({ description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Primary Button Label
                    </label>
                    <input
                      type="text"
                      value={about.cta.primaryBtnText}
                      onChange={(e) => updateCTA({ primaryBtnText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Primary Button Link
                    </label>
                    <input
                      type="text"
                      value={about.cta.primaryBtnHref}
                      onChange={(e) => updateCTA({ primaryBtnHref: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Secondary Button Label
                    </label>
                    <input
                      type="text"
                      value={about.cta.secondaryBtnText}
                      onChange={(e) => updateCTA({ secondaryBtnText: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                      Secondary Button Link
                    </label>
                    <input
                      type="text"
                      value={about.cta.secondaryBtnHref}
                      onChange={(e) => updateCTA({ secondaryBtnHref: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
