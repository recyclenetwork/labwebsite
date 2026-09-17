"use client";

import * as React from "react";
import Link from "next/link";
import { FlaskConical, ArrowUpRight, Globe, Shield, ExternalLink, MapPin } from "lucide-react";
import { SITE_CONFIG } from "@/constants";
import { useLandingData } from "@/lib/landing-store";

export function Footer() {
  const { data: landingData } = useLandingData();

  return (
    <footer className="bg-[#060A11] text-white pt-16 lg:pt-24 pb-12 border-t border-slate-800 relative overflow-hidden">
      {/* Deep subtle gradient mesh & glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#34D399_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12 relative z-10 space-y-14 sm:space-y-16">
        {/* Top Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-12">
          
          {/* Left 2 Cols: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <Link href="/" className="flex items-center gap-3.5 group w-fit">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#14532D] to-[#10B981] flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform shrink-0">
                <FlaskConical className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[15px] sm:text-base tracking-tight text-white leading-tight">
                  {landingData?.footer?.labName || "Laboratory of Environmental Health and Ecotoxicology (LabEHE)"}
                </span>
                <span className="text-xs text-[#34D399] font-semibold mt-0.5">
                  Department of Environmental Sciences
                </span>
              </div>
            </Link>

            <p className="text-sm text-slate-300 leading-relaxed max-w-sm pt-2">
              {landingData?.footer?.description ||
                "Rigorous empirical science for healthier environments. Investigating contaminant pathways, exposure kinetics, biological resilience, and circular ecosystem solutions."}
            </p>

            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-300/80 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#10B981] flex-shrink-0" />
              <span>{landingData?.contactSection?.address || SITE_CONFIG.location}</span>
            </div>
          </div>

          {/* Col 3: Research Programs */}
          <div className="space-y-3.5 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#34D399]">
              Research Programs
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/research" className="text-slate-300 hover:text-white transition-colors">
                  Research Pillars &amp; Focus
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-slate-300 hover:text-white transition-colors">
                  Completed &amp; Active Grants
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-slate-300 hover:text-white transition-colors">
                  Research Team &amp; Leadership
                </Link>
              </li>
              <li>
                <Link href="/publications" className="text-slate-300 hover:text-white transition-colors">
                  Peer Publications &amp; Datasets
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Opportunities & Admissions */}
          <div className="space-y-3.5 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#34D399]">
              Engagement &amp; RA
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/opportunities" className="text-slate-300 hover:text-white transition-colors">
                  Postdoctoral Fellowships
                </Link>
              </li>
              <li>
                <Link href="/opportunities#apply" className="text-slate-300 hover:text-white transition-colors">
                  Graduate Research Assistantships
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Research Collaboration Inquiries
                </Link>
              </li>
              <li>
                <Link href="/news" className="text-slate-300 hover:text-white transition-colors">
                  Lab News &amp; Breakthroughs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Academic Links & Registry */}
          <div className="space-y-3.5 text-left">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#34D399]">
              Academic Registry
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://scholar.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <span>Google Scholar</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://orcid.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <span>ORCID Registry</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <span>Scientific Network</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <Link href="/admin" className="text-emerald-400/80 hover:text-emerald-300 text-xs font-semibold pt-1 block">
                  Staff &amp; Researcher Portal →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Institutional Governance */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            {landingData?.footer?.copyrightText ||
              `© ${new Date().getFullYear()} ${landingData?.footer?.labName || SITE_CONFIG.name}. All rights reserved.`}
          </div>

          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              Institutional Ethics &amp; IRB
            </Link>
            <Link href="/contact" className="hover:text-slate-200 transition-colors">
              Data Governance
            </Link>
            <Link href="/about" className="hover:text-slate-200 transition-colors">
              Bio-Safety Protocols
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
