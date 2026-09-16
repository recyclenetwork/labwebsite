import { ProjectWithRelations, ProjectResearchArea, ProjectResearcher, ProjectCollaborator, ProjectPublication } from "./types";

export const SEED_RESEARCH_AREAS: ProjectResearchArea[] = [
  {
    id: "area-1",
    title: "Microplastics & Emerging Pollutants",
    slug: "microplastics-emerging-pollutants",
    description: "Polymer characterization, particulate transport kinetics, and trophic transfer in freshwater and coastal ecosystems.",
    icon_name: "FlaskConical",
  },
  {
    id: "area-2",
    title: "Heavy Metal Ecotoxicology",
    slug: "heavy-metal-ecotoxicology",
    description: "Speciation, bioaccumulation, and cellular biomarkers of arsenic, lead, cadmium, and chromium across agro-ecosystems.",
    icon_name: "Atom",
  },
  {
    id: "area-3",
    title: "Aquatic Health & Watersheds",
    slug: "aquatic-health-watersheds",
    description: "Longitudinal river basin water quality, industrial discharge monitoring, and benthic macroinvertebrate health.",
    icon_name: "Droplets",
  },
  {
    id: "area-4",
    title: "Human Health Risk Assessment",
    slug: "human-health-risk-assessment",
    description: "Dietary exposure pathways, daily intake estimations, and non-carcinogenic/carcinogenic hazard quotients.",
    icon_name: "Activity",
  },
  {
    id: "area-5",
    title: "Environmental Remediation Technologies",
    slug: "environmental-remediation-technologies",
    description: "Engineered biochar composites, phytoremediation matrices, and sustainable industrial effluent treatment systems.",
    icon_name: "Leaf",
  },
];

export const SEED_RESEARCHERS: ProjectResearcher[] = [
  {
    id: "person-1",
    name: "Dr. Elena Vance",
    slug: "dr-elena-vance",
    position: "Principal Investigator & Lab Director",
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    role_in_project: "Principal Investigator",
    display_order: 1,
  },
  {
    id: "person-2",
    name: "Sojib Chowdhury",
    slug: "sojib-chowdhury",
    position: "Senior Research Fellow & Analytical Lead",
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    role_in_project: "Lead Field & Analytical Researcher",
    display_order: 2,
  },
  {
    id: "person-3",
    name: "Dr. Marcus Thorne",
    slug: "dr-marcus-thorne",
    position: "Senior Ecotoxicologist",
    photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    role_in_project: "Co-Investigator",
    display_order: 3,
  },
  {
    id: "person-4",
    name: "Aria Lindqvist",
    slug: "aria-lindqvist",
    position: "Graduate Research Assistant",
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    role_in_project: "Spectroscopy & Data Specialist",
    display_order: 4,
  },
  {
    id: "person-5",
    name: "Tanvir Hasan",
    slug: "tanvir-hasan",
    position: "Graduate Fellow",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    role_in_project: "Field Sampling Coordinator",
    display_order: 5,
  },
  {
    id: "person-6",
    name: "Kotoha Nakayama",
    slug: "kotoha-nakayama",
    position: "Postdoctoral Research Fellow",
    photo_url: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
    role_in_project: "Molecular Ecotoxicology & Bioassay Lead",
    display_order: 6,
  },
];

export const SEED_COLLABORATORS: ProjectCollaborator[] = [
  {
    name: "Jahangirnagar University",
    institution: "Dept. of Environmental Sciences",
    role: "Host Academic Institution",
  },
  {
    name: "Ministry of Science & Technology (MoST)",
    institution: "Government of Bangladesh",
    role: "National Research Funding Partner",
  },
  {
    name: "Department of Environment (DoE)",
    institution: "Ministry of Environment, Forest & Climate Change",
    role: "Regulatory & Monitoring Partner",
  },
  {
    name: "U.S. EPA Office of Research",
    institution: "United States Environmental Protection Agency",
    role: "International Scientific Collaborator",
  },
];

