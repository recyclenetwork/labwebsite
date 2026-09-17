"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAdminTheme } from "@/lib/admin-theme";
import {
  LandingContentData,
  DEFAULT_LANDING_DATA,
  getStoredLandingData,
  saveLandingData,
  resetLandingData,
  deepMerge,
  sanitizeLandingData,
} from "@/lib/landing-store";
import { safeCompressImage } from "@/lib/image-compression";
import { pruneOversizedLocalStorage, idbGet } from "@/lib/storage/idb-storage";
import { getTeamMembers } from "@/lib/team/store";
import {
  useGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  GalleryItem,
  getCategoryBadgeColor
} from "@/lib/gallery-store";
import { getLocalPublications } from "@/lib/publications/queries";
import { getLocalProjects } from "@/lib/projects/queries";
import {
  Layers,
  Save,
  CheckCircle2,
  MapPin,
  Sparkles,
  Sliders,
  Eye,
  RotateCcw,
  BookOpen,
  Star,

  FolderGit2,
  Users,
  Newspaper,
  Image as ImageIcon,
  Briefcase,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Globe,
  Award,
  Send,
  Building,
  Radio,
  FileText,
  Timer,
  Play,
  Check,
  Upload,
  Plus,
  Trash2,
  Building2,
  Info,
  RefreshCw,
  Shuffle,
  Orbit,
  LayoutGrid,
} from "lucide-react";

