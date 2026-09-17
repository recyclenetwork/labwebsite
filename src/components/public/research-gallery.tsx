"use client";

import * as React from "react";
import {
  Maximize2,
  X,
  MapPin,
  Calendar,
} from "lucide-react";
import { useLandingData } from "@/lib/landing-store";
import { useGalleryItems, getCategoryBadgeColor, GalleryItem } from "@/lib/gallery-store";

export function ResearchGallery() {
  const { data: landingData } = useLandingData();
  const { items: galleryItems } = useGalleryItems();
  const [selectedItem, setSelectedItem] = React.useState<GalleryItem | null>(null);
  const [isPaused, setIsPaused] = React.useState(false);

  // Multiply items to ensure continuous infinite scrolling across all screen widths
  const marqueeItems = React.useMemo(() => {
    if (!galleryItems || galleryItems.length === 0) return [];
    if (galleryItems.length < 4) {
      return [...galleryItems, ...galleryItems, ...galleryItems, ...galleryItems];
    }
    return [...galleryItems, ...galleryItems, ...galleryItems];
  }, [galleryItems]);

  return (
    <section className="py-20 lg:py-28 bg-[#040B07] text-white relative overflow-hidden transition-colors duration-300 w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[450px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 text-center space-y-2.5 mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#10B981]">
          <span>{landingData?.gallerySection?.badge || "VISUAL ARCHIVE"}</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-[family-name:var(--font-manrope)]">
          {landingData?.gallerySection?.title || "Event Showcase & Field Gallery"}
        </h2>
        {landingData?.gallerySection?.subtitle && (
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-[family-name:var(--font-inter)]">
            {landingData.gallerySection.subtitle}
          </p>
        )}
      </div>

      {/* Marquee Track */}
      {marqueeItems.length > 0 ? (
        <div
          className="relative w-full overflow-hidden py-4 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-40 bg-gradient-to-r from-[#040B07] to-transparent z-20" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-40 bg-gradient-to-l from-[#040B07] to-transparent z-20" />

          <div
            className="animate-marquee-scroll flex items-center gap-6 sm:gap-8 group-hover:[animation-play-state:paused]"
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
          >
            {marqueeItems.map((item, index) => {
              const badgeStyle = getCategoryBadgeColor(item.category);
              return (
                <div
                  key={`${item.id}-${index}`}
                  onClick={() => setSelectedItem(item)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  className="flex-shrink-0 w-[340px] sm:w-[440px] md:w-[500px] lg:w-[540px] aspect-[16/10] rounded-3xl overflow-hidden relative group/card cursor-pointer border border-white/10 hover:border-[#10B981] transition-all duration-300 shadow-2xl bg-[#0a180f]"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700 filter brightness-[0.92]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/images/gallery/field-sampling.jpg";
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shadow-md ${badgeStyle}`}
                    >
                      {item.category}
                    </span>
                  </div>

                  <div className="absolute bottom-5 left-5 right-5 z-10 text-left space-y-1.5">
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white leading-snug group-hover/card:text-[#34D399] transition-colors drop-shadow-md font-[family-name:var(--font-manrope)]">
                      {item.title}
                    </h3>
                    {(item.location || item.date_text) && (
                      <p className="text-xs sm:text-sm text-slate-300 font-medium opacity-90 font-[family-name:var(--font-inter)] flex items-center gap-2">
                        {item.location && <span>{item.location}</span>}
                        {item.location && item.date_text && <span>•</span>}
                        {item.date_text && <span>{item.date_text}</span>}
                      </p>
                    )}
                  </div>

                  <div className="absolute top-4 right-4 opacity-0 group-hover/card:opacity-100 transition-opacity z-10">
                    <div className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md text-white flex items-center justify-center border border-white/20 shadow-lg">
                      <Maximize2 className="w-4 h-4 text-[#34D399]" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-500 text-sm">
          No media photos uploaded yet. Upload assets in Admin → Media Library.
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="max-w-4xl w-full rounded-3xl overflow-hidden bg-[#041B10] border border-emerald-500/30 shadow-2xl text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[16/10] bg-black">
              <img
                src={selectedItem.image_url}
                alt={selectedItem.title}
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/gallery/field-sampling.jpg";
                }}
              />
              <button
                type="button"
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black text-white border border-white/20 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-3 bg-[#021008] border-t border-emerald-950 font-[family-name:var(--font-inter)]">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getCategoryBadgeColor(selectedItem.category)}`}
                >
                  {selectedItem.category}
                </span>
                {selectedItem.date_text && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {selectedItem.date_text}
                  </span>
                )}
                {selectedItem.location && (
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                    {selectedItem.location}
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white font-[family-name:var(--font-manrope)]">
                {selectedItem.title}
              </h3>
              {selectedItem.description && (
                <p className="text-sm text-slate-300 leading-relaxed">
                  {selectedItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

