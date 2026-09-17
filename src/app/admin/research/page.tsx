"use client";

import React, { useState, useEffect } from "react";
import { useAdminTheme } from "@/lib/admin-theme";
import {
  ResearchPillar,
  fetchResearchPillarsAsync,
  saveResearchPillar,
  deleteResearchPillar,
  saveAllResearchPillars,
  DEFAULT_RESEARCH_PILLARS,
} from "@/lib/research-areas/store";
import { safeCompressImage } from "@/lib/image-compression";
import {
  FlaskConical,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  HeartPulse,
  Leaf,
  Activity,
  Compass,
  Microscope,
  Atom,
  Waves,
  Layers,
  Upload,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
  Tag,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Sliders,
  ExternalLink,
  ShieldCheck,
  Zap,
} from "lucide-react";

// Icon registry for pillars
const PILLAR_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
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

const ICON_OPTIONS = [
  { id: "FlaskConical", label: "Flask / Chemistry" },
  { id: "Sparkles", label: "Sparkles / Microplastics" },
  { id: "HeartPulse", label: "Heart / Health Risk" },
  { id: "Leaf", label: "Leaf / Ecology & Circular" },
  { id: "Activity", label: "Activity / Monitoring" },
  { id: "Compass", label: "Compass / GIS & Spatial" },
  { id: "Microscope", label: "Microscope / Imaging" },
  { id: "Atom", label: "Atom / Molecular" },
  { id: "Waves", label: "Waves / Aquatic" },
  { id: "Layers", label: "Layers / Multi-Matrix" },
];