export const SEED_PROJECTS: ProjectWithRelations[] = [
  {
    id: "proj-001",
    title: "Microplastic Exposure in Freshwater Ecosystems: Trophic Transfer & Biomagnification",
    slug: "microplastic-exposure-freshwater-ecosystems",
    short_description: "Longitudinal multi-station investigation into particulate microplastic abundance, polymeric composition, and trophic biomagnification in the Meghna River estuary.",
    full_description: "Micro- and nanoplastics represent an escalating ecotoxicological crisis in rapidly industrializing deltaic river systems. This flagship 3-year research initiative systematically quantifies polymer distribution (polyethylene, polypropylene, polystyrene) across benthic sediment cores, surface water microlayers, and commercial fish species in the Meghna River basin.\n\nBy integrating micro-FTIR imaging with digestion-free fluorescent tagging, the project determines the bioaccumulation factors and histological alterations in local fish models (Tenualosa ilisha, Glossogobius giuris), establishing critical baseline contamination metrics for South Asian delta environments.",
    status: "ongoing",
    start_date: "2025-01-15",
    end_date: "2027-12-31",
    year: "2025 — 2027",
    funding_info: "Competitive National Science & Technology Research Grant #MoST-ENV-2024-88",
    funding_org: "Ministry of Science & Technology (MoST)",
    grant_amount: "BDT 3.6M ($32,000 USD)",
    research_question: "How do seasonal hydrodynamic shifts govern the fragmentation, bio-uptake, and trophic magnification of microplastics across freshwater-estuarine food webs?",
    objectives: [
      "Quantify temporal and spatial concentrations of microplastics in surface water and sediment across 18 sampling stations.",
      "Characterize polymer fingerprints and chemical additives using micro-FTIR and thermal desorption GC-MS.",
      "Assess cellular oxidative stress and gastrointestinal lesion severity in commercially harvested fish species.",
      "Formulate a localized ecological risk index (ERI) to inform national plastics abatement regulations."
    ],
    methodology: "Standardized NOAA manta trawl surface sampling → Alkaline KOH tissue digestion → μ-FTIR spectral mapping (4000–600 cm⁻¹) → Biomarker enzyme assays (CAT, SOD, MDA) → Multivariable Bayesian spatial modeling.",
    study_area: "Meghna River Estuary & Coastal Outfall Transects",
    study_area_description: "Covering 120 km of river corridor stretching from Chandpur confluence to Bhola coastal outlet, capturing diverse industrial, urban, and agricultural discharge zones.",
    findings: "Initial preliminary data reveals elevated concentrations (up to 480 particles/m³) during the pre-monsoon dry season, dominated by polypropylene fibers and weathered fragments.",
    outputs: "3 Peer-reviewed Journal Articles (in prep), 1 Open-Access Spectral Library, National Environmental Policy Brief #04.",
    hero_image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=85",
    image_alt: "Laboratory researcher examining microplastic particles under automated optical microscope",
    featured_image: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "/images/gallery/field-sampling.jpg",
      "/images/gallery/microscopy-imaging.jpg"
    ],
    display_order: 1,
    is_featured: true,
    is_published: true,
    published_at: "2025-01-15T00:00:00Z",
    created_at: "2025-01-15T00:00:00Z",
    updated_at: "2026-03-01T00:00:00Z",
    research_areas: [SEED_RESEARCH_AREAS[0], SEED_RESEARCH_AREAS[2]],
    researchers: [SEED_RESEARCHERS[0], SEED_RESEARCHERS[1], SEED_RESEARCHERS[3]],
    collaborators: [SEED_COLLABORATORS[0], SEED_COLLABORATORS[1]],
    publications: [
      {
        id: "pub-1",
        title: "Microplastic Polymer Fingerprints in Estuarine Bioindicators: Seasonal Dynamics and Biomagnification",
        slug: "microplastic-polymer-fingerprints-estuarine-bioindicators",
        journal: "Science of The Total Environment",
        publication_year: 2025,
        doi: "10.1016/j.scitotenv.2025.178234",
        authors: "Chowdhury, S., Vance, E., Thorne, M., Lindqvist, A.",
      }
    ]
  },
  {
    id: "proj-002",
    title: "Heavy Metal Speciation & Dietary Health Risk in Peri-Urban Agro-Ecosystems",
    slug: "heavy-metal-speciation-agro-ecosystems",
    short_description: "Spatial mapping of trace elements (Pb, Cd, As, Cr) in the soil-water-crop continuum and human health risk quotient modeling in the Gazipur-Savar industrial belt.",
    full_description: "Industrial effluents and untreated wastewater irrigation in peri-urban agricultural corridors introduce hazardous concentrations of toxic trace elements into the human food chain. This study examines the fractionation of arsenic, cadmium, lead, and chromium in agricultural soils, irrigational canals, and leafy vegetables.\n\nEmploying inductively coupled plasma mass spectrometry (ICP-MS) and sequential extraction procedures (BCR), the project calculates bioconcentration factors (BCF), target hazard quotients (THQ), and incremental lifetime cancer risk (ILCR) for local consumer populations.",
    status: "ongoing",
    start_date: "2024-06-01",
    end_date: "2026-11-30",
    year: "2024 — 2026",
    funding_info: "Higher Education Quality Enhancement Project (HEQEP) Research Grant #W2-892",
    funding_org: "World Bank & UGC Bangladesh",
    grant_amount: "BDT 4.8M ($41,000 USD)",
    research_question: "To what extent does chemical speciation control heavy metal bioavailability in wastewater-irrigated soils, and what are the resulting dietary exposure hazards?",
    objectives: [
      "Profile total and bioavailable heavy metals in soil, irrigation water, and 12 vegetable cultivars.",
      "Conduct sequential extraction to evaluate geochemical fractionation (exchangeable, reducible, oxidizable, residual).",
      "Model adult and child Target Hazard Quotients (THQ) based on localized dietary surveys.",
      "Deliver actionable spatial zoning maps to agricultural extension officers."
    ],
    methodology: "Soil core sampling (0–20 cm) → Microwave acid digestion (EPA 3051A) → ICP-MS trace metal quantification → BCR sequential extraction → USEPA Monte Carlo health risk simulation.",
    study_area: "Gazipur-Savar Peri-Urban Agricultural Zone",
    study_area_description: "High-density textile and tannery catchment areas bordering Dhaka city, characterized by intensive vegetable cultivation and canal irrigation.",
    findings: "Cadmium and Lead bioaccumulation in spinach and amaranth species consistently exceeded FAO/WHO codex maximum permissible levels during dry irrigation cycles.",
    outputs: "2 Peer-Reviewed Papers, 1 GIS Soil Risk Atlas, Policy Recommendations for Wastewater Irrigation Zoning.",
    hero_image: "/images/slide-1-field.jpg",
    image_alt: "Soil and water sample collection in agricultural wetland monitoring site",
    featured_image: "/images/slide-1-field.jpg",
    gallery: [
      "/images/gallery/field-sampling.jpg"
    ],
    display_order: 2,
    is_featured: true,
    is_published: true,
    published_at: "2024-06-01T00:00:00Z",
    created_at: "2024-06-01T00:00:00Z",
    updated_at: "2026-02-15T00:00:00Z",
    research_areas: [SEED_RESEARCH_AREAS[1], SEED_RESEARCH_AREAS[3]],
    researchers: [SEED_RESEARCHERS[0], SEED_RESEARCHERS[2], SEED_RESEARCHERS[4]],
    collaborators: [SEED_COLLABORATORS[0], SEED_COLLABORATORS[2]],
    publications: []
  }
];
