"use client";

import React, { useState, useRef } from "react";
import { useAdminTheme } from "@/lib/admin-theme";
import {
  useGalleryItems,
  saveGalleryItem,
  deleteGalleryItem,
  GalleryItem,
  getCategoryBadgeColor
} from "@/lib/gallery-store";
import { safeCompressImage } from "@/lib/image-compression";
import {
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Search,
  CheckCircle,
  Loader2,
  MapPin,
  Calendar,
  UploadCloud,
  Layers,
  Filter,
  ExternalLink,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function AdminMediaPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";

  const { items, loading } = useGalleryItems();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formState, setFormState] = useState<GalleryItem>({
    id: "",
    title: "",
    category: "Field Expedition",
    location: "Chandpur & Meghna Estuary",
    date_text: "March 2026",
    description: "",
    image_url: "/images/gallery/field-sampling.jpg",
  });

  const cardBg = isLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0F172A] border-slate-800 shadow-md";
  const subText = isLight ? "text-slate-500" : "text-slate-400";
  const titleText = isLight ? "text-slate-900" : "text-white";
  const inputBg = isLight
    ? "bg-slate-50 border-slate-200 text-slate-900 focus:bg-white focus:border-emerald-500"
    : "bg-[#090D16] border-slate-700 text-white focus:border-emerald-400";

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setFormState({
      id: "",
      title: "",
      category: "Field Expedition",
      location: "",
      date_text: "2026",
      description: "",
      image_url: "/images/gallery/field-sampling.jpg",
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item: GalleryItem) => {
    setFormState({
      id: item.id,
      title: item.title,
      category: item.category,
      location: item.location || "",
      date_text: item.date_text || "",
      description: item.description || "",
      image_url: item.image_url,
    });
    setShowModal(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      // 1. Primary: Upload directly to Supabase Storage 'media' bucket
      const formPayload = new FormData();
      formPayload.append("file", file);
      formPayload.append("folder", "gallery");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formPayload,
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url) {
          setFormState((prev) => ({ ...prev, image_url: json.url }));
          setUploadingImage(false);
          return;
        }
      }
    } catch (netErr) {
      console.warn("Storage upload error, using local compression fallback:", netErr);
    }

    // 2. Reliable Fallback: Safe local compression if network/server is offline
    try {
      const compressed = await safeCompressImage(file, {
        maxWidth: 1600,
        maxHeight: 1600,
        quality: 0.85,
      });
      setFormState((prev) => ({ ...prev, image_url: compressed }));
    } catch (err) {
      console.error("Failed to compress image:", err);
      alert("Failed to process image file");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.title.trim() || !formState.image_url.trim()) {
      alert("Please provide both a Title and an Image URL or Upload.");
      return;
    }

    setSaving(true);
    try {
      await saveGalleryItem({
        id: formState.id || undefined,
        title: formState.title.trim(),
        category: formState.category,
        location: formState.location?.trim() || "",
        date_text: formState.date_text?.trim() || "",
        description: formState.description?.trim() || "",
        image_url: formState.image_url.trim(),
      });
      setShowModal(false);
      showToast(formState.id ? "Gallery asset updated & synced to Homepage!" : "New media asset created & synced to Homepage!");
    } catch (err) {
      console.error("Save error:", err);
      showToast("Saved locally to gallery store.");
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media photo? It will be removed from the Homepage Gallery marquee as well.")) return;
    try {
      await deleteGalleryItem(id);
      showToast("Media photo deleted from gallery store.");
    } catch (err) {
      console.error(err);
    }
  };

  const categories = [
    "All",
    "Field Expedition",
    "Laboratory Analysis",
    "Microscopy & Imaging",
    "Symposium & Seminar",
    "Community & Outreach",
    "Campus & Facilities"
  ];

  const filteredItems = items.filter((item) => {
    const matchesCat = selectedCategory === "All" || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-xl shadow-emerald-600/30 text-xs font-semibold animate-in slide-in-from-bottom-5">
          <CheckCircle className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h1 className={`text-xl font-bold tracking-tight ${titleText}`}>Media &amp; Event Gallery</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-500 border border-emerald-500/20">
              {items.length} Active Photos
            </span>
          </div>
          <p className={`text-xs ${subText} mt-1`}>
            Manage field expedition photography, instrumentation showcases, and symposium gallery highlights. Live synced with Homepage Marquee.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/#gallery"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-300 font-semibold text-xs transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>View Live Marquee</span>
          </Link>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Upload Media Asset</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-emerald-400">Live Homepage Sync Active:</span>{" "}
            <span className={subText}>All media uploaded here appears in the continuous sliding marquee on the homepage under &ldquo;Event Showcase &amp; Field Gallery&rdquo;.</span>
          </div>
        </div>
        <Link
          href="/admin/landing"
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 shrink-0"
        >
          Edit Gallery Headlines in Tab 11 &rarr;
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                  : isLight
                  ? "bg-white border border-slate-200 text-slate-600 hover:border-slate-300"
                  : "bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:border-slate-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search photos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3.5 py-2 rounded-xl border text-xs outline-none ${inputBg}`}
          />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
          <span className="text-xs font-medium">Loading media assets...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className={`p-12 text-center rounded-2xl border ${cardBg} space-y-3`}>
          <ImageIcon className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
          <h3 className={`text-sm font-bold ${titleText}`}>No media photos found</h3>
          <p className={`text-xs ${subText} max-w-sm mx-auto`}>
            {searchQuery ? "No assets match your search terms." : "No assets in this category. Click 'Upload Media Asset' to add your first photo."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredItems.map((item) => {
            const badgeStyle = getCategoryBadgeColor(item.category);
            return (
              <div
                key={item.id}
                className={`rounded-2xl border ${cardBg} overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition-all duration-300 shadow-sm`}
              >
                <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/gallery/field-sampling.jpg";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-md ${badgeStyle}`}>
                    {item.category}
                  </span>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className={`text-xs font-bold leading-snug ${titleText} group-hover:text-emerald-500 transition-colors line-clamp-2`}>
                      {item.title}
                    </h3>
                    {item.location && (
                      <div className={`flex items-center gap-1.5 text-[11px] ${subText} mt-1.5`}>
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                    )}
                    {item.description && (
                      <p className={`text-[11px] ${subText} mt-1.5 line-clamp-2 leading-relaxed opacity-85`}>
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className={`text-[10px] font-mono ${subText} flex items-center gap-1`}>
                      <Calendar className="w-3 h-3" />
                      {item.date_text || "2026"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        title="Edit Photo"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                        title="Delete Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-xl p-6 rounded-3xl border ${cardBg} shadow-2xl animate-in zoom-in-95 max-h-[92vh] overflow-y-auto`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <h3 className={`text-base font-bold ${titleText}`}>
                  {formState.id ? "Edit Media Asset" : "Upload New Media Asset"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Photo Title */}
              <div>
                <label className={`block font-semibold mb-1 ${subText}`}>Title / Caption *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Meghna River Delta Aquatic Sampling"
                  value={formState.title}
                  onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${inputBg}`}
                />
              </div>

              {/* Image Upload / URL */}
              <div className="space-y-2">
                <label className={`block font-semibold ${subText}`}>Image File or URL *</label>
                
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-dashed border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-500 font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <UploadCloud className="w-4 h-4" />
                    )}
                    <span>Choose Image from Disk</span>
                  </button>

                  <span className={`text-[11px] ${subText} hidden sm:inline`}>or enter URL below</span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="https://... or /images/gallery/..."
                  value={formState.image_url}
                  onChange={(e) => setFormState({ ...formState, image_url: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-mono text-[11px] ${inputBg}`}
                />

                {/* Image Preview */}
                {formState.image_url && (
                  <div className="mt-2 relative h-36 w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black/40">
                    <img
                      src={formState.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/images/gallery/field-sampling.jpg";
                      }}
                    />
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-400 font-mono">
                      Image Preview
                    </div>
                  </div>
                )}
              </div>

              {/* Category & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block font-semibold mb-1 ${subText}`}>Category</label>
                  <select
                    value={formState.category}
                    onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${inputBg}`}
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
                    placeholder="e.g. Chandpur & Meghna Estuary"
                    value={formState.location || ""}
                    onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                    className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${inputBg}`}
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className={`block font-semibold mb-1 ${subText}`}>Date / Time Period</label>
                <input
                  type="text"
                  placeholder="e.g. March 2026 / Spring 2026"
                  value={formState.date_text || ""}
                  onChange={(e) => setFormState({ ...formState, date_text: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${inputBg}`}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block font-semibold mb-1 ${subText}`}>Description / Caption Details</label>
                <textarea
                  rows={2}
                  placeholder="Detailed context shown when clicking the photo in the homepage lightbox..."
                  value={formState.description || ""}
                  onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${inputBg}`}
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save &amp; Sync to Homepage</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
