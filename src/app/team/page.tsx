"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { TeamHero } from "@/components/public/team/team-hero";
import { PIShowcase } from "@/components/public/team/pi-showcase";
import { TeamCarouselRow } from "@/components/public/team/team-carousel-row";
import { MemberDetailModal } from "@/components/public/team/member-detail-modal";
import { getTeamMembers, getCachedTeamMembers } from "@/lib/team/store";
import { TeamMember } from "@/lib/team/types";
import {
  Users,
  Sparkles,
  ArrowRight,
  GraduationCap,
  Mail,
  Layers,
  BookOpen,
} from "lucide-react";

export default function TeamPage() {
  const [members, setMembers] = React.useState<TeamMember[]>(() => getCachedTeamMembers());
  const [loading, setLoading] = React.useState(() => getCachedTeamMembers().length === 0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeFilter, setActiveFilter] = React.useState("all");
  const [selectedMember, setSelectedMember] = React.useState<TeamMember | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const data = await getTeamMembers();
        setMembers(data);
      } catch (e) {
        console.error("Failed to fetch team members", e);
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener("team-members-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("team-members-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Filtered members
  const filtered = React.useMemo(() => {
    let list = members.filter((m) => m.isActive !== false);

    if (activeFilter !== "all") {
      list = list.filter((m) => m.category === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.role.toLowerCase().includes(q) ||
          m.bio?.toLowerCase().includes(q) ||
          m.researchInterests.some((r) => r.toLowerCase().includes(q)) ||
          m.undergradThesis?.toLowerCase().includes(q) ||
          m.mscThesis?.toLowerCase().includes(q) ||
          m.phdThesis?.toLowerCase().includes(q) ||
          m.thesisTopic?.toLowerCase().includes(q) ||
          m.currentPosition?.toLowerCase().includes(q) ||
          m.currentInstitution?.toLowerCase().includes(q)
      );
    }

    return list;
  }, [members, activeFilter, searchQuery]);

  const piMember = members.find((m) => m.category === "pi") || members[0];
  const undergradMembers = filtered.filter((m) => m.category === "undergraduate");
  const gradMembers = filtered.filter((m) => m.category === "graduate");
  const phdMembers = filtered.filter((m) => m.category === "phd");
  const alumniMembers = filtered.filter((m) => m.category === "alumni");

  // Metric counts
  const totalCount = members.filter((m) => m.isActive !== false).length;
  const piCount = members.filter((m) => m.category === "pi").length;
  const undergradCount = members.filter((m) => m.category === "undergraduate").length;
  const gradCount = members.filter((m) => m.category === "graduate").length;
  const phdCount = members.filter((m) => m.category === "phd").length;
  const alumniCount = members.filter((m) => m.category === "alumni").length;

  const showPI =
    (activeFilter === "all" || activeFilter === "pi") &&
    (!searchQuery.trim() || filtered.some((m) => m.id === piMember?.id));

  return (
    <div className="min-h-screen bg-[#F8FAF9] dark:bg-[#060913] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-black transition-colors duration-300">
      <Navbar />

      <main className="flex-1">
        {/* Team Hero with live stats & filters */}
        <TeamHero
          totalCount={totalCount}
          piCount={piCount}
          undergradCount={undergradCount}
          gradCount={gradCount}
          phdCount={phdCount}
          alumniCount={alumniCount}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        {/* Content Body */}
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 py-12 sm:py-16 space-y-16">
          
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-slate-500">Loading research team roster...</p>
            </div>
          ) : (
            <>
              {/* 1. PRINCIPAL INVESTIGATOR SHOWCASE */}
              {showPI && piMember && (
                <PIShowcase pi={piMember} />
              )}

              {/* 2. UNDERGRADUATE MEMBERS */}
              {(activeFilter === "all" || activeFilter === "undergraduate") && undergradMembers.length > 0 && (
                <TeamCarouselRow
                  id="section-undergraduate"
                  category="undergraduate"
                  members={undergradMembers}
                  onSelectMember={setSelectedMember}
                />
              )}

              {/* 3. GRADUATE MEMBERS (M.SC.) */}
              {(activeFilter === "all" || activeFilter === "graduate") && gradMembers.length > 0 && (
                <TeamCarouselRow
                  id="section-graduate"
                  category="graduate"
                  members={gradMembers}
                  onSelectMember={setSelectedMember}
                />
              )}

              {/* 4. POSTDOC & PHD RESEARCHERS */}
              {(activeFilter === "all" || activeFilter === "phd") && phdMembers.length > 0 && (
                <TeamCarouselRow
                  id="section-phd"
                  category="phd"
                  members={phdMembers}
                  onSelectMember={setSelectedMember}
                />
              )}

              {/* 5. ALUMNI NETWORK */}
              {(activeFilter === "all" || activeFilter === "alumni") && alumniMembers.length > 0 && (
                <TeamCarouselRow
                  id="section-alumni"
                  category="alumni"
                  members={alumniMembers}
                  onSelectMember={setSelectedMember}
                />
              )}

              {/* Empty Search Fallback */}
              {filtered.length === 0 && (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 space-y-3">
                  <Users className="w-8 h-8 mx-auto text-slate-400" />
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Team Members Found</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    We couldn't find any researchers matching "{searchQuery}". Try searching by another keyword or resetting the filter.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setActiveFilter("all");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400 transition cursor-pointer"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* 6. JOIN OUR RESEARCH GROUP / OPPORTUNITIES CTA */}
              <div className="rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 p-8 sm:p-12 text-slate-900 dark:text-white relative overflow-hidden shadow-xl shadow-slate-950/5 dark:shadow-black/20">
                <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                  <div className="space-y-3 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Join The Laboratory</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-[family-name:var(--font-manrope)]">
                      Interested in Conducting Research With Us?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      We regularly recruit enthusiastic doctoral fellows, postdoctoral scholars, graduate students, and undergraduate research assistants. Explore active opportunities or submit an informal inquiry.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    <Link
                      href="/news"
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs tracking-wider uppercase transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <span>Explore Openings</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      href="/about#contact"
                      className="px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-[#0F172A] hover:bg-slate-200 dark:hover:bg-[#1E293B] border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs tracking-wider uppercase transition flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4 text-emerald-500" />
                      <span>Contact PI</span>
                    </Link>
                  </div>
                </div>
              </div>

            </>
          )}

        </div>
      </main>

      {/* Member Details Modal */}
      <MemberDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />

      <Footer />
    </div>
  );
}
