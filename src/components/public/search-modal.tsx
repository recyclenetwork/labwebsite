"use client";

import * as React from "react";
import {
  Search,
  X,
  ArrowRight,
  BookOpen,
  FolderGit2,
  Users,
  FileText,
  FlaskConical,
  GraduationCap,
  Mail,
  Info,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { DeveloperWatermark, isCreatorQuery } from "./developer-watermark";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchableItem {
  title: string;
  category: string;
  description: string;
  href: string;
  icon: React.ElementType;
  keywords: string[];
}

const SEARCHABLE_ITEMS: SearchableItem[] = [
  {
    title: "Microplastics & Nanoplastics Research",
    category: "Research Area",
    description: "Investigation of synthetic polymer pollution, trophic transfer, and marine/freshwater risks.",
    href: "/research",
    icon: FlaskConical,
    keywords: ["microplastics", "plastic", "polymers", "particles", "research", "ocean", "river"],
  },
  {
    title: "Heavy Metals & Chemical Toxicology",
    category: "Research Area",
    description: "Trace elemental dynamics, arsenic, cadmium, lead speciation, and bioaccumulation pathways.",
    href: "/research",
    icon: FlaskConical,
    keywords: ["heavy metals", "toxicology", "lead", "cadmium", "arsenic", "toxicity", "chemical"],
  },
  {
    title: "Ongoing Field Projects & Grants",
    category: "Projects",
    description: "Active research projects, field monitoring programs, and institutional grant studies.",
    href: "/projects",
    icon: FolderGit2,
    keywords: ["projects", "grants", "field", "studies", "monitoring", "investigation"],
  },
  {
    title: "Research Team & Faculty Directorship",
    category: "People",
    description: "Principal investigators, postdoctoral scholars, graduate fellows, and research assistants.",
    href: "/team",
    icon: Users,
    keywords: ["team", "faculty", "people", "students", "researchers", "pi", "director", "professor", "members"],
  },
  {
    title: "Peer-Reviewed Publications & Datasets",
    category: "Publications",
    description: "Full repository of journal articles, citations, open datasets, and scientific preprints.",
    href: "/publications",
    icon: FileText,
    keywords: ["publications", "papers", "articles", "journals", "doi", "literature", "citations"],
  },
  {
    title: "Lab News & Scientific Insights",
    category: "News",
    description: "Breakthrough announcements, expedition photos, conference presentations, and awards.",
    href: "/news",
    icon: BookOpen,
    keywords: ["news", "articles", "updates", "insights", "announcements", "events"],
  },
  {
    title: "About Our Laboratory & Mission",
    category: "About",
    description: "Department of Environmental Sciences facilities, analytical equipment, and scientific ethos.",
    href: "/about",
    icon: Info,
    keywords: ["about", "mission", "equipment", "facilities", "institution", "jahangirnagar", "history"],
  },
  {
    title: "Contact & Academic Collaborations",
    category: "Contact",
    description: "Get in touch for institutional partnerships, analytical sample testing, or lab visits.",
    href: "/contact",
    icon: Mail,
    keywords: ["contact", "email", "address", "phone", "collaborate", "location", "inquiry"],
  },
  {
    title: "Opportunities & Graduate Admissions",
    category: "Opportunities",
    description: "Open M.Sc/Ph.D research positions, postdoctoral fellowships, and RA vacancies.",
    href: "/opportunities",
    icon: GraduationCap,
    keywords: ["opportunities", "jobs", "careers", "admissions", "fellowship", "phd", "msc", "apply"],
  },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    } else {
      setQuery("");
    }
  }, [isOpen, onClose]);

  const isSecret = isCreatorQuery(query);

  const filteredItems = React.useMemo(() => {
    if (!query.trim() || isSecret) return [];
    const q = query.toLowerCase().trim();
    return SEARCHABLE_ITEMS.filter((item) => {
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchCategory = item.category.toLowerCase().includes(q);
      const matchDesc = item.description.toLowerCase().includes(q);
      const matchKeywords = item.keywords.some((k) => k.includes(q));
      return matchTitle || matchCategory || matchDesc || matchKeywords;
    });
  }, [query, isSecret]);

  if (!isOpen) return null;

  const quickLinks = [
    { label: "Microplastics Research", href: "/research", icon: BookOpen },
    { label: "Ongoing Field Projects", href: "/projects", icon: FolderGit2 },
    { label: "Research Team & Faculty", href: "/team", icon: Users },
    { label: "Recent Publications", href: "/publications", icon: FileText },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="fixed inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl rounded-3xl theme-card border border-slate-200/80 dark:border-slate-800 shadow-2xl p-5 sm:p-6 overflow-hidden z-10 max-h-[85vh] flex flex-col bg-white dark:bg-[#0B1120]">
        
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search research areas, publications, projects, people..."
            className="w-full bg-transparent text-base sm:text-lg focus:outline-none theme-text-main placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Modal Content Area */}
        <div className="py-5 overflow-y-auto flex-1 space-y-4 pr-1">
          
          {/* 1. SECRET WATERMARK / CREATOR SIGNATURE EASTER EGG */}
          {isSecret && (
            <div className="space-y-3">
              <DeveloperWatermark />
            </div>
          )}

          {/* 2. REGULAR SEARCH RESULTS */}
          {!isSecret && query.trim() !== "" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-scientific uppercase tracking-widest text-slate-400 pb-1">
                <span>Matching Results ({filteredItems.length})</span>
                <span>Press link to visit</span>
              </div>

              {filteredItems.length > 0 ? (
                <div className="space-y-2">
                  {filteredItems.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-start justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all group"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {item.category}
                            </span>
                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {item.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-2" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-2 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    No research topics or pages matched <span className="font-semibold text-slate-900 dark:text-white">"{query}"</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Try searching for <span className="underline">microplastics</span>, <span className="underline">projects</span>, <span className="underline">publications</span>, or <span className="underline">team</span>.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 3. DEFAULT QUICK EXPLORATIONS WHEN QUERY IS EMPTY */}
          {!isSecret && query.trim() === "" && (
            <div className="space-y-4">
              <p className="text-xs font-mono-scientific uppercase tracking-widest text-slate-400">
                Quick Explorations
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 hover:border-emerald-500/80 dark:hover:border-emerald-500/80 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                        <item.icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono-scientific">
          <span>Press ESC to close</span>
          <span>Laboratory Information System</span>
        </div>
      </div>
    </div>
  );
}