export default function AdminLandingManagerPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";

  const [formData, setFormData] = useState<LandingContentData>(DEFAULT_LANDING_DATA);
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [activeHeroSlideIndex, setActiveHeroSlideIndex] = useState<number>(0);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const { items: galleryItems } = useGalleryItems();
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem>({
    id: "",
    title: "",
    category: "Field Expedition",
    location: "",
    date_text: "2026",
    description: "",
    image_url: "/images/gallery/field-sampling.jpg",
  });

  useEffect(() => {
    pruneOversizedLocalStorage();
    const initial = getStoredLandingData();
    if (initial) setFormData(initial);

    idbGet<LandingContentData>("ecotox_landing_content_v2")
      .then((idbData) => {
        if (idbData) {
          setFormData(sanitizeLandingData(deepMerge(DEFAULT_LANDING_DATA, idbData)));
        }
      })
      .catch(() => {});
  }, []);

  const handleImageUpload = async (file: File, callback: (url: string) => void) => {
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
      alert("Failed to process uploaded image.");
    }
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const success = saveLandingData(formData);
      if (success) {
        setSavedStatus("Homepage content successfully saved and synchronized!");
        setTimeout(() => setSavedStatus(null), 4000);
      } else {
        alert("Could not save homepage content due to browser storage limitations. Please ensure images are appropriately sized.");
      }
    } catch (err) {
      console.error("Error saving landing data:", err);
      alert("An unexpected error occurred while saving.");
    }
  };

  const handleReset = () => {
    if (confirm("Reset landing page content to original laboratory defaults?")) {
      resetLandingData();
      setFormData(DEFAULT_LANDING_DATA);
      setSavedStatus("Reverted to original lab defaults.");
      setTimeout(() => setSavedStatus(null), 4000);
    }
  };

  const cardBg = isLight
    ? "bg-white border-slate-200/90 shadow-xs"
    : "bg-[#0F172A] border-slate-800 shadow-md";
  const inputBg = isLight
    ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500"
    : "bg-[#090D16] border-slate-700 text-white focus:border-emerald-400";
  const labelText = isLight ? "text-slate-700 font-semibold" : "text-slate-200 font-semibold";
  const subText = isLight ? "text-slate-500" : "text-slate-400";
  const titleText = isLight ? "text-slate-900" : "text-white";

  const sections = [
    { id: "hero", name: "1. Hero & Network", icon: Sparkles },
    { id: "metrics", name: "2. Key Stats Strip", icon: Sliders },
    { id: "researchFocus", name: "3. Research Focus", icon: BookOpen },
    { id: "projects", name: "4. Featured Projects", icon: FolderGit2 },
    { id: "partners", name: "5. Partners Ribbon", icon: Globe },
    { id: "publications", name: "6. Publications", icon: FileText },
    { id: "pi", name: "7. PI Spotlight", icon: Award },
    { id: "people", name: "8. Researcher Roster", icon: Users },
    { id: "news", name: "9. News & Insights", icon: Newspaper },
    { id: "opportunities", name: "10. Opportunities CTA", icon: Briefcase },
    { id: "gallery", name: "11. Field Gallery", icon: ImageIcon },
    { id: "contact", name: "12. Campus & Map", icon: MapPin },
    { id: "footer", name: "13. Footer Notice", icon: Building },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-emerald-950/60">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            <h1 className={`text-xl font-bold tracking-tight ${titleText}`}>
              Landing Page Full-Stack Editor
            </h1>
          </div>
          <p className={`text-xs ${subText} mt-1`}>
            Modify headlines, mission abstracts, metric counters, PI credentials, and GPS coordinates for the live website from top to bottom.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
              isLight
                ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                : "border-emerald-950 text-slate-400 hover:bg-emerald-950/40 hover:text-white"
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Live</span>
          </Link>

          <button
            type="button"
            onClick={() => handleSave()}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>
      </div>

      {savedStatus && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2.5 text-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedStatus}</span>
        </div>
      )}

      {/* Top Horizontal Section Navigator - compact, space-saving */}
      <div className={`p-2 rounded-2xl border ${cardBg} overflow-x-auto scrollbar-none shadow-sm`}>
        <div className="flex items-center gap-2 min-w-max p-0.5">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/20 font-bold scale-[1.02]"
                    : isLight
                    ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/60"
                    : "text-slate-400 hover:bg-emerald-950/40 hover:text-white border border-emerald-950/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{sec.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Body - Full Width */}
      <div className="w-full">
        <form onSubmit={handleSave} className="space-y-6">
            {/* 1. HERO SECTION & 4 WORKFLOW SLIDES */}
            {activeTab === "hero" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Global Hero Settings Card */}
                <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      Hero Global Settings &amp; Call-To-Actions
                    </h3>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-semibold">
                      Above The Fold
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Top Eyebrow Tagline</label>
                      <input
                        type="text"
                        value={formData.hero.eyebrow}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, eyebrow: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs ${labelText} mb-1 flex items-center gap-1.5`}>
                        <Timer className="w-3.5 h-3.5 text-emerald-500" />
                        Slide Auto-Advance Interval (Seconds)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="20"
                          value={formData.hero.slideDurationSeconds || 3.8}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              hero: {
                                ...formData.hero,
                                slideDurationSeconds: parseFloat(e.target.value) || 3.8,
                              },
                            })
                          }
                          className={`w-28 px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold outline-none transition-all ${inputBg}`}
                        />
                        <div className="flex items-center gap-1">
                          {[2.5, 3.8, 5.0, 7.0].map((sec) => (
                            <button
                              key={sec}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  hero: { ...formData.hero, slideDurationSeconds: sec },
                                })
                              }
                              className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all cursor-pointer ${
                                (formData.hero.slideDurationSeconds || 3.8) === sec
                                  ? "bg-emerald-500 text-white border-emerald-500"
                                  : isLight
                                  ? "border-slate-200 text-slate-600 hover:bg-slate-100"
                                  : "border-emerald-950 text-slate-400 hover:bg-emerald-950/40"
                              }`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Primary CTA Button Label</label>
                      <input
                        type="text"
                        value={formData.hero.primaryCtaLabel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, primaryCtaLabel: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Primary CTA Link (href)</label>
                      <input
                        type="text"
                        value={formData.hero.primaryCtaHref}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, primaryCtaHref: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Secondary CTA Button Label</label>
                      <input
                        type="text"
                        value={formData.hero.secondaryCtaLabel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, secondaryCtaLabel: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Secondary CTA Link (href)</label>
                      <input
                        type="text"
                        value={formData.hero.secondaryCtaHref}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            hero: { ...formData.hero, secondaryCtaHref: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                      />
                    </div>
                  </div>
                </div>

                {/* 4 Interactive Hero Slides Manager */}
                <div className={`p-6 rounded-2xl border ${cardBg} space-y-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                        <Play className="w-4 h-4 text-emerald-500" />
                        Interactive Workflow Slideshow ({formData.hero.stages?.length || 4} Slides)
                      </h3>
                      <p className={`text-[11px] ${subText} mt-0.5`}>
                        Edit headlines, highlighted glowing words, subtext narratives, workflow flows, and background images for each slide.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-semibold self-start sm:self-auto">
                      Auto-Rotating Stages
                    </span>
                  </div>

                  {/* 4 Slide Pill Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {(formData.hero.stages || DEFAULT_LANDING_DATA.hero.stages).map((s, idx) => {
                      const isActive = activeHeroSlideIndex === idx;
                      return (
                        <button
                          key={s.id || idx}
                          type="button"
                          onClick={() => setActiveHeroSlideIndex(idx)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                            isActive
                              ? "bg-gradient-to-r from-emerald-600 to-teal-600 border-emerald-500 text-white shadow-md shadow-emerald-600/20 font-bold"
                              : isLight
                              ? "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                              : "bg-[#020F07] border-emerald-950/70 text-slate-400 hover:text-white hover:border-emerald-800/60"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-mono font-extrabold uppercase">
                              Slide {s.step}
                            </span>
                            {isActive && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                          </div>
                          <p className="text-xs font-bold truncate">{s.name}</p>
                          <p className={`text-[10px] truncate ${isActive ? "text-emerald-100" : subText}`}>
                            {s.flow}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Slide Form Fields */}
                  {(() => {
                    const currentStages = formData.hero.stages || DEFAULT_LANDING_DATA.hero.stages;
                    const stage = currentStages[activeHeroSlideIndex] || currentStages[0];
                    const idx = activeHeroSlideIndex;

                    const updateField = (field: string, val: string) => {
                      const updated = [...currentStages];
                      updated[idx] = { ...updated[idx], [field]: val };
                      setFormData({
                        ...formData,
                        hero: {
                          ...formData.hero,
                          stages: updated,
                        },
                      });
                    };

                    return (
                      <div className="space-y-5 pt-2 border-t border-slate-100 dark:border-emerald-950/40">
                        {/* Stage Identity */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className={`block text-xs ${labelText} mb-1`}>Step Number</label>
                            <input
                              type="text"
                              value={stage.step}
                              onChange={(e) => updateField("step", e.target.value)}
                              placeholder="01"
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono font-bold outline-none transition-all ${inputBg}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs ${labelText} mb-1`}>Stage Name</label>
                            <input
                              type="text"
                              value={stage.name}
                              onChange={(e) => updateField("name", e.target.value)}
                              placeholder="FIELD"
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold outline-none transition-all ${inputBg}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs ${labelText} mb-1`}>Workflow Flow Tagline</label>
                            <input
                              type="text"
                              value={stage.flow}
                              onChange={(e) => updateField("flow", e.target.value)}
                              placeholder="ENVIRONMENT → EXPOSURE"
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                            />
                          </div>
                        </div>

                        {/* Eyebrow */}
                        <div>
                          <label className={`block text-xs ${labelText} mb-1`}>Slide Eyebrow Badge Text</label>
                          <input
                            type="text"
                            value={stage.eyebrow}
                            onChange={(e) => updateField("eyebrow", e.target.value)}
                            placeholder="ENVIRONMENT • HEALTH • ECOTOXICOLOGY"
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none transition-all ${inputBg}`}
                          />
                        </div>

                        {/* Headline Structure: Intro + Prefix + Glowing Highlight Word */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className={`block text-xs ${labelText} mb-1`}>
                              Headline Intro (Top Line)
                            </label>
                            <input
                              type="text"
                              value={stage.headline}
                              onChange={(e) => updateField("headline", e.target.value)}
                              placeholder="Understanding"
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold outline-none transition-all ${inputBg}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs ${labelText} mb-1`}>
                              Highlight Prefix (White)
                            </label>
                            <input
                              type="text"
                              value={stage.highlightPrefix}
                              onChange={(e) => updateField("highlightPrefix", e.target.value)}
                              placeholder="what "
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                            />
                          </div>
                          <div>
                            <label className={`block text-xs ${labelText} mb-1 flex items-center gap-1.5`}>
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              Highlight Word (Green Glow)
                            </label>
                            <input
                              type="text"
                              value={stage.highlightWord}
                              onChange={(e) => updateField("highlightWord", e.target.value)}
                              placeholder="surrounds us."
                              className={`w-full px-3.5 py-2 rounded-xl border text-xs font-bold text-emerald-500 dark:text-emerald-400 outline-none transition-all ${inputBg}`}
                            />
                          </div>
                        </div>

                        {/* Subheadline Narrative */}
                        <div>
                          <label className={`block text-xs ${labelText} mb-1`}>
                            Subheadline / Mission Narrative
                          </label>
                          <textarea
                            rows={2}
                            value={stage.subheadline}
                            onChange={(e) => updateField("subheadline", e.target.value)}
                            placeholder="From environmental exposure to biological response."
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                          />
                        </div>

                        {/* Background Image URL & Presets with Device Upload */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className={`block text-xs ${labelText}`}>
                              Slide Background Image
                            </label>
                            <span className={`text-[11px] ${subText}`}>
                              Supports Device Upload, Local Path, or Remote URL
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                            <input
                              type="text"
                              value={stage.imageSrc}
                              onChange={(e) => updateField("imageSrc", e.target.value)}
                              placeholder="/images/slide-1-field.jpg or uploaded image"
                              className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none transition-all ${inputBg}`}
                            />

                            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 cursor-pointer transition-all shrink-0">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload from Device</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, (dataUrl) => updateField("imageSrc", dataUrl));
                                  }
                                }}
                              />
                            </label>
                          </div>

                          {/* Quick Image Selector Presets */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            <span className={`text-[10px] font-semibold ${subText} mr-1`}>
                              Quick Select Sample:
                            </span>
                            {[
                              { label: "01 Field", path: "/images/slide-1-field.jpg" },
                              { label: "02 Lab", path: "/images/slide-2-lab.jpg" },
                              { label: "03 Analysis", path: "/images/slide-3-analysis.jpg" },
                              { label: "04 Impact", path: "/images/slide-4-impact.jpg" },
                              { label: "Scientist", path: "/images/hero-scientist.jpg" },
                              { label: "Campus Map", path: "/images/jahangirnagar-campus.jpg" },
                            ].map((img) => (
                              <button
                                key={img.path}
                                type="button"
                                onClick={() => updateField("imageSrc", img.path)}
                                className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                                  stage.imageSrc === img.path
                                    ? "bg-emerald-500 text-white border-emerald-500 font-bold"
                                    : isLight
                                    ? "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
                                    : "bg-[#020F07] border-emerald-950 text-slate-400 hover:text-white hover:border-emerald-800"
                                }`}
                              >
                                {img.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Live Slide Preview Card */}
                        <div className="pt-2">
                          <label className={`block text-xs ${labelText} mb-2`}>
                            Live Slide Visual Preview (Slide {stage.step}: {stage.name})
                          </label>
                          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-[#04150C] aspect-[21/9] min-h-[220px] p-6 flex flex-col justify-between shadow-2xl">
                            {/* Background Image */}
                            <img
                              src={stage.imageSrc || "/images/slide-1-field.jpg"}
                              alt={stage.name}
                              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.85] contrast-[1.05]"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#04150C] via-transparent to-black/40" />

                            {/* Top Badge */}
                            <div className="relative z-10">
                              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-300 uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span>{stage.eyebrow || "ECOTOXICOLOGY • HEALTH"}</span>
                              </div>
                            </div>

                            {/* Headline & Subheadline */}
                            <div className="relative z-10 max-w-lg space-y-1.5">
                              <h4 className="text-xl sm:text-2xl font-black text-white leading-tight font-heading">
                                {stage.headline}{" "}
                                <span className="text-white">{stage.highlightPrefix}</span>
                                <span className="text-[#34D399] drop-shadow-[0_0_20px_rgba(52,211,153,0.5)] font-black">
                                  {stage.highlightWord}
                                </span>
                              </h4>
                              <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                                {stage.subheadline}
                              </p>
                            </div>

                            {/* Bottom Stage Pill */}
                            <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-white/70">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-emerald-400">
                                  {stage.step} {stage.name}
                                </span>
                                <span className="text-white/40">|</span>
                                <span className="font-mono">{stage.flow}</span>
                              </div>
                              <span className="font-mono text-[9px] text-white/50 uppercase">
                                Homepage Live Slide {activeHeroSlideIndex + 1} of {currentStages.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 5 Scientific Arc Network Interactive Nodes Manager */}
                <div className={`p-6 rounded-2xl border ${cardBg} space-y-6`}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                    <div>
                      <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                        <Radio className="w-4 h-4 text-emerald-500" />
                        Scientific Arc Network (5 Interactive Hero Nodes)
                      </h3>
                      <p className={`text-[11px] ${subText} mt-0.5`}>
                        Manage the 5 curved interactive nodes on the right side of the hero section: labels, stage counters, and hover inspection text.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-semibold self-start sm:self-auto">
                      Interactive Arc Graph
                    </span>
                  </div>

                  {/* 5 Nodes Editor Grid */}
                  <div className="space-y-4">
                    {(formData.hero.arcNodes || DEFAULT_LANDING_DATA.hero.arcNodes || []).map((node, nIdx) => {
                      const updateNode = (field: string, val: string) => {
                        const currentNodes = [
                          ...(formData.hero.arcNodes || DEFAULT_LANDING_DATA.hero.arcNodes || []),
                        ];
                        currentNodes[nIdx] = { ...currentNodes[nIdx], [field]: val };
                        setFormData({
                          ...formData,
                          hero: {
                            ...formData.hero,
                            arcNodes: currentNodes,
                          },
                        });
                      };

                      return (
                        <div
                          key={node.id || nIdx}
                          className={`p-4 rounded-xl border ${
                            isLight
                              ? "bg-slate-50/80 border-slate-200"
                              : "bg-[#020F07] border-emerald-950/70"
                          } space-y-3 transition-all`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs flex items-center justify-center">
                                0{nIdx + 1}
                              </span>
                              <span className={`text-xs font-bold ${titleText}`}>
                                Node: {node.label}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              id: {node.id}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className={`block text-[11px] ${labelText} mb-1`}>
                                Node Label (Uppercase)
                              </label>
                              <input
                                type="text"
                                value={node.label}
                                onChange={(e) => updateNode("label", e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-bold font-mono outline-none ${inputBg}`}
                              />
                            </div>
                            <div>
                              <label className={`block text-[11px] ${labelText} mb-1`}>
                                Stage Tag (e.g. STAGE 01 OF 05)
                              </label>
                              <input
                                type="text"
                                value={node.stageNumber || `STAGE 0${nIdx + 1} OF 05`}
                                onChange={(e) => updateNode("stageNumber", e.target.value)}
                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-mono outline-none ${inputBg}`}
                              />
                            </div>
                          </div>

                          <div>
                            <label className={`block text-[11px] ${labelText} mb-1`}>
                              Hover Inspection Description (Displayed in popup card)
                            </label>
                            <input
                              type="text"
                              value={node.desc}
                              onChange={(e) => updateNode("desc", e.target.value)}
                              className={`w-full px-3 py-2 rounded-lg border text-xs outline-none ${inputBg}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* 2. METRICS STRIP */}
            {activeTab === "metrics" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-5 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <Sliders className="w-4 h-4 text-emerald-500" />
                    Research Statistics Strip (4 Indicators)
                  </h3>
                </div>

                <div className="space-y-4">
                  {formData.metrics.map((metric, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${
                        isLight ? "border-slate-100 bg-slate-50" : "border-emerald-950/70 bg-[#020F07]"
                      } grid grid-cols-1 sm:grid-cols-3 gap-3`}
                    >
                      <div>
                        <label className={`block text-[11px] ${labelText} mb-1`}>Number Value</label>
                        <input
                          type="text"
                          value={metric.value}
                          onChange={(e) => {
                            const newMetrics = [...formData.metrics];
                            newMetrics[idx].value = e.target.value;
                            setFormData({ ...formData, metrics: newMetrics });
                          }}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none font-bold font-mono ${inputBg}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[11px] ${labelText} mb-1`}>Headline Label</label>
                        <input
                          type="text"
                          value={metric.label}
                          onChange={(e) => {
                            const newMetrics = [...formData.metrics];
                            newMetrics[idx].label = e.target.value;
                            setFormData({ ...formData, metrics: newMetrics });
                          }}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${inputBg}`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[11px] ${labelText} mb-1`}>Subtext Description</label>
                        <input
                          type="text"
                          value={metric.description}
                          onChange={(e) => {
                            const newMetrics = [...formData.metrics];
                            newMetrics[idx].description = e.target.value;
                            setFormData({ ...formData, metrics: newMetrics });
                          }}
                          className={`w-full px-3 py-1.5 rounded-lg border text-xs outline-none ${inputBg}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. RESEARCH FOCUS */}
            {activeTab === "researchFocus" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-6 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Research Focus Section ("What We Study")
                  </h3>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full font-semibold">
                    Dynamic Presentation
                  </span>
                </div>

                {/* Section Text & Labels */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Section Badge Pill</label>
                    <input
                      type="text"
                      value={formData.researchFocus.badge}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          researchFocus: { ...formData.researchFocus, badge: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Main Heading</label>
                    <input
                      type="text"
                      value={formData.researchFocus.title}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          researchFocus: { ...formData.researchFocus, title: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={formData.researchFocus.subtitle}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        researchFocus: { ...formData.researchFocus, subtitle: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                {/* Shuffle / Randomize View Mode Controls */}
                <div className="pt-4 border-t border-slate-100 dark:border-emerald-950/60 space-y-4">
                  <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-[#060D1A] border border-slate-200 dark:border-slate-800">
                    <div className="space-y-0.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <Shuffle className="w-4 h-4 text-emerald-500" />
                        <span className={`text-xs font-bold ${titleText}`}>
                          Auto-Shuffle View Mode on Page Reload / Visit
                        </span>
                      </div>
                      <p className={`text-[11px] ${subText}`}>
                        When enabled, each page visit or reload will randomly select one of the presentation modes (<strong>Pillar Deck</strong>, <strong>Orbit Map</strong>, or <strong>Grid Matrix</strong>). Visitors can still freely switch modes at any time.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          researchFocus: {
                            ...formData.researchFocus,
                            shuffleViewMode: formData.researchFocus.shuffleViewMode === false ? true : false,
                          },
                        })
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        formData.researchFocus.shuffleViewMode !== false ? "bg-emerald-600" : "bg-slate-300 dark:bg-slate-700"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          formData.researchFocus.shuffleViewMode !== false ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Fixed Default View Mode (when shuffle is disabled) */}
                  <div className="space-y-2">
                    <label className={`block text-xs ${labelText}`}>
                      Fixed Default Presentation Mode {formData.researchFocus.shuffleViewMode !== false && <span className="text-[11px] font-normal text-slate-400">(Used when Shuffle is OFF)</span>}
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        {
                          id: "deck" as const,
                          name: "Pillar Deck",
                          desc: "Expanding interactive monolith pillars",
                          icon: Layers,
                        },
                        {
                          id: "radial" as const,
                          name: "Orbit Map",
                          desc: "360° planetary radial radar network",
                          icon: Orbit,
                        },
                        {
                          id: "grid" as const,
                          name: "Grid Matrix",
                          desc: "Structured analytical cards grid",
                          icon: LayoutGrid,
                        },
                      ].map((mode) => {
                        const ModeIcon = mode.icon;
                        const isSelected =
                          (formData.researchFocus.defaultViewMode || "deck") === mode.id;

                        return (
                          <button
                            key={mode.id}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                researchFocus: {
                                  ...formData.researchFocus,
                                  defaultViewMode: mode.id,
                                },
                              })
                            }
                            className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                              isSelected
                                ? "bg-emerald-500/10 border-emerald-500 ring-1 ring-emerald-500"
                                : isLight
                                ? "bg-white border-slate-200 hover:bg-slate-50"
                                : "bg-[#090D16] border-slate-800 hover:bg-slate-800/50"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <ModeIcon
                                  className={`w-4 h-4 ${
                                    isSelected ? "text-emerald-500 font-bold" : "text-slate-400"
                                  }`}
                                />
                                <span
                                  className={`text-xs font-bold ${
                                    isSelected ? "text-emerald-600 dark:text-emerald-400" : titleText
                                  }`}
                                >
                                  {mode.name}
                                </span>
                              </div>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                              )}
                            </div>
                            <p className={`text-[11px] ${subText} leading-snug`}>
                              {mode.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* 4. FEATURED PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Section Header Settings */}
                <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                      <FolderGit2 className="w-4 h-4 text-emerald-500" />
                      Flagship Research Projects Section Headlines
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Top Badge Label</label>
                      <input
                        type="text"
                        value={formData.projectsSection?.badge || "FLAGSHIP RESEARCH"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projectsSection: { ...formData.projectsSection, badge: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Section Title</label>
                      <input
                        type="text"
                        value={formData.projectsSection?.title || "Completed Projects & Scientific Breakthroughs"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            projectsSection: { ...formData.projectsSection, title: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Subtitle Description</label>
                    <textarea
                      rows={2}
                      value={formData.projectsSection?.subtitle || "High-impact investigative projects funded by national and international scientific bodies."}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectsSection: { ...formData.projectsSection, subtitle: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                {/* Live Projects Database Sync Banner & Top 8 Preview */}
                {(() => {
                  const allProjects = getLocalProjects().filter((p) => p.is_published !== false);
                  const sortedProjects = [...allProjects].sort((a, b) => {
                    if (a.is_featured && !b.is_featured) return -1;
                    if (!a.is_featured && b.is_featured) return 1;
                    const dateA = new Date(a.start_date || a.created_at).getTime();
                    const dateB = new Date(b.start_date || b.created_at).getTime();
                    return dateB - dateA;
                  });
                  const top8 = sortedProjects.slice(0, 8);
                  const featuredCount = allProjects.filter((p) => p.is_featured).length;

                  return (
                    <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <h4 className={`text-sm font-bold ${titleText}`}>
                              Homepage Flagship Projects (Live Sync)
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {top8.length} Shown on Slider (Max 8)
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {featuredCount} Featured
                            </span>
                          </div>
                          <p className={`text-xs ${subText} mt-1`}>
                            The homepage automatically displays the top <strong>latest 8 projects</strong> from the Projects Database, prioritizing <strong>Featured ★</strong> projects.
                          </p>
                        </div>

                        <Link
                          href="/admin/projects"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" />
                          <span>Manage All Projects &rarr;</span>
                        </Link>
                      </div>

                      {/* Top 8 Preview Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {top8.map((proj, idx) => (
                          <div
                            key={proj.id || idx}
                            className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070D18] overflow-hidden flex flex-col justify-between group"
                          >
                            <div className="relative h-28 w-full bg-slate-900 overflow-hidden">
                              <img
                                src={proj.hero_image || proj.featured_image || "/images/gallery/field-sampling.jpg"}
                                alt={proj.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = "/images/gallery/field-sampling.jpg";
                                }}
                              />
                              <div className="absolute top-2 left-2 flex items-center gap-1">
                                {proj.is_featured && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-500 text-black text-[9px] font-bold uppercase">
                                    ★ Featured
                                  </span>
                                )}
                                <span className="px-1.5 py-0.5 rounded bg-black/70 text-emerald-400 text-[9px] font-mono font-bold">
                                  #{idx + 1}
                                </span>
                              </div>
                              <span className="absolute bottom-1.5 right-2 px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[9px] font-bold uppercase border border-emerald-700/40">
                                {proj.status || "COMPLETED"}
                              </span>
                            </div>

                            <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                              <div>
                                <span className="text-[10px] font-mono text-slate-400 block truncate">
                                  {proj.funding_org || "National Research"} • {proj.year || "2024-2026"}
                                </span>
                                <h5 className={`text-xs font-bold leading-snug line-clamp-2 ${titleText} mt-0.5`}>
                                  {proj.title}
                                </h5>
                              </div>

                              <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                                <span className="truncate max-w-[120px]">
                                  {proj.research_areas?.[0]?.title || "Ecotoxicology"}
                                </span>
                                <Link
                                  href={`/projects#${proj.slug}`}
                                  className="text-emerald-500 hover:underline font-semibold"
                                >
                                  View &rarr;
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 5. PARTNERS RIBBON */}
            {activeTab === "partners" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-6 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <Globe className="w-4 h-4 text-emerald-500" />
                    Collaborating Institutions &amp; Partners Ribbon
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      const currentPartners =
                        formData.partnersSection?.partners ||
                        DEFAULT_LANDING_DATA.partnersSection.partners ||
                        [];
                      const newPartner = {
                        id: `partner-${Date.now()}`,
                        name: "Organization Name",
                        shortName: "",
                        type: "Partner Organization",
                        badge: "PARTNER",
                        logoUrl: "",
                        websiteUrl: "",
                      };
                      setFormData({
                        ...formData,
                        partnersSection: {
                          ...formData.partnersSection,
                          partners: [...currentPartners, newPartner],
                        },
                      });
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Organization Logo</span>
                  </button>
                </div>

                {/* Section Header Settings */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Top Badge Label</label>
                    <input
                      type="text"
                      value={formData.partnersSection?.badge || "INSTITUTIONAL NETWORK"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          partnersSection: { ...formData.partnersSection, badge: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Section Heading</label>
                    <input
                      type="text"
                      value={formData.partnersSection?.title || "Collaborating Institutions & Research Sponsors"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          partnersSection: { ...formData.partnersSection, title: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                {/* Simple Upload Guide */}
                <div className="flex items-center justify-between text-xs px-1 text-slate-400">
                  <span className="font-semibold text-slate-300">
                    Partner Logos ({((formData.partnersSection?.partners || DEFAULT_LANDING_DATA.partnersSection.partners || []).length)})
                  </span>
                  <span className="text-[11px] font-mono text-emerald-400">
                    Recommended: PNG / SVG with transparent background (1:1 or 3:2)
                  </span>
                </div>

                {/* Clean Visual Grid of Logos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pt-1">
                  {(formData.partnersSection?.partners || DEFAULT_LANDING_DATA.partnersSection.partners || []).map((partner, index) => {
                    const currentPartners =
                      formData.partnersSection?.partners ||
                      DEFAULT_LANDING_DATA.partnersSection.partners ||
                      [];

                    const updatePartnerField = (field: string, value: string) => {
                      const updated = [...currentPartners];
                      updated[index] = { ...updated[index], [field]: value };
                      setFormData({
                        ...formData,
                        partnersSection: {
                          ...formData.partnersSection,
                          partners: updated,
                        },
                      });
                    };

                    const removePartner = () => {
                      const updated = currentPartners.filter((_, i) => i !== index);
                      setFormData({
                        ...formData,
                        partnersSection: {
                          ...formData.partnersSection,
                          partners: updated,
                        },
                      });
                    };

                    return (
                      <div
                        key={partner.id || index}
                        className={`p-3.5 rounded-2xl border ${
                          isLight ? "bg-white border-slate-200" : "bg-[#090D16] border-slate-800"
                        } flex flex-col gap-2 relative transition-all group hover:border-emerald-500/50`}
                      >
                        {/* Top Action Bar with Delete */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Logo {index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={removePartner}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Remove Logo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Visual Upload / Preview Box (Only Logo) */}
                        <label className={`w-full h-36 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 relative cursor-pointer transition-all ${
                          partner.logoUrl
                            ? isLight ? "bg-slate-50 border-emerald-500/40" : "bg-slate-900/60 border-emerald-500/40"
                            : isLight ? "bg-slate-50 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/20" : "bg-slate-900/40 border-slate-700 hover:border-emerald-400 hover:bg-emerald-950/20"
                        }`}>
                          {partner.logoUrl ? (
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img
                                src={partner.logoUrl}
                                alt="Organization Logo"
                                className="max-h-full max-w-full object-contain"
                              />
                              <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity rounded-lg">
                                <span className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold shadow-md">
                                  Change Logo
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-center gap-1.5 pointer-events-none">
                              <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                <Upload className="w-4 h-4" />
                              </div>
                              <span className="text-xs font-semibold text-emerald-500">Upload Logo</span>
                              <span className="text-[10px] text-slate-400">Click to browse image (PNG/SVG)</span>
                            </div>
                          )}

                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(file, (dataUrl) =>
                                  updatePartnerField("logoUrl", dataUrl)
                                );
                              }
                            }}
                          />
                        </label>

                        {/* Direct URL input & status */}
                        <div className="space-y-1.5 pt-1">
                          <input
                            type="text"
                            placeholder="Paste direct Logo URL..."
                            value={partner.logoUrl || ""}
                            onChange={(e) => updatePartnerField("logoUrl", e.target.value)}
                            className={`w-full px-2.5 py-1.5 rounded-lg border text-[11px] font-mono outline-none ${inputBg}`}
                          />
                          {partner.logoUrl && (
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-emerald-400 font-medium">✓ Logo Ready</span>
                              <button
                                type="button"
                                onClick={() => updatePartnerField("logoUrl", "")}
                                className="text-rose-400 hover:text-rose-500 hover:underline cursor-pointer"
                              >
                                Clear
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. PUBLICATIONS */}
            {activeTab === "publications" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Section Header Settings */}
                <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                      <FileText className="w-4 h-4 text-emerald-500" />
                      Featured Publications Section Headlines
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Top Badge Label</label>
                      <input
                        type="text"
                        value={formData.publicationsSection?.badge || "PEER-REVIEWED EVIDENCE"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publicationsSection: { ...formData.publicationsSection, badge: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Section Heading</label>
                      <input
                        type="text"
                        value={formData.publicationsSection?.title || "Featured Publications"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            publicationsSection: { ...formData.publicationsSection, title: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Subtitle Description</label>
                    <textarea
                      rows={2}
                      value={formData.publicationsSection?.subtitle || "Recent scientific breakthroughs published in high-impact environmental toxicology and public health journals."}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          publicationsSection: { ...formData.publicationsSection, subtitle: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                {/* Live Database Sync Banner & Top 10 Preview */}
                {(() => {
                  const allPubs = getLocalPublications().filter((p) => p.is_published !== false);
                  const sortedPubs = [...allPubs].sort((a, b) => {
                    if (a.is_featured && !b.is_featured) return -1;
                    if (!a.is_featured && b.is_featured) return 1;
                    return (
                      b.publication_year - a.publication_year ||
                      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                    );
                  });
                  const top10 = sortedPubs.slice(0, 10);
                  const featuredCount = allPubs.filter((p) => p.is_featured).length;

                  return (
                    <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <h4 className={`text-sm font-bold ${titleText}`}>
                              Homepage Featured Publications (Live Sync)
                            </h4>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              {top10.length} Shown on Carousel
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-amber-400" />
                              {featuredCount} Featured
                            </span>
                          </div>
                          <p className={`text-xs ${subText} mt-1`}>
                            The homepage automatically displays up to <strong>10 publications</strong>, prioritizing papers marked as <strong>Featured ★</strong> and newest publications.
                          </p>
                        </div>

                        <Link
                          href="/admin/publications"
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all shrink-0"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Manage All Publications &rarr;</span>
                        </Link>
                      </div>

                      {/* Top 10 Preview List */}
                      <div className="space-y-2.5">
                        {top10.map((pub, idx) => (
                          <div
                            key={pub.id || idx}
                            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-[#070D18] flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] font-mono font-bold shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  {pub.is_featured && (
                                    <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold">
                                      <Star className="w-2.5 h-2.5 fill-amber-500" />
                                      Featured
                                    </span>
                                  )}
                                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                    {pub.publication_year}
                                  </span>
                                  <span className="text-[11px] text-slate-400">•</span>
                                  <span className="text-[11px] italic text-slate-500 dark:text-slate-400 truncate">
                                    {pub.journal}
                                  </span>
                                </div>
                                <h5 className={`text-xs font-bold ${titleText} truncate mt-0.5`}>
                                  {pub.title}
                                </h5>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[140px]">
                                {pub.doi ? `DOI: ${pub.doi}` : "No DOI"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* 7. PI SPOTLIGHT */}
            {activeTab === "pi" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-5 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <Award className="w-4 h-4 text-emerald-500" />
                    Principal Investigator &amp; Director Spotlight
                  </h3>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const members = await getTeamMembers();
                        const piMember = members.find((m) => m.category === "pi") || members[0];
                        if (piMember) {
                          setFormData({
                            ...formData,
                            piSection: {
                              ...formData.piSection,
                              name: piMember.name,
                              designation: piMember.role,
                              department: piMember.department || "Department of Environmental Sciences",
                              institution: piMember.affiliation || "Jahangirnagar University",
                              bioQuote: piMember.quote || piMember.bio || formData.piSection.bioQuote,
                              imageSrc: piMember.imageSrc || formData.piSection.imageSrc,
                              publicationsCount: piMember.publicationsCount ? `${piMember.publicationsCount}+` : formData.piSection.publicationsCount,
                              citationsCount: piMember.citationsCount ? `${piMember.citationsCount.toLocaleString()}+` : "2,840+",
                              hIndex: piMember.hIndex ? `${piMember.hIndex}` : "26",
                              scholarUrl: piMember.googleScholarUrl || formData.piSection.scholarUrl,
                            },
                          });
                          alert(`Successfully synchronized PI details from ${piMember.name}!`);
                        }
                      } catch (err) {
                        alert("Failed to load PI from team database.");
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Sync from Team Database</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>PI Full Name</label>
                    <input
                      type="text"
                      value={formData.piSection.name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piSection: { ...formData.piSection, name: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Academic Designation</label>
                    <input
                      type="text"
                      value={formData.piSection.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piSection: { ...formData.piSection, designation: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Department</label>
                    <input
                      type="text"
                      value={formData.piSection.department || "Department of Environmental Sciences"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piSection: { ...formData.piSection, department: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Institution</label>
                    <input
                      type="text"
                      value={formData.piSection.institution || "Jahangirnagar University"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piSection: { ...formData.piSection, institution: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Director Bio &amp; Mission Quote</label>
                  <textarea
                    rows={3}
                    value={formData.piSection.bioQuote}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        piSection: { ...formData.piSection, bioQuote: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                {/* PI Profile Photo with Device Upload */}
                <div className="space-y-2">
                  <label className={`block text-xs ${labelText}`}>PI Profile Image</label>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <input
                      type="text"
                      value={formData.piSection.imageSrc || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piSection: { ...formData.piSection, imageSrc: e.target.value },
                        })
                      }
                      className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none ${inputBg}`}
                    />
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 cursor-pointer transition-all shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload PI Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, (dataUrl) =>
                              setFormData({
                                ...formData,
                                piSection: { ...formData.piSection, imageSrc: dataUrl },
                              })
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Publications Counter</label>
                    <input
                      type="text"
                      value={formData.piSection.publicationsCount}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piSection: { ...formData.piSection, publicationsCount: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Citations Counter</label>
                    <input
                      type="text"
                      value={formData.piSection.citationsCount || "2,840+"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piSection: { ...formData.piSection, citationsCount: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>h-Index Counter</label>
                    <input
                      type="text"
                      value={formData.piSection.hIndex || "26"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          piSection: { ...formData.piSection, hIndex: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 8. RESEARCHER ROSTER */}
            {activeTab === "people" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-6 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <Users className="w-4 h-4 text-emerald-500" />
                    Researcher &amp; Faculty Roster Slideshow
                  </h3>
                  <Link
                    href="/admin/people"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-500 text-xs font-semibold border border-emerald-500/30 transition-all cursor-pointer"
                  >
                    <span>Manage Researchers in Team Studio &rarr;</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Top Badge Label</label>
                    <input
                      type="text"
                      value={formData.peopleSection?.badge || "LAB ROSTER"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          peopleSection: { ...formData.peopleSection, badge: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Section Heading</label>
                    <input
                      type="text"
                      value={formData.peopleSection?.title || "Meet the Researchers"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          peopleSection: { ...formData.peopleSection, title: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={formData.peopleSection?.subtitle || "The multidisciplinary faculty, doctoral scholars, graduate students, and fellows advancing environmental ecotoxicology research at Jahangirnagar University."}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        peopleSection: { ...formData.peopleSection, subtitle: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Slideshow Auto-Advance Speed (Seconds)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1.5"
                      max="15"
                      value={formData.peopleSection?.autoSlideSeconds ?? 3.5}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          peopleSection: {
                            ...formData.peopleSection,
                            autoSlideSeconds: parseFloat(e.target.value) || 3.5,
                          },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Controls the interval (e.g. 3.5s) for smooth automatic sliding.
                    </span>
                  </div>

                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Random Member Shuffle</label>
                    <div className={`p-3 rounded-xl border flex items-center justify-between ${
                      isLight ? "bg-slate-50 border-slate-200" : "bg-slate-900 border-slate-700"
                    }`}>
                      <div className="text-xs">
                        <span className="font-semibold block text-slate-200">Shuffle on Page Load</span>
                        <span className="text-[10px] text-slate-400">Randomizes order so different members get highlighted.</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.peopleSection?.enableShuffle !== false}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            peopleSection: {
                              ...formData.peopleSection,
                              enableShuffle: e.target.checked,
                            },
                          })
                        }
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Sync Information Box */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isLight ? "bg-emerald-50/70 border-emerald-200 text-emerald-900" : "bg-emerald-950/20 border-emerald-900/40 text-emerald-200"
                }`}>
                  <Info className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold">Automatic Team Sync &amp; Member Filtering</p>
                    <p className={`text-[11px] leading-relaxed ${isLight ? "text-emerald-800" : "text-emerald-300/80"}`}>
                      This slideshow displays all <strong>active current lab researchers</strong> directly from the Team Database. The <strong>Principal Investigator</strong> (featured in Spotlight above) and <strong>Alumni</strong> are automatically excluded. Any edits made in <Link href="/admin/people" className="underline font-bold text-emerald-400">Admin &rarr; People</Link> update this slideshow immediately.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 9. NEWS & INSIGHTS */}
            {activeTab === "news" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-5 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <Newspaper className="w-4 h-4 text-emerald-500" />
                    Latest News &amp; Insights Section
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Top Badge Label</label>
                    <input
                      type="text"
                      value={formData.newsSection?.badge || "LAB DISPATCHES"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newsSection: { ...formData.newsSection, badge: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Section Heading</label>
                    <input
                      type="text"
                      value={formData.newsSection?.title || "Latest News & Insights"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          newsSection: { ...formData.newsSection, title: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Subtitle Description</label>
                  <textarea
                    rows={2}
                    value={formData.newsSection?.subtitle || "Stay updated on recent grant awards, breakthrough publications, symposium keynotes, and field expeditions."}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        newsSection: { ...formData.newsSection, subtitle: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                      Live News &amp; Dispatches Management
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Create, edit, or feature articles appearing in this carousel.
                    </div>
                  </div>
                  <Link
                    href="/admin/news"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs whitespace-nowrap cursor-pointer"
                  >
                    <span>Open News Studio</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}

            {/* 10. OPPORTUNITIES CTA */}
            {activeTab === "opportunities" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-5 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <Briefcase className="w-4 h-4 text-emerald-500" />
                    Opportunities CTA ("Join Our Research")
                  </h3>
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Section Heading</label>
                  <input
                    type="text"
                    value={formData.opportunitiesSection.title}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opportunitiesSection: { ...formData.opportunitiesSection, title: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Recruitment Highlight Sentence</label>
                  <input
                    type="text"
                    value={formData.opportunitiesSection.highlightText}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opportunitiesSection: { ...formData.opportunitiesSection, highlightText: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Full Description</label>
                  <textarea
                    rows={3}
                    value={formData.opportunitiesSection.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opportunitiesSection: { ...formData.opportunitiesSection, description: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>
              </div>
            )}

            {/* 11. FIELD GALLERY */}
            {activeTab === "gallery" && (
              <div className="space-y-6 animate-in fade-in">
                {/* Section Header Settings */}
                <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                      <ImageIcon className="w-4 h-4 text-emerald-500" />
                      Event Showcase &amp; Field Gallery Section Headlines
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Top Badge Label</label>
                      <input
                        type="text"
                        value={formData.gallerySection?.badge || "VISUAL ARCHIVE"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gallerySection: { ...formData.gallerySection, badge: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs ${labelText} mb-1`}>Section Heading</label>
                      <input
                        type="text"
                        value={formData.gallerySection?.title || "Event Showcase & Field Gallery"}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            gallerySection: { ...formData.gallerySection, title: e.target.value },
                          })
                        }
                        className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Subtitle Description</label>
                    <textarea
                      rows={2}
                      value={formData.gallerySection?.subtitle || "A continuous glimpse into our river delta expeditions, spectroscopic instrument rooms, and international symposia."}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gallerySection: { ...formData.gallerySection, subtitle: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                {/* Live Gallery Assets Sync Manager */}
                <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <h4 className={`text-sm font-bold ${titleText}`}>
                          Homepage Marquee Photos &amp; Media Assets
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {galleryItems.length} Synced Photos
                        </span>
                      </div>
                      <p className={`text-xs ${subText} mt-1`}>
                        These photos continuously slide across the homepage marquee and open detailed lightbox modals when clicked.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href="/admin/media"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Media Library</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingGalleryItem({
                            id: "",
                            title: "",
                            category: "Field Expedition",
                            location: "",
                            date_text: "2026",
                            description: "",
                            image_url: "/images/gallery/field-sampling.jpg",
                          });
                          setGalleryModalOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Photo Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {galleryItems.map((item) => {
                      const badgeStyle = getCategoryBadgeColor(item.category);
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070D18] overflow-hidden flex flex-col justify-between group hover:border-emerald-500/40 transition-colors"
                        >
                          <div className="relative h-36 w-full bg-slate-900 overflow-hidden">
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "/images/gallery/field-sampling.jpg";
                              }}
                            />
                            <span className={`absolute top-2 left-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow ${badgeStyle}`}>
                              {item.category}
                            </span>
                          </div>

                          <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                            <div>
                              <h5 className={`text-xs font-bold leading-snug line-clamp-2 ${titleText}`}>
                                {item.title}
                              </h5>
                              {(item.location || item.date_text) && (
                                <p className={`text-[11px] ${subText} mt-1 flex items-center gap-1`}>
                                  {item.location && <span>{item.location}</span>}
                                  {item.location && item.date_text && <span>•</span>}
                                  {item.date_text && <span>{item.date_text}</span>}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-slate-200 dark:border-slate-800/80">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingGalleryItem({ ...item });
                                  setGalleryModalOpen(true);
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                title="Edit Photo"
                              >
                                <Sliders className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm("Delete this photo from the homepage gallery marquee?")) {
                                    await deleteGalleryItem(item.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                                title="Delete Photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inline Gallery Photo Modal */}
                {galleryModalOpen && editingGalleryItem && (
                  <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className={`w-full max-w-lg p-6 rounded-3xl border ${cardBg} shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto`}>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                        <h4 className={`text-base font-bold ${titleText}`}>
                          {editingGalleryItem.id ? "Edit Gallery Photo" : "Add Photo to Field Gallery"}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setGalleryModalOpen(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div>
                          <label className={`block font-semibold mb-1 ${subText}`}>Title / Caption *</label>
                          <input
                            type="text"
                            required
                            value={editingGalleryItem.title}
                            onChange={(e) =>
                              setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })
                            }
                            className={`w-full px-3.5 py-2 rounded-xl border outline-none ${inputBg}`}
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold mb-1 ${subText}`}>Image File / URL *</label>
                          <div className="flex items-center gap-2 mb-2">
                            <label className="px-3 py-1.5 rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-400 font-semibold cursor-pointer text-xs flex items-center gap-1.5">
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload from Disk</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    handleImageUpload(file, (url) => {
                                      setEditingGalleryItem({ ...editingGalleryItem, image_url: url });
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            required
                            placeholder="https://... or /images/gallery/..."
                            value={editingGalleryItem.image_url}
                            onChange={(e) =>
                              setEditingGalleryItem({ ...editingGalleryItem, image_url: e.target.value })
                            }
                            className={`w-full px-3.5 py-2 rounded-xl border outline-none font-mono text-[11px] ${inputBg}`}
                          />
                          {editingGalleryItem.image_url && (
                            <div className="mt-2 relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                              <img
                                src={editingGalleryItem.image_url}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className={`block font-semibold mb-1 ${subText}`}>Category</label>
                            <select
                              value={editingGalleryItem.category}
                              onChange={(e) =>
                                setEditingGalleryItem({ ...editingGalleryItem, category: e.target.value })
                              }
                              className={`w-full px-3.5 py-2 rounded-xl border outline-none ${inputBg}`}
                            >
                              <option value="Field Expedition">Field Expedition</option>
                              <option value="Laboratory Analysis">Laboratory Analysis</option>
                              <option value="Microscopy & Imaging">Microscopy &amp; Imaging</option>
                              <option value="Symposium & Seminar">Symposium &amp; Seminar</option>
                              <option value="Community & Outreach">Community &amp; Outreach</option>
                              <option value="Campus & Facilities">Campus &amp; Facilities</option>
                              <option value="Award & Honors">Award &amp; Honors</option>
                            </select>
                          </div>
                          <div>
                            <label className={`block font-semibold mb-1 ${subText}`}>Location</label>
                            <input
                              type="text"
                              value={editingGalleryItem.location || ""}
                              onChange={(e) =>
                                setEditingGalleryItem({ ...editingGalleryItem, location: e.target.value })
                              }
                              placeholder="e.g. Meghna Estuary"
                              className={`w-full px-3.5 py-2 rounded-xl border outline-none ${inputBg}`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className={`block font-semibold mb-1 ${subText}`}>Date / Period</label>
                          <input
                            type="text"
                            value={editingGalleryItem.date_text || ""}
                            onChange={(e) =>
                              setEditingGalleryItem({ ...editingGalleryItem, date_text: e.target.value })
                            }
                            placeholder="e.g. March 2026"
                            className={`w-full px-3.5 py-2 rounded-xl border outline-none ${inputBg}`}
                          />
                        </div>

                        <div>
                          <label className={`block font-semibold mb-1 ${subText}`}>Description Details</label>
                          <textarea
                            rows={2}
                            value={editingGalleryItem.description || ""}
                            onChange={(e) =>
                              setEditingGalleryItem({ ...editingGalleryItem, description: e.target.value })
                            }
                            className={`w-full px-3.5 py-2 rounded-xl border outline-none ${inputBg}`}
                          />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                          <button
                            type="button"
                            onClick={() => setGalleryModalOpen(false)}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!editingGalleryItem.title || !editingGalleryItem.image_url) {
                                alert("Please provide both Title and Image URL.");
                                return;
                              }
                              await saveGalleryItem({
                                id: editingGalleryItem.id || undefined,
                                title: editingGalleryItem.title,
                                category: editingGalleryItem.category,
                                location: editingGalleryItem.location,
                                date_text: editingGalleryItem.date_text,
                                description: editingGalleryItem.description,
                                image_url: editingGalleryItem.image_url,
                              });
                              setGalleryModalOpen(false);
                            }}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20 cursor-pointer"
                          >
                            Save Photo
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 12. CAMPUS LOCATION & MAP */}
            {activeTab === "contact" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-5 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    Jahangirnagar University Campus &amp; GPS Location
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>GPS Latitude &amp; Longitude</label>
                    <input
                      type="text"
                      value={formData.contactSection.gpsCoordinates}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, gpsCoordinates: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none font-mono ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Lab Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactSection.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, email: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Physical Campus Address</label>
                  <input
                    type="text"
                    value={formData.contactSection.address}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactSection: { ...formData.contactSection, address: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                {/* Campus Aerial Image with Device Upload */}
                <div className="space-y-2">
                  <label className={`block text-xs ${labelText}`}>Campus Aerial Image / Map Photo</label>
                  <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
                    <input
                      type="text"
                      value={formData.contactSection.aerialImageSrc || "/images/jahangirnagar-campus.jpg"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, aerialImageSrc: e.target.value },
                        })
                      }
                      className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-mono outline-none ${inputBg}`}
                    />
                    <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 cursor-pointer transition-all shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Map Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, (dataUrl) =>
                              setFormData({
                                ...formData,
                                contactSection: { ...formData.contactSection, aerialImageSrc: dataUrl },
                              })
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Phone / Ext.</label>
                    <input
                      type="text"
                      value={formData.contactSection.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, phone: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs ${labelText} mb-1`}>Operating Hours</label>
                    <input
                      type="text"
                      value={formData.contactSection.hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, hours: e.target.value },
                        })
                      }
                      className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 13. FOOTER */}
            {activeTab === "footer" && (
              <div className={`p-6 rounded-2xl border ${cardBg} space-y-5 animate-in fade-in`}>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-emerald-950/60">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${titleText}`}>
                    <Building className="w-4 h-4 text-emerald-500" />
                    Footer Notice &amp; Copyright
                  </h3>
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Official Laboratory Name</label>
                  <input
                    type="text"
                    value={formData.footer?.labName || "Laboratory of Environmental Health and Ecotoxicology (LabEHE)"}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, labName: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Footer Lab Mission Summary</label>
                  <textarea
                    rows={2}
                    value={formData.footer?.description || "Department of Environmental Sciences, Jahangirnagar University. Dedicated to understanding chemical fate, ecological vulnerabilities, and safeguarding human health through evidence-based science."}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, description: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs ${labelText} mb-1`}>Copyright Notice</label>
                  <input
                    type="text"
                    value={formData.footer?.copyrightText || "© 2026 Laboratory of Environmental Health and Ecotoxicology (LabEHE). Jahangirnagar University. All rights reserved."}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, copyrightText: e.target.value },
                      })
                    }
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs outline-none ${inputBg}`}
                  />
                </div>
              </div>
            )}

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-emerald-950/60">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-emerald-950 text-xs font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-emerald-950/40"
              >
                Reset Defaults
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                Save Landing Page
              </button>
            </div>
          </form>
        </div>
      </div>
    );
}
