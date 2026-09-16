import * as React from "react";
import { Navbar } from "@/components/public/navbar";
import { Hero } from "@/components/public/hero";
import { ResearchStats } from "@/components/public/research-stats";
import { ResearchAreas } from "@/components/public/research-areas";
import { FeaturedProject } from "@/components/public/featured-project";
import { PartnersMarquee } from "@/components/public/partners-marquee";
import { FeaturedPublications } from "@/components/public/featured-publications";
import { PrincipalInvestigator } from "@/components/public/principal-investigator";
import { FeaturedPeople } from "@/components/public/featured-people";
import { LatestNews } from "@/components/public/latest-news";
import { OpportunitiesCTA } from "@/components/public/opportunities-cta";
import { ResearchGallery } from "@/components/public/research-gallery";
import { ContactPreview } from "@/components/public/contact-preview";
import { Footer } from "@/components/public/footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-300 flex flex-col justify-between">
      {/* 1. Sticky Navigation */}
      <Navbar />

      <main className="flex-grow">
        {/* 2. Hero Section with Signature Scientific Network */}
        <Hero />

        {/* 3. Research Metrics Strip */}
        <ResearchStats />

        {/* 4. Research Focus ("What We Study") */}
        <ResearchAreas />

        {/* 5. Completed & Flagship Projects Showcase */}
        <FeaturedProject />

        {/* 5b. Collaborating Institutions & Research Sponsors Ribbon */}
        <PartnersMarquee />

        {/* 6. Featured Publications */}
        <FeaturedPublications />

        {/* 7. Principal Investigator & Lab Director Spotlight */}
        <PrincipalInvestigator />

        {/* 8. People Section ("The People Behind The Science") */}
        <FeaturedPeople />

        {/* 9. Latest News & Breakthroughs (Synced with News Store) */}
        <LatestNews />

        {/* 10. Opportunities CTA */}
        <OpportunitiesCTA />

        {/* 11. Laboratory & Field Gallery Showcase */}
        <ResearchGallery />

        {/* 12. Contact & Campus Location Preview */}
        <ContactPreview />
      </main>

      {/* 14. Global Footer */}
      <Footer />
    </div>
  );
}
