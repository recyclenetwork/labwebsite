"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Camera,
  Layers
} from "lucide-react";

interface ProjectGalleryProps {
  images?: string[] | null;
  projectTitle: string;
}


export function ProjectGallery({ images, projectTitle }: ProjectGalleryProps) {
  const [activeLightboxIndex, setActiveLightboxIndex] = useState<number | null>(null);

  // Filter valid image strings
  const validCustomImages = (images || []).filter((img) => typeof img === "string" && img.trim().length > 0);

  // Merge up to 4 images
  const displayImages = validCustomImages.slice(0, 4).map((url, idx) => ({
    url,
    caption: `Project Visual Artifact 0${idx + 1} • ${projectTitle}`,
  }));

  if (displayImages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 pt-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 font-bold">
            <Camera className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fieldwork &amp; Visual Artifacts</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] tracking-tight">
            Research Imagery &amp; Laboratory Documentation
          </h2>
        </div>

        <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 w-fit">
          {displayImages.length} Visual Artifacts
        </span>
      </div>

      {/* 4-Image Modern Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
        {displayImages.map((item, idx) => (
          <div
            key={idx}
            onClick={() => setActiveLightboxIndex(idx)}
            className="group relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 bg-slate-900 aspect-[16/10] cursor-pointer shadow-md transition-all duration-500 hover:shadow-2xl hover:border-emerald-500/60"
          >
            {/* Image */}
            <Image
              src={item.url}
              alt={item.caption}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.96]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            />

            {/* Gradient Scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

            {/* Top Index Badge */}
            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md text-white text-[11px] font-mono font-bold border border-white/20 shadow-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>PHOTO 0{idx + 1}</span>
              </span>
            </div>

            {/* Top Right Zoom Icon */}
            <div className="absolute top-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-100 scale-90">
              <div className="w-8 h-8 rounded-xl bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow">
                <Maximize2 className="w-4 h-4 text-emerald-300" />
              </div>
            </div>

            {/* Bottom Caption */}
            <div className="absolute bottom-3.5 left-3.5 right-3.5 z-10 text-white space-y-1">
              <p className="text-xs sm:text-[13px] font-medium text-slate-100 line-clamp-2 leading-snug drop-shadow-sm">
                {item.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {activeLightboxIndex !== null && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveLightboxIndex(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] flex flex-col items-center justify-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white px-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {activeLightboxIndex + 1} / {displayImages.length}
                </span>
                <span className="text-sm font-semibold truncate max-w-md hidden sm:inline text-slate-300">
                  {displayImages[activeLightboxIndex].caption}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setActiveLightboxIndex(null)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Close Lightbox"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Lightbox Image Display */}
            <div className="relative w-full aspect-[16/10] max-h-[70vh] rounded-3xl overflow-hidden bg-black/60 border border-white/10 shadow-2xl">
              <Image
                src={displayImages[activeLightboxIndex].url}
                alt={displayImages[activeLightboxIndex].caption}
                fill
                className="object-contain"
                sizes="(max-width: 1280px) 100vw, 1200px"
              />

              {/* Navigation Arrows */}
              {displayImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveLightboxIndex((prev) =>
                        prev !== null ? (prev === 0 ? displayImages.length - 1 : prev - 1) : 0
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition cursor-pointer"
                    title="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveLightboxIndex((prev) =>
                        prev !== null ? (prev === displayImages.length - 1 ? 0 : prev + 1) : 0
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition cursor-pointer"
                    title="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom Caption on Mobile */}
            <div className="text-center text-xs text-slate-300 px-4 max-w-xl">
              {displayImages[activeLightboxIndex].caption}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