const PRESET_IMAGES = [
  { label: "Contamination Lab", url: "/images/areas/area-1.jpg" },
  { label: "Microplastics Scope", url: "/images/areas/area-2.jpg" },
  { label: "Cellular Bioassay", url: "/images/areas/area-3.jpg" },
  { label: "Circular Biochar", url: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80" },
  { label: "Sensors & Telemetry", url: "https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80" },
  { label: "Satellite GIS Contour", url: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80" },
  { label: "Campus Lab Facility", url: "/images/jahangirnagar-campus.jpg" },
];

export default function AdminResearchPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";

  const [pillars, setPillars] = useState<ResearchPillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formState, setFormState] = useState<ResearchPillar>({
    id: "",
    index: "01",
    code: "AREA-01",
    title: "",
    shortTitle: "",
    slug: "",
    description: "",
    imageSrc: "/images/areas/area-1.jpg",
    imageAlt: "",
    icon_name: "FlaskConical",
    tags: [],
    keyHighlight: "Multi-Matrix Screening",
    instrumentation: "Orbitrap LC-HRMS • EPA Method 533/537.1",
    targetMatrices: "Soil sediment cores, agricultural runoff, groundwater",
    detectionMetric: "< 0.1 ppt Detection Limit",
    display_order: 1,
  });

  const [tagsInput, setTagsInput] = useState("");

  const cardBg = isLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0F172A] border-slate-800 shadow-md";
  const subText = isLight ? "text-slate-500" : "text-slate-400";
  const titleText = isLight ? "text-slate-900" : "text-white";
  const inputBg = isLight
    ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500"
    : "bg-[#090D16] border-slate-700 text-white focus:border-emerald-400";

  const loadPillars = async () => {
    setLoading(true);
    try {
      const data = await fetchResearchPillarsAsync();
      setPillars(data);
    } catch (err) {
      console.error("Error loading research pillars:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPillars();

    const handleUpdate = () => {
      loadPillars();
    };

    window.addEventListener("lab_research_areas_updated", handleUpdate);
    return () => window.removeEventListener("lab_research_areas_updated", handleUpdate);
  }, []);

  const handleOpenAdd = () => {
    const nextIdx = pillars.length + 1;
    const indexStr = String(nextIdx).padStart(2, "0");
    setEditingId(null);
    setFormState({
      id: "",
      index: indexStr,
      code: `AREA-${indexStr}`,
      title: "",
      shortTitle: "",
      slug: "",
      description: "",
      imageSrc: "/images/areas/area-1.jpg",
      imageAlt: "",
      icon_name: "FlaskConical",
      tags: ["Ecotoxicology", "Analytical Chemistry", "Environmental Health"],
      keyHighlight: "Pillar Highlight",
      instrumentation: "High-Resolution Spectroscopy",
      targetMatrices: "Aquatic, terrestrial, atmospheric matrices",
      detectionMetric: "High-Precision Limit",
      display_order: nextIdx,
    });
    setTagsInput("Ecotoxicology, Analytical Chemistry, Environmental Health");
    setShowModal(true);
  };

  const handleOpenEdit = (p: ResearchPillar) => {
    setEditingId(p.id);
    setFormState({
      ...p,
      tags: p.tags || [],
    });
    setTagsInput((p.tags || []).join(", "));
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await safeCompressImage(file, {
        maxWidth: 1200,
        maxHeight: 800,
        quality: 0.85,
        mimeType: "image/jpeg",
      });
      setFormState((prev) => ({ ...prev, imageSrc: compressed }));
    } catch (err) {
      console.error("Image upload/compression failed:", err);
      alert("Failed to process image. Please choose another file.");
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim()) {
      alert("Please enter a Title for this research pillar.");
      return;
    }

    setSaving(true);
    try {
      const parsedTags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload: Partial<ResearchPillar> & { title: string } = {
        ...formState,
        id: editingId || undefined,
        tags: parsedTags,
        shortTitle: formState.shortTitle.trim() || formState.title.split(" ")[0],
      };

      await saveResearchPillar(payload);
      setStatusMessage({ type: "success", text: "Research Pillar saved & synced to homepage 'What We Study'!" });
      setShowModal(false);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err) {
      console.error("Failed to save research pillar:", err);
      setStatusMessage({ type: "error", text: "Failed to save pillar." });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this research pillar? It will be removed from the homepage.")) return;
    try {
      await deleteResearchPillar(id);
      setStatusMessage({ type: "success", text: "Research pillar removed successfully." });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage({ type: "error", text: "Failed to delete pillar." });
    }
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= pillars.length) return;

    const updated = [...pillars];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    // Re-index
    const reindexed = updated.map((p, idx) => ({
      ...p,
      index: String(idx + 1).padStart(2, "0"),
      code: `AREA-${String(idx + 1).padStart(2, "0")}`,
      display_order: idx + 1,
    }));

    setPillars(reindexed);
    await saveAllResearchPillars(reindexed);
    setStatusMessage({ type: "success", text: "Pillar order updated!" });
    setTimeout(() => setStatusMessage(null), 2500);
  };

  const handleResetDefaults = async () => {
    if (!confirm("Reset all Research Pillars to the 6 default high-impact lab themes? Any custom modifications will be overwritten.")) return;
    await saveAllResearchPillars(DEFAULT_RESEARCH_PILLARS);
    setPillars(DEFAULT_RESEARCH_PILLARS);
    setStatusMessage({ type: "success", text: "Reset to default research pillars." });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-[1720px] mx-auto">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 text-sm font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-600 text-white shadow-emerald-500/25"
              : "bg-red-600 text-white shadow-red-500/25"
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold tracking-tight ${titleText}`}>
                Research Areas &amp; Scientific Pillars
              </h1>
              <p className={`text-xs sm:text-sm ${subText} mt-0.5`}>
                Full management of the <strong>&quot;What We Study&quot;</strong> homepage monolith pillar deck, images, instrumentation, and scientific metrics.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all cursor-pointer"
            title="Reset to 6 default laboratory themes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#04150C] text-xs sm:text-sm font-bold tracking-wide uppercase transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Scientific Pillar</span>
          </button>
        </div>
      </div>

      {/* Pillar Cards Grid */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#10B981]" />
          <p className="text-sm">Loading research pillars...</p>
        </div>
      ) : pillars.length === 0 ? (
        <div className={`p-12 rounded-3xl border ${cardBg} text-center space-y-4`}>
          <FlaskConical className="w-12 h-12 text-slate-400 mx-auto opacity-50" />
          <h3 className={`text-lg font-bold ${titleText}`}>No Research Pillars configured</h3>
          <p className={`text-sm ${subText} max-w-md mx-auto`}>
            Add your first scientific pillar or click &quot;Reset Defaults&quot; to load the standard 6 ecotoxicology laboratory domains.
          </p>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-6 py-2.5 rounded-xl bg-[#10B981] text-[#04150C] text-xs font-bold uppercase tracking-wider shadow-md"
          >
            Load 6 Default Pillars
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const IconComp = PILLAR_ICONS[pillar.icon_name] || FlaskConical;
            return (
              <div
                key={pillar.id}
                className={`rounded-3xl border ${cardBg} overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition-all duration-300 hover:shadow-xl`}
              >
                {/* Pillar Header Image & Badge */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-950">
                  <img
                    src={pillar.imageSrc}
                    alt={pillar.imageAlt || pillar.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.92]"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/images/areas/area-1.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-emerald-400/40 text-[11px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                      PILLAR {pillar.index || `0${idx + 1}`}
                    </span>

                    <div className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-emerald-300">
                      <IconComp className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Bottom Image Highlight */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/90 text-black font-extrabold uppercase tracking-wide text-[10.5px]">
                      {pillar.keyHighlight || "Scientific Focus"}
                    </span>
                    <span className="text-emerald-200/90 font-mono text-[11px] truncate max-w-[170px] drop-shadow">
                      {pillar.detectionMetric}
                    </span>
                  </div>
                </div>

                {/* Pillar Body Content */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between text-left">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-lg font-bold ${titleText} leading-snug tracking-tight line-clamp-1`}>
                        {pillar.title}
                      </h3>
                      <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold uppercase shrink-0">
                        {pillar.shortTitle}
                      </span>
                    </div>

                    <p className={`text-xs ${subText} leading-relaxed line-clamp-3`}>
                      {pillar.description}
                    </p>
                  </div>

                  {/* Scientific Specifications */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 font-semibold shrink-0">Specs:</span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono text-[11px] truncate">
                        {pillar.instrumentation}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-slate-400 font-semibold shrink-0">Matrices:</span>
                      <span className="text-slate-600 dark:text-slate-400 text-[11px] truncate">
                        {pillar.targetMatrices}
                      </span>
                    </div>
                  </div>

                  {/* Tags */}
                  {pillar.tags && pillar.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pillar.tags.slice(0, 3).map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-[10.5px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Toolbar */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMove(idx, "up")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === pillars.length - 1}
                        onClick={() => handleMove(idx, "down")}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(pillar)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-[#10B981] hover:text-[#10B981] text-xs font-semibold transition-all cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Pillar &amp; Image</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(pillar.id)}
                        className="p-2 rounded-xl text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Delete Pillar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit / Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div
            className={`w-full max-w-3xl rounded-3xl border ${cardBg} p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl text-left my-8`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-[#10B981]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className={`text-xl font-bold ${titleText}`}>
                    {editingId ? "Edit Scientific Pillar & Image" : "Add New Scientific Pillar"}
                  </h2>
                  <p className={`text-xs ${subText}`}>
                    Changes update live across the homepage &quot;What We Study&quot; interactive deck.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-6">
              {/* Image Upload & Preview Section */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-[#34D399] flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span>Pillar Cover Image &amp; Visuals</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                  {/* Thumbnail Preview */}
                  <div className="sm:col-span-4 aspect-[16/10] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-black relative">
                    <img
                      src={formState.imageSrc || "/images/areas/area-1.jpg"}
                      alt="Pillar preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/images/areas/area-1.jpg";
                      }}
                    />
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] text-white font-mono">
                      LIVE PREVIEW
                    </span>
                  </div>

                  {/* Upload Controls & URL */}
                  <div className="sm:col-span-8 space-y-3">
                    <div>
                      <label className={`text-xs font-semibold ${titleText} block mb-1`}>
                        Upload Image File (Auto-Compressed for Fast Delivery)
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className={`w-full text-xs p-2 rounded-xl border ${inputBg} file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#10B981] file:text-black hover:file:bg-[#34D399] cursor-pointer`}
                      />
                    </div>

                    <div>
                      <label className={`text-xs font-semibold ${titleText} block mb-1`}>
                        Or Image URL Path
                      </label>
                      <input
                        type="text"
                        value={formState.imageSrc}
                        onChange={(e) => setFormState({ ...formState, imageSrc: e.target.value })}
                        placeholder="/images/areas/area-1.jpg or https://..."
                        className={`w-full text-xs p-2.5 rounded-xl border ${inputBg}`}
                      />
                    </div>

                    {/* Presets */}
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Select from Lab Preset Photos:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_IMAGES.map((preset, pIdx) => (
                          <button
                            key={pIdx}
                            type="button"
                            onClick={() => setFormState({ ...formState, imageSrc: preset.url })}
                            className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-[10.5px] text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 transition-all cursor-pointer"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Short Title */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                    Full Scientific Pillar Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.title}
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    placeholder="e.g. Environmental Contamination & Fate"
                    className={`w-full p-3 rounded-xl border text-sm font-semibold ${inputBg}`}
                  />
                </div>

                <div className="sm:col-span-4 space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                    Short Title (Deck Pill)
                  </label>
                  <input
                    type="text"
                    value={formState.shortTitle}
                    onChange={(e) => setFormState({ ...formState, shortTitle: e.target.value })}
                    placeholder="e.g. Contamination"
                    className={`w-full p-3 rounded-xl border text-sm ${inputBg}`}
                  />
                </div>
              </div>

              {/* Icon & Pillar Number */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6 space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                    Scientific Symbol / Icon
                  </label>
                  <select
                    value={formState.icon_name}
                    onChange={(e) => setFormState({ ...formState, icon_name: e.target.value })}
                    className={`w-full p-3 rounded-xl border text-sm ${inputBg} cursor-pointer`}
                  >
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                    Pillar Number
                  </label>
                  <input
                    type="text"
                    value={formState.index}
                    onChange={(e) => setFormState({ ...formState, index: e.target.value })}
                    placeholder="01"
                    className={`w-full p-3 rounded-xl border text-sm font-mono ${inputBg}`}
                  />
                </div>

                <div className="sm:col-span-3 space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                    Area Code
                  </label>
                  <input
                    type="text"
                    value={formState.code}
                    onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                    placeholder="AREA-01"
                    className={`w-full p-3 rounded-xl border text-sm font-mono ${inputBg}`}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                  Scientific Scope &amp; Methodology Description
                </label>
                <textarea
                  rows={3}
                  value={formState.description}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  placeholder="Describe key research questions, chemical fate mechanisms, and experimental analytical techniques..."
                  className={`w-full p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${inputBg}`}
                />
              </div>

              {/* Scientific Highlights & Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                    Key Highlight Badge
                  </label>
                  <input
                    type="text"
                    value={formState.keyHighlight}
                    onChange={(e) => setFormState({ ...formState, keyHighlight: e.target.value })}
                    placeholder="e.g. Multi-Matrix Screening"
                    className={`w-full p-2.5 rounded-xl border text-xs ${inputBg}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                    Primary Instrumentation
                  </label>
                  <input
                    type="text"
                    value={formState.instrumentation}
                    onChange={(e) => setFormState({ ...formState, instrumentation: e.target.value })}
                    placeholder="e.g. Orbitrap LC-HRMS • EPA 533"
                    className={`w-full p-2.5 rounded-xl border text-xs ${inputBg}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                    Detection Benchmark Limit
                  </label>
                  <input
                    type="text"
                    value={formState.detectionMetric}
                    onChange={(e) => setFormState({ ...formState, detectionMetric: e.target.value })}
                    placeholder="e.g. < 0.1 ppt Detection Limit"
                    className={`w-full p-2.5 rounded-xl border text-xs ${inputBg}`}
                  />
                </div>
              </div>

              {/* Target Matrices */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                  Target Matrices &amp; Ecosystem Substrates
                </label>
                <input
                  type="text"
                  value={formState.targetMatrices}
                  onChange={(e) => setFormState({ ...formState, targetMatrices: e.target.value })}
                  placeholder="e.g. Soil sediment cores, agricultural runoff, groundwater"
                  className={`w-full p-2.5 rounded-xl border text-xs ${inputBg}`}
                />
              </div>

              {/* Tags Input */}
              <div className="space-y-1.5">
                <label className={`text-xs font-bold uppercase tracking-wider ${titleText}`}>
                  Research Topic Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Trace Metals, PFAS Analysis, Soil Depth, Bioaccumulation"
                  className={`w-full p-2.5 rounded-xl border text-xs ${inputBg}`}
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#34D399] text-[#04150C] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md shadow-emerald-500/25 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>{editingId ? "Save Changes" : "Create Pillar"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
