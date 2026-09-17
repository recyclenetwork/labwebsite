import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { ProjectExplorer } from "@/components/public/projects/project-explorer";
import { getPublishedProjects, getProjectStats, getResearchAreas } from "@/lib/projects/queries";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Research Projects & Grants | Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
  description:
    "Explore active and completed research projects on environmental pollutants, microplastics, heavy metals, toxicogenomics, and ecosystem risk assessment.",
  openGraph: {
    title: "Research Projects | Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
    description:
      "Turning environmental questions into rigorous scientific evidence through laboratory analysis and longitudinal field investigations.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
        width: 1200,
        height: 630,
        alt: "Environmental toxicology research projects",
      },
    ],
  },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProjectsPage() {
  // Fetch initial server data
  const [initialProjects, initialStats, researchAreas] = await Promise.all([
    getPublishedProjects({}, false),
    getProjectStats(),
    getResearchAreas(),
  ]);

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] flex flex-col justify-between">
      {/* 1. Global Navigation */}
      <Navbar />

      {/* 2. Interactive Projects Explorer */}
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#2F7D4A] animate-spin" />
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Loading research archive...
              </span>
            </div>
          }
        >
          <ProjectExplorer
            initialProjects={initialProjects}
            initialStats={initialStats}
            researchAreas={researchAreas}
          />
        </Suspense>
      </main>

      {/* 3. Global Footer */}
      <Footer />
    </div>
  );
}
