import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ProjectWithRelations } from "@/lib/projects/types";
import {
  ArrowRight,
  Users,
  Building2,
  Calendar,
  Star,
  Award
} from "lucide-react";

interface ProjectCardProps {
  project: ProjectWithRelations;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  const formattedIndex = String(index + 1).padStart(2, "0");
  const fallbackImage = "/images/slide-1-field.jpg";
  let imageSrc = project.hero_image || project.featured_image || fallbackImage;
  if (imageSrc.includes("photo-1582719478250-c89cae4dc85b")) {
    imageSrc = "/images/slide-1-field.jpg";
  }

  const isOngoing = project.status === "ongoing";
  const isCompleted = project.status === "completed";

  return (
    <article className="group relative rounded-3xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 sm:p-7 md:p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-950/5 dark:hover:shadow-black/50 hover:border-emerald-700/40 dark:hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-0.5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
        {/* Left Column: Project Editorial Information */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Status & Meta Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-900/10 dark:border-emerald-800/60">
                #{formattedIndex}
              </span>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${
                  isOngoing
                    ? "bg-blue-50 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{project.status}</span>
              </span>

              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#090D16] px-3 py-1 rounded-lg border border-slate-200/60 dark:border-slate-800">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{project.year || "2025 — 2027"}</span>
              </div>
            </div>

            {project.is_featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                <span>Featured</span>
              </span>
            )}
          </div>

          {/* Project Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors font-[family-name:var(--font-manrope)] leading-snug tracking-tight">
            <Link href={`/projects/${project.slug}`}>
              {project.title}
            </Link>
          </h3>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 font-[family-name:var(--font-inter)]">
            {project.short_description}
          </p>

          {/* Research Areas Tagging */}
          <div className="space-y-1.5 pt-1">
            <div className="flex flex-wrap gap-1.5">
              {project.research_areas && project.research_areas.length > 0 ? (
                project.research_areas.map((ra) => (
                  <span
                    key={ra.id}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 border border-emerald-200/60 dark:border-emerald-800/60"
                  >
                    {ra.title}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">Ecotoxicology &amp; Environmental Sciences</span>
              )}
            </div>
          </div>

          {/* Metadata Row & CTA */}
          <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5" title="Assigned Researchers">
                <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Team: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{project.researchers?.length || 3}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5" title="Collaborating Partners">
                <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Partners: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{project.collaborators?.length || 2}</strong>
                </span>
              </div>
            </div>

            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-400 group/link hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
            >
              <span>View Project</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Right Column: Project Image */}
        <div className="lg:col-span-5">
          <Link href={`/projects/${project.slug}`} className="block group/img">
            <div className="relative aspect-[16/10] sm:aspect-[16/11] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 shadow-md">
              <Image
                src={imageSrc}
                alt={project.image_alt || project.title}
                fill
                className="object-cover group-hover/img:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 1024px) 100vw, 35vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300" />

              {/* Funding Badge Overlay */}
              {project.funding_org && (
                <div className="absolute bottom-3 left-3 right-3 text-xs font-medium text-white/95 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 truncate shadow-sm flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate">{project.funding_org}</span>
                </div>
              )}
            </div>
          </Link>
        </div>
      </div>
    </article>
  );
}
