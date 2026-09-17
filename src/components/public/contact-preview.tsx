"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Mail,
  Clock,
  Building2,
  Navigation,
  ShieldCheck,
  Send,
  Map as MapIcon,
  Layers,
} from "lucide-react";
import { SITE_CONFIG } from "@/constants";
import { useLandingData } from "@/lib/landing-store";

export function ContactPreview() {
  const { data: landingData } = useLandingData();
  const [viewMode, setViewMode] = React.useState<"aerial" | "map">("aerial");

  return (
    <section className="py-20 lg:py-28 bg-[#F4F8F5] dark:bg-[#0B1120] border-t border-slate-200/90 dark:border-slate-800 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10">
        <div className="rounded-3xl bg-white dark:bg-[#0F172A] border border-slate-200/90 dark:border-slate-800 p-8 sm:p-12 lg:p-14 shadow-2xl shadow-black/10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Direct Communication & Details */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200/80 dark:border-emerald-800/40 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-[#34D399] shadow-xs">
              <Send className="w-3.5 h-3.5 text-[#10B981]" />
              <span>{landingData?.contactSection?.badge || "Campus Location & Inquiries"}</span>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] leading-tight">
                {landingData?.contactSection?.title || "Reach our research team."}
              </h2>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal font-[family-name:var(--font-inter)]">
                {landingData?.contactSection?.subtitle ||
                  "Located at Jahangirnagar University campus in Savar, Dhaka. Whether inquiring about collaborative grant proposals, sample submission protocols, postdoctoral opportunities, or graduate admissions, our scientific team is ready to connect."}
              </p>
            </div>

            {/* Direct Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#047857] dark:text-[#34D399] uppercase tracking-wider">
                  <Building2 className="w-4 h-4" />
                  <span>Facility Location</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white font-[family-name:var(--font-inter)]">
                  {landingData?.contactSection?.facilityName || "Laboratory of Environmental Health and Ecotoxicology (LabEHE)"}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {landingData?.contactSection?.address || "Jahangirnagar University, Savar"}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8FAF9] dark:bg-[#0B1120] border border-slate-200/80 dark:border-slate-800 space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#047857] dark:text-[#34D399] uppercase tracking-wider">
                  <Mail className="w-4 h-4" />
                  <span>Direct Correspondence</span>
                </div>
                <a
                  href={`mailto:${landingData?.contactSection?.email || SITE_CONFIG.email}`}
                  className="text-xs sm:text-sm font-semibold text-[#14532D] dark:text-[#34D399] hover:underline block truncate font-[family-name:var(--font-inter)]"
                >
                  {landingData?.contactSection?.email || SITE_CONFIG.email}
                </a>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {landingData?.contactSection?.phone || "Response within 24 business hours"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-[#14532D] hover:bg-[#166534] dark:bg-[#10B981] dark:hover:bg-[#34D399] text-white dark:text-slate-900 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md active:scale-95"
              >
                <span>Submit Collaboration Inquiry</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>

              <a
                href="https://maps.google.com/?q=Department+of+Environmental+Sciences,+Jahangirnagar+University,+Savar,+Dhaka"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0F172A] text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:border-[#10B981] transition-colors"
              >
                <MapPin className="w-4 h-4 text-[#10B981]" />
                <span>Open in Google Maps ↗</span>
              </a>
            </div>
          </div>

          {/* Right Column: Google Map & Campus Aerial Card */}
          <div className="lg:col-span-7 rounded-3xl bg-gradient-to-br from-[#064E3B] via-[#0F172A] to-[#090D16] text-white p-5 sm:p-7 space-y-5 shadow-2xl relative overflow-hidden border border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-semibold uppercase text-emerald-200">
                <Navigation className="w-3.5 h-3.5 text-[#34D399]" />
                <span>{landingData?.contactSection?.facilityName || "Laboratory of Environmental Health and Ecotoxicology (LabEHE)"}</span>
              </div>

              <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setViewMode("aerial")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "aerial"
                      ? "bg-[#10B981] text-[#021008] shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Aerial Campus</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("map")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === "map"
                      ? "bg-[#10B981] text-[#021008] shadow-sm"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Google Map</span>
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] sm:aspect-[16/9] border border-white/15 bg-[#021008] shadow-inner group">
              {viewMode === "aerial" ? (
                <>
                  <img
                    src={landingData?.contactSection?.aerialImageSrc || "/images/jahangirnagar-campus.jpg"}
                    alt="Jahangirnagar University Campus aerial view"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.src.includes("jahangirnagar-campus.jpg")) {
                        target.src = "/images/jahangirnagar-campus.jpg";
                      } else {
                        target.src = "/images/jahangirnagar-campus-map.jpg";
                      }
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 filter brightness-[0.95]"
                  />
                  <div className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-emerald-400 text-white shadow-xl animate-bounce">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                    <span className="text-[11px] font-bold text-white tracking-wide">
                      {landingData?.contactSection?.facilityName || "Laboratory of Environmental Health and Ecotoxicology (LabEHE)"}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between p-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/15 text-xs text-white">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#34D399]" />
                      <span className="font-semibold text-white truncate max-w-[280px]">
                        {landingData?.contactSection?.address || "Savar, Dhaka-1342, Bangladesh"}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-emerald-300 hidden sm:inline-block">
                      {landingData?.contactSection?.gpsCoordinates || "23.8824° N, 90.2671° E"}
                    </span>
                  </div>
                </>
              ) : (
                <iframe
                  title="Jahangirnagar University Google Map"
                  src={landingData?.contactSection?.mapEmbedUrl || "https://maps.google.com/maps?q=Department+of+Environmental+Sciences,+Jahangirnagar+University,+Savar,+Dhaka,+Bangladesh&t=&z=16&ie=UTF8&iwloc=&output=embed"}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3.5 rounded-xl bg-black/35 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#34D399] uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Research Facility Hub</span>
                </div>
                <p className="text-slate-200">
                  {landingData.contactSection?.facilityName || "Clean-room Orbitrap LC-HRMS & aquatic bioassay vivariums."}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-black/35 border border-white/10 space-y-1">
                <div className="flex items-center gap-2 font-bold text-[#34D399] uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Lab Operating Hours</span>
                </div>
                <p className="text-slate-200">
                  {landingData.contactSection?.hours || "Sun – Thu 09:00 – 17:00 • Environmental Science Bldg"}
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
