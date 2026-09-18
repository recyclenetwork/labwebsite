"use client";

import * as React from "react";
import Link from "next/link";
import { FlaskConical, ArrowRight, Share2, Sparkles, CheckCircle2 } from "lucide-react";

const ECOSYSTEM_NODES = [
  { id: "researchers", label: "Researchers", count: "", category: "People", description: "", href: "/people" },
  { id: "projects", label: "Active Projects", count: "", category: "Investigation", description: "", href: "/projects" },
  { id: "areas", label: "Research Areas", count: "", category: "Core Science", description: "", href: "/research" },
  { id: "publications", label: "Publications", count: "", category: "Evidence", description: "", href: "/publications" },
  { id: "collaborators", label: "Collaborators", count: "", category: "Global Network", description: "", href: "/about" },
];

export function ResearchEcosystem() {
  const [selectedNodeId, setSelectedNodeId] = React.useState<string>("researchers");

  const activeNode =
    ECOSYSTEM_NODES.find((node) => node.id === selectedNodeId) ||
    ECOSYSTEM_NODES[0];

  return (
    <section className="py-16 lg:py-24 bg-[#F4F8F5] dark:bg-[#0B1120] border-y border-slate-200 dark:border-slate-800 transition-colors duration-300 overflow-hidden">
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col space-y-3 max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#14532D]" />
            <span className="font-mono-scientific text-xs uppercase tracking-widest text-[#0F766E] font-bold">
              RESEARCH ECOSYSTEM
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight theme-text-main font-display-hero">
            How our research connects.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            Science at our laboratory operates as an integrated ecosystem where investigators,
            empirical field questions, peer-reviewed outputs, and policy partners continuously reinforce one another.
          </p>
        </div>

        {/* Interactive Visualization & Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Interactive Node Selector / Network Web */}
          <div className="lg:col-span-7 rounded-3xl theme-card border p-8 sm:p-10 shadow-lg relative">
            <div className="flex flex-col items-center justify-center space-y-8 py-6">
              {/* Central Core: LAB */}
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#14532D] text-white flex flex-col items-center justify-center shadow-xl shadow-[#14532D]/30 border-4 border-white dark:border-slate-800 z-10 animate-pulse">
                <FlaskConical className="w-8 h-8 mb-1" />
                <span className="font-black text-xs tracking-widest font-mono-scientific">
                  LAB CORE
                </span>
              </div>

              {/* Satellite Node Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 w-full pt-4">
                {ECOSYSTEM_NODES.map((node) => {
                  const isSelected = selectedNodeId === node.id;

                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? "bg-[#14532D] text-white border-[#14532D] shadow-md scale-105"
                          : "theme-card-inner border-current/10 hover:border-[#14532D] theme-text-main"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`font-mono-scientific text-[10px] uppercase tracking-wider ${
                            isSelected ? "text-[#84CC16]" : "text-[#0F766E]"
                          }`}
                        >
                          {node.category}
                        </span>
                        {isSelected && <Sparkles className="w-3 h-3 text-[#84CC16]" />}
                      </div>
                      <span className="font-bold text-sm block leading-tight">
                        {node.label}
                      </span>
                      <span
                        className={`text-[11px] font-mono-scientific mt-1 block ${
                          isSelected ? "text-white/80" : "text-[#52635A]"
                        }`}
                      >
                        {node.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right: Selected Node Detail Card */}
          <div className="lg:col-span-5 rounded-3xl theme-card border p-8 sm:p-10 shadow-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14532D]/10 text-[#14532D] dark:text-[#34D399] border border-[#14532D]/20 text-xs font-mono-scientific font-bold uppercase tracking-wider">
              <span>{activeNode.category} Relationship</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold theme-text-main tracking-tight font-display-hero">
                {activeNode.label}
              </h3>
              <p className="text-sm font-mono-scientific text-[#0F766E] font-semibold">
                Network Metric: {activeNode.count}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#52635A] leading-relaxed">
              {activeNode.description}
            </p>

            <div className="space-y-2.5 pt-2 border-t border-current/10 text-xs text-[#52635A]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#14532D] dark:text-[#10B981]" />
                <span>Interconnected relational database indexing</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#14532D] dark:text-[#10B981]" />
                <span>Synchronized with active laboratory projects</span>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href={activeNode.href}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#14532D] text-white hover:bg-[#1B6C3B] text-xs font-bold uppercase tracking-wider shadow transition-all"
              >
                <span>Explore {activeNode.label}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
