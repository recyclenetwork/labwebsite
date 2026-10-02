"use client";

import * as React from "react";
import { TeamMember, PICurriculumVitae } from "@/lib/team/types";
import {
  X,
  Download,
  Printer,
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
  pi: TeamMember;
}

export function CVModal({ isOpen, onClose, pi }: CVModalProps) {
  if (!isOpen || !pi) return null;

  const cv = pi.curriculumVitae;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-300 dark:border-slate-800 shadow-2xl z-10 flex flex-col text-slate-900 dark:text-slate-100">
        
        {/* Modal Top Action Bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Academic Curriculum Vitae
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {pi.name} • {pi.role}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-500" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable CV Document Body */}
        <div className="p-6 sm:p-10 space-y-8 print:p-0 print:space-y-6">
          
          {/* Document Header */}
          <div className="pb-6 border-b-2 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Academic Credentials</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-[family-name:var(--font-manrope)]">
                {pi.name}
              </h1>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                {pi.role}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {pi.department}, {pi.affiliation}
              </p>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-[#0F172A] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 sm:w-80 shrink-0">
              {pi.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{pi.email}</span>
                </div>
              )}
              {pi.officeLocation && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{pi.officeLocation}</span>
                </div>
              )}
              {pi.orcid && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#A6CE39]">ORCID:</span>
                  <span>{pi.orcid}</span>
                </div>
              )}
            </div>
          </div>

          {/* Executive Summary */}
          {cv?.summary && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Executive Summary</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {cv.summary}
              </p>
            </div>
          )}

          {/* 1. Education */}
          {cv?.education && cv.education.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-emerald-500" />
                <span>Education &amp; Academic Training</span>
              </h3>
              <div className="space-y-3">
                {cv.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {edu.degree}
                      </h4>
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {edu.year}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {edu.institution}
                    </div>
                    {edu.details && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 pt-0.5 italic">
                        {edu.details}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Academic Appointments */}
          {cv?.appointments && cv.appointments.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-500" />
                <span>Academic &amp; Professional Appointments</span>
              </h3>
              <div className="space-y-2.5">
                {cv.appointments.map((app, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 gap-2 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{app.role}</div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {app.department ? `${app.department}, ` : ""}
                        {app.institution}
                      </div>
                    </div>
                    <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                      {app.period}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Competitive Research Grants */}
          {cv?.grants && cv.grants.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-500" />
                <span>Selected Competitive Research Grants ($2.8M+ Total)</span>
              </h3>
              <div className="space-y-3">
                {cv.grants.map((grant, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-1.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {grant.title}
                      </h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] border border-emerald-500/20 shrink-0">
                        {grant.amount}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                      <span>Agency: {grant.fundingAgency}</span>
                      <span>•</span>
                      <span>Period: {grant.period}</span>
                      <span>•</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Role: {grant.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Selected High-Impact Publications */}
          {cv?.selectedPublications && cv.selectedPublications.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-500" />
                <span>Selected High-Impact Publications (from {pi.publicationsCount && Number(pi.publicationsCount) > 0 ? `${pi.publicationsCount}+` : "120+"} Peer Papers)</span>
              </h3>
              <div className="space-y-2.5">
                {cv.selectedPublications.map((pub, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                      {idx + 1}. {pub.title}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="font-medium italic">{pub.journal} ({pub.year})</span>
                      {pub.doi && (
                        <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                          DOI: {pub.doi}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Awards & Honors */}
          {cv?.awards && cv.awards.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>Honors, Fellowships &amp; Distinctions</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {cv.awards.map((award, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 text-xs"
                  >
                    <div className="font-bold text-slate-900 dark:text-white">{award.title}</div>
                    <div className="text-slate-500 dark:text-slate-400">{award.organization} ({award.year})</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Editorial & Professional Service */}
          {cv?.editorialService && cv.editorialService.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Editorial &amp; Reviewing Service
              </h3>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 dark:text-slate-300">
                {cv.editorialService.map((service, idx) => (
                  <li key={idx}>{service}</li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Official Academic CV • Jahangirnagar University Ecotox Lab</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition cursor-pointer"
          >
            Close Document
          </button>
        </div>

      </div>
    </div>
  );
}
