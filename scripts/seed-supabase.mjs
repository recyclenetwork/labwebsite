import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valParts] = trimmed.split("=");
      const val = valParts.join("=").trim();
      if (key === "NEXT_PUBLIC_SUPABASE_URL" && !supabaseUrl) supabaseUrl = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY" && !supabaseServiceKey) supabaseServiceKey = val;
    }
  });
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  console.log("Seeding Supabase Database with initial Lab data...\n");

  // 1. Research Areas
  const researchAreas = [
    {
      id: "area-1",
      title: "Microplastics & Emerging Pollutants",
      slug: "microplastics-emerging-pollutants",
      description: "Polymer characterization, particulate transport kinetics, and trophic transfer in freshwater and coastal ecosystems.",
      icon_name: "FlaskConical",
      display_order: 1,
      is_published: true,
      is_featured: true,
    },
    {
      id: "area-2",
      title: "Heavy Metal Ecotoxicology",
      slug: "heavy-metal-ecotoxicology",
      description: "Speciation, bioaccumulation, and cellular biomarkers of arsenic, lead, cadmium, and chromium across agro-ecosystems.",
      icon_name: "Atom",
      display_order: 2,
      is_published: true,
      is_featured: true,
    },
    {
      id: "area-3",
      title: "Aquatic Health & Watersheds",
      slug: "aquatic-health-watersheds",
      description: "Longitudinal river basin water quality, industrial discharge monitoring, and benthic macroinvertebrate health.",
      icon_name: "Droplets",
      display_order: 3,
      is_published: true,
      is_featured: true,
    },
    {
      id: "area-4",
      title: "Human Health Risk Assessment",
      slug: "human-health-risk-assessment",
      description: "Dietary exposure pathways, daily intake estimations, and non-carcinogenic/carcinogenic hazard quotients.",
      icon_name: "Activity",
      display_order: 4,
      is_published: true,
      is_featured: false,
    },
    {
      id: "area-5",
      title: "Environmental Remediation Technologies",
      slug: "environmental-remediation-technologies",
      description: "Engineered biochar composites, phytoremediation matrices, and sustainable industrial effluent treatment systems.",
      icon_name: "Leaf",
      display_order: 5,
      is_published: true,
      is_featured: false,
    },
  ];

  console.log("Seeding research_areas...");
  const { error: raErr } = await supabase.from("research_areas").upsert(researchAreas);
  if (raErr) console.warn("Research areas error:", raErr.message);
  else console.log(`✅ Seeded ${researchAreas.length} research areas.`);

  // 2. People
  const people = [
    {
      id: "pi-1",
      name: "Professor Dr. Md. Shahedur Rahman",
      slug: "dr-shahedur-rahman",
      position: "Principal Investigator & Lab Director",
      role: "Principal Investigator & Lab Director",
      designation: "Professor",
      category: "pi",
      department: "Department of Environmental Sciences",
      affiliation: "Jahangirnagar University",
      bio: "Leading multi-scale ecotoxicological investigations into micro-pollutants and environmental health risks across the Bengal delta.",
      biography: "Leading multi-scale ecotoxicological investigations into micro-pollutants and environmental health risks across the Bengal delta.",
      quote: "Evidence-based environmental chemistry is the cornerstone of public health safeguards.",
      email: "shahed@juniv.edu",
      photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      publications_count: "85+",
      citations_count: "2,400+",
      h_index: "28",
      grants_count: "12",
      order_index: 1,
      display_order: 1,
      is_active: true,
    },
    {
      id: "person-1",
      name: "Dr. Elena Vance",
      slug: "dr-elena-vance",
      position: "Senior Research Fellow",
      role: "Senior Research Fellow",
      designation: "Senior Research Fellow",
      category: "researcher",
      department: "Department of Environmental Sciences",
      affiliation: "Jahangirnagar University",
      bio: "Specializing in high-resolution mass spectrometry and endocrine-disrupting chemicals.",
      quote: "Precision spectroscopy brings invisible risks into sharp focus.",
      email: "e.vance@juniv.edu",
      photo_url: "/images/slide-2-lab.jpg",
      image_url: "/images/slide-2-lab.jpg",
      order_index: 2,
      display_order: 2,
      is_active: true,
    },
    {
      id: "person-2",
      name: "Sojib Chowdhury",
      slug: "sojib-chowdhury",
      position: "Graduate Researcher & Analytical Lead",
      role: "Graduate Researcher & Analytical Lead",
      designation: "Graduate Researcher",
      category: "graduate",
      department: "Department of Environmental Sciences",
      affiliation: "Jahangirnagar University",
      bio: "Focusing on aquatic microplastic extraction protocols and vibrational spectroscopy.",
      quote: "Understanding particle transport in estuaries protects deltaic biodiversity.",
      email: "sojib@juniv.edu",
      photo_url: "/images/slide-3-analysis.jpg",
      image_url: "/images/slide-3-analysis.jpg",
      order_index: 3,
      display_order: 3,
      is_active: true,
    },
    {
      id: "person-3",
      name: "Tahmina Akter",
      slug: "tahmina-akter",
      position: "Research Associate",
      role: "Research Associate",
      designation: "Research Associate",
      category: "researcher",
      department: "Department of Environmental Sciences",
      affiliation: "Jahangirnagar University",
      bio: "Conducting biomarker assays and cellular response modeling.",
      quote: "Cellular pathways reveal sub-lethal toxicological impacts.",
      email: "tahmina@juniv.edu",
      photo_url: "/images/slide-1-field.jpg",
      image_url: "/images/slide-1-field.jpg",
      order_index: 4,
      display_order: 4,
      is_active: true,
    }
  ];

  console.log("Seeding people...");
  const { error: pErr } = await supabase.from("people").upsert(people);
  if (pErr) console.warn("People error:", pErr.message);
  else console.log(`✅ Seeded ${people.length} people.`);

  // 3. Projects
  const projects = [
    {
      id: "proj-1",
      title: "Microplastic Contamination in the Meghna River Estuary",
      slug: "microplastic-contamination-meghna-river-estuary",
      short_description: "Quantifying polymer density, spatial distribution, and benthic macroinvertebrate ingestion rates along the deltaic corridor.",
      full_description: "Comprehensive multi-season field sampling across 24 estuarine monitoring stations to map microplastic fluxes.",
      status: "ongoing",
      start_date: "2024-01-01",
      end_date: "2026-12-31",
      year: "2024-2026",
      funding_org: "Bangladesh UGC & MoST",
      grant_amount: "BDT 4,500,000",
      hero_image: "/images/slide-1-field.jpg",
      featured_image: "/images/slide-1-field.jpg",
      display_order: 1,
      is_featured: true,
      is_published: true,
    },
    {
      id: "proj-2",
      title: "Heavy Metal Speciation & Bioaccumulation in Wetland Biota",
      slug: "heavy-metal-speciation-bioaccumulation-wetland-biota",
      short_description: "Evaluating trophic transfer factors of arsenic and cadmium in peri-urban aquaculture systems.",
      full_description: "Investigating geochemical fractions and bioavailability of heavy metals in critical wetland ecosystems of Bangladesh.",
      status: "ongoing",
      start_date: "2024-06-01",
      end_date: "2027-05-31",
      year: "2024-2027",
      funding_org: "National Science Council",
      grant_amount: "BDT 3,800,000",
      hero_image: "/images/slide-2-lab.jpg",
      featured_image: "/images/slide-2-lab.jpg",
      display_order: 2,
      is_featured: true,
      is_published: true,
    },
    {
      id: "proj-3",
      title: "Efficacy of Modified Agricultural Biochar for Dye Removal",
      slug: "efficacy-modified-agricultural-biochar-dye-removal",
      short_description: "Developing engineered low-cost biomass carbon adsorbents for textile industrial wastewater effluents.",
      full_description: "Synthesizing surface-functionalized biochar from agricultural residues to achieve 98% dye elimination efficiency.",
      status: "completed",
      start_date: "2023-01-01",
      end_date: "2025-12-31",
      year: "2023-2025",
      funding_org: "Green Innovation Fund",
      grant_amount: "BDT 2,200,000",
      hero_image: "/images/slide-4-impact.jpg",
      featured_image: "/images/slide-4-impact.jpg",
      display_order: 3,
      is_featured: true,
      is_published: true,
    }
  ];

  console.log("Seeding projects...");
  const { error: projErr } = await supabase.from("projects").upsert(projects);
  if (projErr) console.warn("Projects error:", projErr.message);
  else console.log(`✅ Seeded ${projects.length} projects.`);

  // 4. Publications
  const publications = [
    {
      id: "pub-1",
      title: "Spatial distribution and polymer characteristics of microplastics in surface waters of the lower Meghna Estuary",
      slug: "spatial-distribution-polymer-characteristics-meghna",
      abstract: "This study investigates the abundance, spatial variations, and vibrational chemical fingerprints of microplastics across the estuarine gradient.",
      publication_type: "journal_article",
      journal: "Environmental Pollution",
      publication_year: 2026,
      doi: "10.1016/j.envpol.2026.123456",
      doi_url: "https://doi.org/10.1016/j.envpol.2026.123456",
      impact_factor: 8.90,
      citation_count: 18,
      quartile: "Q1",
      authors_text: "Shahedur Rahman, Sojib Chowdhury, Elena Vance, et al.",
      is_featured: true,
      is_published: true,
      display_order: 1,
    },
    {
      id: "pub-2",
      title: "Heavy metal fractionation and non-carcinogenic health hazards associated with consumption of cultured teleosts in Dhaka peripheral wetlands",
      slug: "heavy-metal-fractionation-health-hazards-dhaka",
      abstract: "Assessment of geochemical speciation and target hazard quotients of Pb, Cd, and Cr in commercially harvested fish species.",
      publication_type: "journal_article",
      journal: "Science of The Total Environment",
      publication_year: 2025,
      doi: "10.1016/j.scitotenv.2025.987654",
      doi_url: "https://doi.org/10.1016/j.scitotenv.2025.987654",
      impact_factor: 9.80,
      citation_count: 42,
      quartile: "Q1",
      authors_text: "Shahedur Rahman, Tahmina Akter, et al.",
      is_featured: true,
      is_published: true,
      display_order: 2,
    },
    {
      id: "pub-3",
      title: "Tailored magnetic biochar derived from agricultural waste for high-capacity azo dye sequestration: Kinetics and isotherm modeling",
      slug: "tailored-magnetic-biochar-azo-dye-sequestration",
      abstract: "Surface engineering of rice husk biochar via Fe3O4 co-precipitation for continuous batch adsorption of industrial synthetic dyes.",
      publication_type: "journal_article",
      journal: "Journal of Hazardous Materials",
      publication_year: 2025,
      doi: "10.1016/j.jhazmat.2025.112233",
      doi_url: "https://doi.org/10.1016/j.jhazmat.2025.112233",
      impact_factor: 13.60,
      citation_count: 67,
      quartile: "Q1",
      authors_text: "Shahedur Rahman, Elena Vance, et al.",
      is_featured: true,
      is_published: true,
      display_order: 3,
    }
  ];

  console.log("Seeding publications...");
  const { error: pubErr } = await supabase.from("publications").upsert(publications);
  if (pubErr) console.warn("Publications error:", pubErr.message);
  else console.log(`✅ Seeded ${publications.length} publications.`);

  // 5. News
  const news = [
    {
      id: "news-1",
      title: "LabEHE Secures Major UGC Grant for Estuarine Microplastic Research",
      slug: "labehe-secures-major-ugc-grant-estuarine-microplastics",
      summary: "The Laboratory of Environmental Health and Ecotoxicology has been awarded a prestigious multi-year research grant to investigate microplastic ingestion in deltaic aquatic life.",
      content: "Our research team at Jahangirnagar University has received new funding to expand continuous water column sampling and micro-FTIR spectroscopic analysis across the southern coastal estuaries.",
      category: "lab_update",
      cover_image_url: "/images/slide-1-field.jpg",
      author_name: "Lab Editorial Team",
      published_at: new Date().toISOString().split("T")[0],
      is_featured: true,
      is_published: true,
    },
    {
      id: "news-2",
      title: "New Q1 Publication on Metal Speciation in Science of the Total Environment",
      slug: "new-q1-publication-metal-speciation-stotenv",
      summary: "Our latest investigation on geochemical heavy metal fractionation in peri-urban wetlands is now published in Science of The Total Environment (IF: 9.8).",
      content: "The paper details targeted hazard quotients and non-carcinogenic risk models for urban communities consuming freshwater fish exposed to industrial effluent plumes.",
      category: "lab_update",
      cover_image_url: "/images/slide-3-analysis.jpg",
      author_name: "Lab Editorial Team",
      published_at: new Date(Date.now() - 86400000 * 10).toISOString().split("T")[0],
      is_featured: true,
      is_published: true,
    }
  ];

  console.log("Seeding news...");
  const { error: nErr } = await supabase.from("news").upsert(news);
  if (nErr) console.warn("News error:", nErr.message);
  else console.log(`✅ Seeded ${news.length} news articles.`);

  // 6. Gallery Events
  const gallery = [
    {
      id: "gal-1",
      title: "Meghna River Delta Aquatic Sampling",
      category: "Field Expedition",
      location: "Chandpur & Meghna Estuary",
      date_text: "March 2026",
      description: "Multi-point estuarine water column and sediment sampling expedition mapping microplastic particle concentrations and trace metal bioaccumulation.",
      image_url: "/images/gallery/field-sampling.jpg",
    },
    {
      id: "gal-2",
      title: "ICP-MS & Trace Metal Quantitative Screening",
      category: "Laboratory Analysis",
      location: "Ecotox Analytical Facility",
      date_text: "January 2026",
      description: "High-precision inductively coupled plasma mass spectrometry for elemental profiling and heavy metal risk quantification in aquatic biota.",
      image_url: "/images/gallery/analytical-instrumentation.jpg",
    },
    {
      id: "gal-3",
      title: "Stereomicroscopy of Estuarine Plankton",
      category: "Microscopy & Imaging",
      location: "Micro-Ecotoxicology Lab",
      date_text: "February 2026",
      description: "Fluorescence stereomicroscopy characterization of zooplankton ingestion rates and micro-debris tissue adherence in deltaic ecosystems.",
      image_url: "/images/gallery/microscopy-imaging.jpg",
    }
  ];

  console.log("Seeding gallery_events...");
  const { error: gErr } = await supabase.from("gallery_events").upsert(gallery);
  if (gErr) console.warn("Gallery error:", gErr.message);
  else console.log(`✅ Seeded ${gallery.length} gallery items.`);

  console.log("\n==================================================");
  console.log("🎉 Seeding completed successfully!");
  console.log("==================================================");
}

seedDatabase();
