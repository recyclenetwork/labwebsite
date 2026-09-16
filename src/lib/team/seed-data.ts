import { TeamCategoryMeta, TeamMember } from "./types";

export const TEAM_CATEGORIES_META: Record<string, TeamCategoryMeta> = {
  pi: {
    id: "pi",
    label: "Principal Investigator",
    shortLabel: "Principal Investigator",
    description: "Lab directorship, scientific oversight, and strategic research vision.",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  phd: {
    id: "phd",
    label: "Postdoc & PhD Researchers",
    shortLabel: "Postdoc & PhD",
    description: "Doctoral candidates and postdoctoral scientists conducting hypothesis-driven research.",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
  },
  graduate: {
    id: "graduate",
    label: "Graduate Researchers",
    shortLabel: "Graduate Researchers",
    description: "Master of Science students conducting analytical and computational thesis research.",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  },
  undergraduate: {
    id: "undergraduate",
    label: "Undergraduate Researchers",
    shortLabel: "Undergraduate Researchers",
    description: "Undergraduate researchers gaining training in ecotoxicology and sampling.",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
  alumni: {
    id: "alumni",
    label: "Lab Alumni",
    shortLabel: "Lab Alumni",
    description: "Former researchers and alumni advancing science in academia and industry.",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [
  // ==========================================
  // 1. PRINCIPAL INVESTIGATOR (PI)
  // ==========================================
  {
    id: "team-pi-1",
    name: "Prof. Dr. Md. Mostafizur Rahman",
    slug: "prof-dr-md-mostafizur-rahman",
    role: "Professor & Principal Investigator",
    category: "pi",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "Prof. Dr. Md. Mostafizur Rahman is a Professor of Environmental Ecotoxicology and Founding Director of the Laboratory of Environmental Health and Ecotoxicology (LabEHE) at Jahangirnagar University. With over two decades of research leadership in environmental chemistry and molecular toxicology, his research focuses on the environmental fate, bioaccumulation kinetics, and human health risks associated with persistent organic pollutants (POPs), per- and polyfluoroalkyl substances (PFAS), microplastics, and heavy metals in freshwater and estuarine ecosystems.",
    quote: "Our mission is to translate high-resolution molecular and environmental data into actionable ecological safety thresholds and evidence-based public health protections.",
    researchInterests: [
      "Aquatic Ecotoxicology",
      "Persistent Organic Pollutants (POPs)",
      "Microplastic-Contaminant Interactions",
      "Human Health Risk Assessment",
      "High-Resolution Mass Spectrometry",
      "Toxicogenomics & Bioindicators",
    ],
    education: [
      "Ph.D. in Aquatic Ecotoxicology & Environmental Chemistry, University of Tokyo (2007)",
      "Postdoctoral Fellowship, National Institute for Environmental Studies (NIES), Tsukuba, Japan (2008–2010)",
      "M.Sc. in Environmental Sciences (First Class 1st Position), Jahangirnagar University (2003)",
      "B.Sc. (Hons.) in Chemistry & Environmental Studies, Jahangirnagar University (2001)",
    ],
    email: "mostafiz@juniv.edu",
    phone: "+880 2-7791045 Ext. 1420",
    officeLocation: "W.B. Academic Building, Room 304, Dept. of Environmental Sciences, Jahangirnagar University",
    googleScholarUrl: "https://scholar.google.com/citations?user=example-rahman",
    orcid: "0000-0002-8419-7201",
    researchGateUrl: "https://www.researchgate.net/profile/Mostafizur-Rahman",
    linkedinUrl: "https://linkedin.com/in/mostafizur-rahman-ecotox",
    imageSrc: "",
    imageAlt: "Prof. Dr. Md. Mostafizur Rahman - Professor & Principal Investigator",
    publicationsCount: 74,
    citationsCount: 2840,
    hIndex: 26,
    grantsCount: 16,
    advisingCount: 38,
    cvUrl: "#view-cv",
    curriculumVitae: {
      title: "Curriculum Vitae — Prof. Dr. Md. Mostafizur Rahman",
      summary: "Professor of Environmental Sciences and Lab Director with 20+ years of investigative leadership in Aquatic Toxicology, Persistent Contaminant Fate, and Risk Assessment. Principal Investigator for 16 national and international competitive research grants ($2.8M+ total funding). Supervisor to 12 Ph.D. scholars, 26 M.Sc. theses, and 30+ undergraduate honors fellows.",
      education: [
        {
          degree: "Postdoctoral Research Fellowship in Environmental Omics",
          institution: "National Institute for Environmental Studies (NIES), Tsukuba, Japan",
          year: "2008 – 2010",
          details: "Host: JSPS Postdoctoral Fellowship for Foreign Researchers. Project: High-throughput bioassays for endocrine disrupting chemicals in Tokyo Bay."
        },
        {
          degree: "Ph.D. in Aquatic Ecotoxicology & Analytical Chemistry",
          institution: "Department of Urban Engineering, The University of Tokyo, Japan",
          year: "2004 – 2007",
          details: "Doctoral Dissertation: 'Mechanisms of Bioavailability and Cellular Toxicity of Hydrophobic Organic Contaminants in Benthic Invertebrates'."
        },
        {
          degree: "Master of Science (M.Sc.) in Environmental Sciences",
          institution: "Jahangirnagar University, Savar, Dhaka",
          year: "2002 – 2003",
          details: "First Class (1st Position with Distinction). Gold Medal Recipient."
        },
        {
          degree: "Bachelor of Science (B.Sc. Hons.) in Chemistry",
          institution: "Jahangirnagar University, Savar, Dhaka",
          year: "1997 – 2001",
          details: "First Class with University Merit Scholarship."
        }
      ],
      appointments: [
        {
          role: "Professor & Founding Laboratory Director",
          institution: "Jahangirnagar University",
          period: "2018 – Present",
          department: "Department of Environmental Sciences"
        },
        {
          role: "Associate Professor",
          institution: "Jahangirnagar University",
          period: "2014 – 2018",
          department: "Department of Environmental Sciences"
        },
        {
          role: "Visiting Research Professor",
          institution: "University of Tsukuba, Japan",
          period: "Summer 2022 & 2024",
          department: "Faculty of Life and Environmental Sciences"
        },
        {
          role: "Assistant Professor",
          institution: "Jahangirnagar University",
          period: "2010 – 2014",
          department: "Department of Environmental Sciences"
        }
      ],
      grants: [
        {
          title: "High-Resolution Spatial Mapping and Multigenerational Ecotoxicology of Microplastics and Co-Contaminants in the Meghna Estuary",
          fundingAgency: "Ministry of Science and Technology (MOST) Special Research Grant",
          amount: "BDT 4,500,000 (~$42,000 USD)",
          period: "2024 – 2027",
          role: "Principal Investigator"
        },
        {
          title: "Non-Target HRMS Screening of Emerging Per- and Polyfluoroalkyl Substances (PFAS) in Coastal Aquaculture Watersheds",
          fundingAgency: "Japan Society for the Promotion of Science (JSPS) Core-to-Core Program",
          amount: "¥18,000,000 (~$120,000 USD)",
          period: "2023 – 2026",
          role: "Lead Investigator (Bangladesh Node)"
        },
        {
          title: "Assessing Heavy Metal Speciation and Bioaccumulation in Commercial Freshwater Fishery Vectors",
          fundingAgency: "World Bank Academic Innovation Fund (AIF)",
          amount: "BDT 12,000,000 (~$110,000 USD)",
          period: "2020 – 2023",
          role: "Principal Investigator & Project Director"
        }
      ],
      selectedPublications: [
        {
          title: "Trophic transfer and hepatic histopathology of weathered microplastic particles in indigenous freshwater fish under multi-stressor regimes",
          journal: "Environmental Science & Technology, 59(14), 4812-4825",
          year: 2025,
          doi: "10.1021/acs.est.2025.4812"
        },
        {
          title: "Spatial distribution and ecological risk quotients of 24 per- and polyfluoroalkyl substances (PFAS) across tropical river-estuary gradients",
          journal: "Journal of Hazardous Materials, 482, 136201",
          year: 2025,
          doi: "10.1016/j.jhazmat.2025.136201"
        },
        {
          title: "Molecular biomarker responses and transcriptomic perturbations in teleosts exposed to organophosphate and heavy metal mixtures",
          journal: "Aquatic Toxicology, 268, 106840",
          year: 2024,
          doi: "10.1016/j.aquatox.2024.106840"
        },
        {
          title: "Comparative micro-FTIR and pyrolysis-GC/MS profiling of synthetic microfibers in estuarine benthic sediments",
          journal: "Water Research, 245, 120610",
          year: 2023,
          doi: "10.1016/j.watres.2023.120610"
        }
      ],
      awards: [
        {
          title: "Dean's Research Excellence Award",
          organization: "Faculty of Biological Sciences, Jahangirnagar University",
          year: "2024"
        },
        {
          title: "Fellow of the Royal Society of Chemistry (FRSC)",
          organization: "Royal Society of Chemistry, London, UK",
          year: "2022"
        },
        {
          title: "JSPS Postdoctoral Fellowship for Overseas Researchers",
          organization: "Japan Society for the Promotion of Science",
          year: "2008"
        },
        {
          title: "University Gold Medal for Academic Excellence",
          organization: "Jahangirnagar University",
          year: "2003"
        }
      ],
      editorialService: [
        "Associate Editor, Journal of Environmental Ecotoxicology & Safety",
        "Editorial Board Member, Environmental Science and Pollution Research",
        "Peer Reviewer for ES&T, Water Research, Chemosphere, Aquatic Toxicology, and Science of the Total Environment (>140 verified reviews)"
      ],
      memberships: [
        "Society of Environmental Toxicology and Chemistry (SETAC) — Full Member",
        "International Association of Water Quality (IAWQ)",
        "Bangladesh Chemical Society (Life Member)"
      ]
    },
    orderIndex: 1,
    isActive: true,
  },

  // ==========================================
  // 2. UNDERGRADUATE MEMBERS (4th Year / Senior Thesis & Interns)
  // ==========================================
  {
    id: "team-ug-1",
    name: "Aria Lindqvist",
    slug: "aria-lindqvist",
    role: "Senior Undergraduate Research Fellow",
    category: "undergraduate",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "Undergraduate senior conducting honors research on microplastic extraction efficiency across dense sediment matrices using density separation techniques and Nile Red fluorescence microscopy.",
    undergradThesis: "Comparative Recovery of Nanoplastics and Polymer Microfibers from Estuarine Silt Using Sodium Polytungstate Density Separation",
    undergradDescription: "Designed an optimized multi-stage flotation protocol for extracting weathered polyethylene, polypropylene, and PET microplastics from high-turbidity coastal sediments with >92% recovery efficiency.",
    advisor: "Dr. Mohammad S. Kabir",
    expectedGraduation: "Fall 2026",
    researchInterests: [
      "Microplastics Density Separation",
      "Fluorescence Microscopy",
      "Sediment Sampling Protocols",
      "Environmental QA/QC",
    ],
    skills: ["Nile Red Staining", "Stereo Microscopy", "Density Flotation", "R Statistics"],
    awards: ["Undergraduate Research Excellence Fellowship (2025)", "Departmental Merit List"],
    publications: [
      {
        title: "Enhanced density separation protocol for microplastics in estuarine sediments using sodium polytungstate",
        journal: "Environmental Toxicology and Chemistry, 44(3), 612–624",
        year: 2025,
        doi: "10.1002/etc.5821",
        role: "First Author"
      }
    ],
    email: "a.lindqvist@ecotox-lab.org",
    imageSrc: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Aria Lindqvist - Undergraduate Research Fellow",
    orderIndex: 8,
    isActive: true,
  },
  {
    id: "team-ug-2",
    name: "Samira Haque",
    slug: "samira-haque",
    role: "Undergraduate Laboratory Assistant",
    category: "undergraduate",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "Assists with culturing Daphnia magna and freshwater microalgae (Chlorella vulgaris) for standardized acute and chronic ecotoxicological bioassays under controlled photoperiods.",
    undergradThesis: "Standardization of Acute 48h Toxicity Assays on Daphnia magna Exposed to Binary Pesticide-Microplastic Mixtures",
    undergradDescription: "Evaluating immobilization rates (EC50) and swimming velocity alterations in Daphnia neonates subjected to chlorpyrifos alone versus co-exposed with 5μm polystyrene beads.",
    advisor: "Md. Arifur Rahman & Dr. Mohammad S. Kabir",
    expectedGraduation: "2027",
    researchInterests: [
      "Daphnia Toxicity Bioassays",
      "Algal Growth Inhibition",
      "Water Quality Physico-Chemistry",
    ],
    skills: ["Bioassay Culturing", "Spectrophotometry", "D. magna Handling", "GraphPad Prism"],
    publications: [
      {
        title: "Acute immobilisation and swimming behavioural alterations in Daphnia magna co-exposed to chlorpyrifos and microplastics",
        journal: "Aquatic Toxicology, 271, 106912",
        year: 2025,
        doi: "10.1016/j.aquatox.2025.106912",
        role: "Co-Author"
      }
    ],
    email: "samira.haque@juniv.edu",
    imageSrc: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Samira Haque - Undergraduate Assistant",
    orderIndex: 9,
    isActive: true,
  },
  {
    id: "team-ug-3",
    name: "Farhan Sadik",
    slug: "farhan-sadik",
    role: "Undergraduate Fieldwork & Data Intern",
    category: "undergraduate",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "Supports quarterly environmental surface water sampling campaigns across urban wetlands and manages lab water quality sensor telemetry and GPS data spatial layers.",
    undergradThesis: "Spatial Assessment of Industrial Heavy Metal Runoff in Peri-Urban Wetland Drainage Canals",
    undergradDescription: "Conducted field sampling across 18 stream transects to quantify pH, dissolved oxygen, and dissolved lead/cadmium concentrations using portable electrochemical probes and AAS.",
    advisor: "Dr. Mohammad S. Kabir",
    expectedGraduation: "2027",
    researchInterests: [
      "Field Hydrology",
      "Water Chemistry Sensors",
      "GIS Spatial Mapping",
      "Data QA/QC",
    ],
    skills: ["YSI Multiparameter Probes", "QGIS", "GPS Coordinate Mapping", "AAS Preparation"],
    publications: [
      {
        title: "Spatial distribution and seasonal hydrochemical loading of trace heavy metals in peri-urban wetland drainage networks",
        journal: "Environmental Monitoring and Assessment, 197(2), 142",
        year: 2025,
        doi: "10.1007/s10661-025-13421-4",
        role: "Co-Author"
      }
    ],
    email: "farhan.sadik@juniv.edu",
    imageSrc: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Farhan Sadik - Undergraduate Intern",
    orderIndex: 10,
    isActive: true,
  },

  // ==========================================
  // 3. GRADUATE MEMBERS (M.SC. & M.S.)
  // ==========================================
  {
    id: "team-grad-1",
    name: "Sojib Chowdhury, M.Sc.",
    slug: "sojib-chowdhury",
    role: "Senior Graduate Researcher & Lab Manager",
    category: "graduate",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "Oversees ICP-MS and Micro-FTIR spectroscopic instrumentation. Sojib's research centers on microplastic ingestion pathways in commercial estuarine bivalves and bioaccumulation factors of legacy trace metals.",
    undergradThesis: "Heavy Metal Concentrations in Road Dust and Urban Runoff of Dhaka Megacity (2023)",
    undergradDescription: "Investigated Pb, Cd, and Cr loads in urban stormwater drainage channels using Atomic Absorption Spectrophotometry.",
    mscThesis: "Microplastic Burden and Trace Metal Co-Contaminants in Commercial Estuarine Bivalves of the Bay of Bengal",
    mscDescription: "Quantifying synthetic polymer ingestion (micro-FTIR chemical imaging) and heavy metal bioaccumulation factors in green mussels (Perna viridis) and oysters across tidal aquaculture zones.",
    advisor: "Dr. Mohammad S. Kabir",
    expectedGraduation: "Late 2025",
    researchInterests: [
      "Micro-FTIR Chemical Imaging",
      "Heavy Metal Speciation (ICP-MS)",
      "Trophic Transfer Kinetics",
      "Laboratory Instrumentation Management",
    ],
    skills: ["Agilent Micro-FTIR", "PerkinElmer ICP-MS", "Polymer Spectral Libraries", "R / Python"],
    awards: ["National Science and Technology (NST) Fellowship (2024)", "Best Student Presentation, BAPCON 2024"],
    education: [
      "M.Sc. in Environmental Sciences, Jahangirnagar University (2024 – Present)",
      "B.Sc. (Hons.) in Environmental Sciences, Jahangirnagar University (2019 – 2023)",
    ],
    publications: [
      {
        title: "Microplastic ingestion and trophic accumulation of trace metals in edible bivalves (Perna viridis) from the northern Bay of Bengal",
        journal: "Marine Pollution Bulletin, 198, 115842",
        year: 2025,
        doi: "10.1016/j.marpolbul.2025.115842",
        role: "First Author"
      },
      {
        title: "Heavy metal fractions and contamination factors in urban stormwater runoff sediments of Dhaka Megacity",
        journal: "Chemosphere, 342, 140129",
        year: 2024,
        doi: "10.1016/j.chemosphere.2024.140129",
        role: "Co-Author"
      }
    ],
    email: "s.chowdhury@ecotox-lab.org",
    googleScholarUrl: "https://scholar.google.com/citations?user=sojib-chowdhury",
    orcid: "0000-0001-9230-4102",
    researchGateUrl: "https://www.researchgate.net/profile/Sojib-Chowdhury",
    linkedinUrl: "https://linkedin.com/in/sojib-chowdhury-env",
    imageSrc: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Sojib Chowdhury - Graduate Researcher",
    orderIndex: 5,
    isActive: true,
  },
  {
    id: "team-grad-2",
    name: "Fatima Al-Hassan, M.Sc.",
    slug: "fatima-al-hassan",
    role: "Graduate Research Assistant",
    category: "graduate",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "Focuses on spatial risk modeling, Bayesian Monte Carlo simulations, and human health exposure assessments from contaminated groundwater aquifers in industrial export processing zones.",
    undergradThesis: "Multivariate Statistical Analysis of Groundwater Quality Index in Gazipur Industrial Belt",
    undergradDescription: "Applied principal component analysis (PCA) and hierarchical clustering to classify 60 borehole water samples based on ionic and trace toxicant profiles.",
    mscThesis: "Bayesian Monte Carlo Risk Assessment of Groundwater Carcinogens and PFAS in Industrial Export Processing Zones",
    mscDescription: "Developing stochastic exposure models to compute Hazard Quotients (HQ) and Lifetime Cancer Risk (LCR) among downstream resident populations.",
    advisor: "Dr. Mohammad S. Kabir",
    expectedGraduation: "2026",
    researchInterests: [
      "Environmental Health Risk Modeling",
      "Groundwater Ecotoxicology",
      "Spatial Statistics (R / Python)",
      "Hazard Quotient & LCR Analysis",
    ],
    skills: ["Monte Carlo Simulation", "ArcGIS Pro", "R Shiny Dashboards", "Stan / Bayesian MCMC"],
    education: [
      "M.Sc. in Environmental Sciences, Jahangirnagar University",
      "B.Sc. in Applied Statistics & Environmental Science, University of Dhaka",
    ],
    publications: [
      {
        title: "Bayesian health risk simulation of multi-contaminant groundwater aquifers in industrial export corridors",
        journal: "Ecotoxicology and Environmental Safety, 289, 117420",
        year: 2025,
        doi: "10.1016/j.ecoenv.2025.117420",
        role: "First Author"
      }
    ],
    email: "f.alhassan@ecotox-lab.org",
    orcid: "0000-0003-1284-5509",
    researchGateUrl: "https://www.researchgate.net/profile/Fatima-Al-Hassan",
    imageSrc: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Fatima Al-Hassan - Graduate Researcher",
    orderIndex: 6,
    isActive: true,
  },
  {
    id: "team-grad-3",
    name: "Tanzirul Islam",
    slug: "tanzirul-islam",
    role: "Graduate Research Assistant",
    category: "graduate",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "Specializing in aquatic sediment extraction techniques, sequential metal fractionation (Tessier protocol), and environmental quality indexing in riverine deltas.",
    undergradThesis: "Synthesis and Adsorption Capacity of Chitosan-Coated Biochar for Textile Dye Removal",
    undergradDescription: "Evaluated methylene blue and Congo red dye adsorption kinetics using customized agricultural waste biomass biochars.",
    mscThesis: "Chemical Fractionation, Mobility, and Ecological Risk Quotients of Heavy Metals in Dredged Riverbed Sediments",
    mscDescription: "Determining acid-soluble, reducible, oxidizable, and residual fractions of Cd, Cr, Pb, and Ni to estimate remobilization hazards under changing salinity regimes.",
    advisor: "Dr. Mohammad S. Kabir",
    expectedGraduation: "2026",
    researchInterests: [
      "Sediment Geochemistry",
      "Sequential Metal Extraction",
      "AAS Spectroscopy",
      "Dredging Environmental Impact",
    ],
    skills: ["Tessier Fractionation", "AAS (Flame & Graphite)", "Sediment Core Profiling"],
    education: [
      "M.Sc. in Environmental Sciences, Jahangirnagar University (Ongoing)",
      "B.Sc. in Chemistry, Rajshahi University",
    ],
    publications: [
      {
        title: "Speciation and remobilization dynamics of toxic heavy metals in dredged riverbed sediments under varying salinity",
        journal: "Journal of Soils and Sediments, 25(4), 1012–1026",
        year: 2025,
        doi: "10.1007/s11368-025-03780-1",
        role: "First Author"
      }
    ],
    email: "tanzir.islam@juniv.edu",
    imageSrc: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Tanzirul Islam - Graduate Researcher",
    orderIndex: 7,
    isActive: true,
  },

  // ==========================================
  // 4. POSTDOC & PHD RESEARCHERS
  // ==========================================
  {
    id: "team-phd-1",
    name: "Dr. Kenji Tanaka, Ph.D.",
    slug: "dr-kenji-tanaka",
    role: "Senior Postdoctoral Research Fellow",
    category: "phd",
    department: "Environmental Analytical Chemistry Division",
    affiliation: "Ecotox Lab / JSPS Research Partner",
    bio: "Specializing in high-resolution LC-HRMS non-target screening and metabolomic profiling of aquatic organisms exposed to complex chemical effluents. Dr. Tanaka leads the instrumentation and spectral library development for novel fluorinated surfactants.",
    mscThesis: "Synthesis and Degradation Pathways of Fluorinated Polyether Surfactants in Aqueous Solutions (Tohoku University)",
    mscDescription: "Identified photochemical breakdown intermediates using quadrupole time-of-flight mass spectrometry.",
    phdThesis: "High-Resolution Mass Spectrometric Identification and Non-Target Screening of Emerging Per- and Polyfluoroalkyl Substances in Asian Estuarine Basins",
    phdDescription: "Developed suspect-screening MS/MS libraries and Kendrick Mass Defect algorithms that uncovered 14 previously uncharacterized fluorinated homologues in coastal ecosystems.",
    researchInterests: [
      "LC-HRMS Non-Target Screening",
      "PFAS Biotransformation",
      "Environmental Metabolomics",
      "Compound Discoverer Workflows",
    ],
    skills: ["Thermo Orbitrap HRMS", "Compound Discoverer", "mzVault Spectral Curation", "R/Bioconductor"],
    education: [
      "Ph.D. in Analytical Environmental Chemistry, Kyoto University (2023)",
      "M.Sc. in Chemistry, Tohoku University (2020)",
    ],
    publications: [
      {
        title: "Non-target high-resolution mass spectrometry suspect screening of emerging per- and polyfluoroalkyl substances (PFAS) in Asian coastal estuaries",
        journal: "Environmental Science & Technology, 59(11), 3890–3902",
        year: 2025,
        doi: "10.1021/acs.est.2025.3890",
        role: "Lead Author"
      },
      {
        title: "Metabolomic biomarkers of xenobiotic chemical stress in aquatic organisms under thermal fluctuation",
        journal: "Water Research, 252, 121180",
        year: 2024,
        doi: "10.1016/j.watres.2024.121180",
        role: "Co-Author"
      }
    ],
    email: "k.tanaka@ecotox-lab.org",
    googleScholarUrl: "https://scholar.google.com/citations?user=tanaka-ecotox",
    orcid: "0000-0003-4921-8840",
    researchGateUrl: "https://www.researchgate.net/profile/Kenji-Tanaka",
    imageSrc: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Dr. Kenji Tanaka - Postdoctoral Research Fellow",
    orderIndex: 2,
    isActive: true,
  },
  {
    id: "team-phd-2",
    name: "Md. Arifur Rahman",
    slug: "md-arifur-rahman",
    role: "Doctoral Research Fellow (Ph.D. Candidate)",
    category: "phd",
    department: "Department of Environmental Sciences",
    affiliation: "Jahangirnagar University",
    bio: "Investigating molecular biomarkers of oxidative stress, vitellogenin induction, and endocrine disruption in indigenous freshwater fish (Anabas testudineus and Channa punctata) exposed to industrial microplastic cocktails.",
    undergradThesis: "Water Quality Assessment and Plankton Diversity of the Turag River (Jahangirnagar University, 2020)",
    undergradDescription: "Quantified seasonal shifts in phytoplankton communities relative to biochemical oxygen demand in urban drainage outfalls.",
    mscThesis: "Biomarkers of Oxidative Stress in Spotted Snakehead Exposed to Agricultural Pesticide Runoff (Jahangirnagar University, 2022)",
    mscDescription: "Measured superoxide dismutase (SOD), catalase (CAT), and lipid peroxidation (LPO) enzyme activities in fish gill and liver tissues.",
    phdThesis: "Endocrine Disruption, Toxicogenomic Biomarkers, and Histopathology in Freshwater Teleosts Under Combined Microplastic and Organophosphate Stress",
    phdDescription: "Evaluating mRNA upregulation of CYP1A, VTG, and HSP70 genes alongside gonad histopathological staging across multigenerational exposure models.",
    expectedGraduation: "Late 2026",
    advisor: "Dr. Mohammad S. Kabir",
    researchInterests: [
      "Molecular Toxicology & qPCR",
      "Endocrine Disruption Biomarkers",
      "Freshwater Bioindicators",
      "Histopathological Lesion Indexing",
    ],
    skills: ["qRT-PCR Gene Expression", "Tissue Histology & Microtomy", "Enzyme Kinetic Assays", "Bioassay Culture"],
    awards: ["Bangabandhu Doctoral Fellowship (2023–2026)", "University Chancellor Gold Medalist"],
    education: [
      "Ph.D. Candidate in Environmental Ecotoxicology, Jahangirnagar University (Ongoing)",
      "M.Sc. in Environmental Sciences (Distinction), Jahangirnagar University (2022)",
      "B.Sc. (Hons.) in Environmental Sciences, Jahangirnagar University (2020)",
    ],
    publications: [
      {
        title: "Transcriptomic and enzymatic responses in freshwater teleosts subjected to binary organophosphate and nanoplastic exposures",
        journal: "Aquatic Toxicology, 273, 107018",
        year: 2025,
        doi: "10.1016/j.aquatox.2025.107018",
        role: "First Author"
      },
      {
        title: "Oxidative stress biomarker profiling in indigenous fish species under industrial effluent gradients",
        journal: "Environmental Pollution, 335, 122340",
        year: 2024,
        doi: "10.1016/j.envpol.2024.122340",
        role: "Co-Author"
      }
    ],
    email: "arif.env@juniv.edu",
    googleScholarUrl: "https://scholar.google.com/citations?user=arifur-rahman",
    orcid: "0000-0002-1825-4102",
    researchGateUrl: "https://www.researchgate.net/profile/Md-Arifur-Rahman-Ecotox",
    imageSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Md. Arifur Rahman - Doctoral Fellow",
    orderIndex: 3,
    isActive: true,
  },
  {
    id: "team-phd-3",
    name: "Kotoha Nakayama",
    slug: "kotoha-nakayama",
    role: "Visiting Doctoral Researcher (Ph.D. Fellow)",
    category: "phd",
    department: "Environmental Risk Analysis Group",
    affiliation: "Collaborative Fellow, University of Tsukuba",
    bio: "Developing hydrodynamic-GIS dispersion models to predict microplastic accumulation hot spots and seasonal particulate flux across the Meghna and Jamuna river networks.",
    mscThesis: "Geospatial Modeling of Riverine Particulate Debris Transport in Tokyo Bay Watershed (Tokyo Metropolitan University, 2023)",
    mscDescription: "Built 2D river hydrodynamics using Delft3D and satellite remote sensing calibration.",
    phdThesis: "Hydrodynamic Modeling and Seasonal Flux Distribution of Microplastics Across Tidal Coastal Transects of the Bay of Bengal",
    phdDescription: "Coupling depth-averaged hydrodynamic modeling with seasonal monsoonal discharge datasets to predict riverine plastic particle export into marine waters.",
    expectedGraduation: "2027",
    advisor: "Dr. Mohammad S. Kabir & Prof. H. Sato",
    researchInterests: [
      "Hydrodynamic Dispersion Models",
      "Microplastic Flux Quantification",
      "Environmental Spatial GIS",
      "Coastal Ecotoxicology",
    ],
    skills: ["Delft3D Hydrodynamics", "Python GeoPandas", "Satellite Remote Sensing (Sentinel-2)", "ArcGIS Pro"],
    education: [
      "Ph.D. in Global Environmental Studies, University of Tsukuba (Ongoing)",
      "M.Sc. in Geoinformatics, Tokyo Metropolitan University (2023)",
    ],
    publications: [
      {
        title: "Depth-averaged hydrodynamic modeling of riverine microplastic flux and export into the northern Bay of Bengal",
        journal: "Science of The Total Environment, 912, 169120",
        year: 2025,
        doi: "10.1016/j.scitotenv.2025.169120",
        role: "First Author"
      }
    ],
    email: "k.nakayama@tsukuba.ac.jp",
    orcid: "0000-0001-7729-3382",
    imageSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Kotoha Nakayama - Visiting Doctoral Researcher",
    orderIndex: 4,
    isActive: true,
  },

  // ==========================================
  // 5. ALUMNI NETWORK
  // ==========================================
  {
    id: "team-alumni-1",
    name: "Dr. Nusrat Jahan, Ph.D.",
    slug: "dr-nusrat-jahan",
    role: "Former Doctoral Researcher (2020 – 2024)",
    category: "alumni",
    currentPosition: "Assistant Professor",
    currentInstitution: "Department of Chemistry, University of Dhaka",
    alumniYear: "Ph.D. Class of 2024",
    pastRole: "Doctoral Fellow in Heavy Metal Ecotoxicology",
    bio: "Completed her Ph.D. under Dr. Kabir investigating heavy metal bioaccumulation kinetics and human health risk quotients in aquaculture matrices. Now leading her own research group on chemical speciation at University of Dhaka.",
    phdThesis: "Trace Metal Speciation, Tissue Partitioning, and Human Health Risk Quotients in Commercial Freshwater Aquaculture Vectors",
    phdDescription: "Investigated chronic bioaccumulation of As, Cd, and Pb in farmed pangasius and tilapia with health risk estimations for urban consumers.",
    researchInterests: ["Heavy Metal Speciation", "AAS Spectroscopy", "Aquaculture Food Safety"],
    skills: ["AAS Spectroscopy", "Food Matrix Microwave Digestion", "Health Quotient Estimation"],
    education: [
      "Ph.D. in Environmental Sciences, Jahangirnagar University (2024)",
      "M.Sc. in Chemistry, University of Dhaka (2019)",
    ],
    publications: [
      {
        title: "Trace element partitioning and dietary health risk assessment in commercial aquaculture fishes of Bangladesh",
        journal: "Food and Chemical Toxicology, 184, 114420",
        year: 2024,
        doi: "10.1016/j.fct.2024.114420",
        role: "First Author"
      }
    ],
    email: "nusrat.jahan@du.ac.bd",
    googleScholarUrl: "https://scholar.google.com/citations?user=nusrat-du",
    orcid: "0000-0002-9912-4018",
    imageSrc: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Dr. Nusrat Jahan - Lab Alumna",
    orderIndex: 11,
    isActive: true,
  },
  {
    id: "team-alumni-2",
    name: "Dr. Marcus Thorne, Ph.D.",
    slug: "dr-marcus-thorne",
    role: "Former Senior Postdoc (2021 – 2024)",
    category: "alumni",
    currentPosition: "Senior Analytical Research Chemist",
    currentInstitution: "U.S. Environmental Protection Agency (EPA)",
    alumniYear: "Postdoc 2024",
    pastRole: "Postdoctoral Fellow in Mass Spectrometry",
    bio: "Pioneered the lab's LC-HRMS non-target screening workflows. Currently working on federal PFAS drinking water regulatory method validations at EPA Office of Research and Development.",
    phdThesis: "Tandem Mass Spectrometric Screening of Fluorinated Emerging Contaminants (UC Davis)",
    phdDescription: "Developed high-throughput analytical methods for tracking perfluoroalkyl acid precursors in wastewater treatment plants.",
    researchInterests: ["High-Resolution Mass Spectrometry", "PFAS Regulations", "Environmental Analytical Methods"],
    education: [
      "Postdoctoral Fellow, Laboratory of Environmental Health and Ecotoxicology (LabEHE) (2021 – 2024)",
      "Ph.D. in Environmental Toxicology, UC Davis (2020)",
    ],
    publications: [
      {
        title: "Suspect screening and LC-Orbitrap characterization of novel fluorinated compounds in municipal wastewater streams",
        journal: "Journal of Hazardous Materials, 465, 133290",
        year: 2024,
        doi: "10.1016/j.jhazmat.2024.133290",
        role: "Lead Author"
      }
    ],
    orcid: "0000-0003-4921-8840",
    imageSrc: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Dr. Marcus Thorne - Lab Alumnus",
    orderIndex: 12,
    isActive: true,
  },
  {
    id: "team-alumni-3",
    name: "Raisa Khan, M.Sc.",
    slug: "raisa-khan",
    role: "Former Graduate Researcher (2021 – 2023)",
    category: "alumni",
    currentPosition: "Environmental Policy & Risk Specialist",
    currentInstitution: "The World Bank (South Asia Environmental Division)",
    alumniYear: "M.Sc. Class of 2023",
    pastRole: "M.Sc. Student in Environmental Risk Assessment",
    bio: "Researched industrial effluent impact on downstream agricultural lands. Now advises multilateral development projects on environmental safeguards and compliance.",
    mscThesis: "Impact of Industrial Effluent Irrigation on Agricultural Soil Heavy Metal Loads and Crop Bioaccumulation Factors",
    mscDescription: "Evaluated bioaccumulation in Oryza sativa across 3 major textile export processing zones in Bangladesh.",
    researchInterests: ["Environmental Impact Assessment", "Policy Frameworks", "Multilateral Compliance"],
    education: [
      "M.Sc. in Environmental Sciences, Jahangirnagar University (2023)",
      "B.Sc. in Environmental Management, North South University (2020)",
    ],
    publications: [
      {
        title: "Impact of untreated textile effluent irrigation on heavy metal enrichment and bioaccumulation in agricultural paddy soils",
        journal: "Agriculture, Ecosystems & Environment, 358, 108710",
        year: 2023,
        doi: "10.1016/j.agee.2023.108710",
        role: "First Author"
      }
    ],
    linkedinUrl: "https://linkedin.com/in/raisa-khan-env",
    imageSrc: "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Raisa Khan - Lab Alumna",
    orderIndex: 13,
    isActive: true,
  },
  {
    id: "team-alumni-4",
    name: "Kevin Miller, B.Sc.",
    slug: "kevin-miller",
    role: "Former Undergraduate Fellow (2022 – 2024)",
    category: "alumni",
    currentPosition: "Ph.D. Candidate in Biogeochemistry",
    currentInstitution: "ETH Zürich, Switzerland",
    alumniYear: "B.Sc. Class of 2024",
    pastRole: "Senior Thesis Researcher",
    bio: "Authored 2 first-author papers during his undergraduate fellowship at Ecotox Lab. Awarded the prestigious ETH Excellence Fellowship for doctoral studies in Europe.",
    undergradThesis: "Adsorption Kinetics and Surface Complexation of PFAS on Iron Oxide Nanoparticles in Aquatic Matrices",
    undergradDescription: "Quantified sorption isotherms and partition coefficients across varying pH and ionic strength regimes.",
    researchInterests: ["Isotope Geochemistry", "Hydrology", "Surface Nanocomplexation"],
    education: [
      "Ph.D. in Biogeochemistry, ETH Zürich (2024 – Present)",
      "B.Sc. in Environmental Studies, Jahangirnagar University (2024)",
    ],
    publications: [
      {
        title: "Sorption isotherms and interface complexation of perfluorooctanoic acid on engineered iron oxide nanoparticles",
        journal: "Environmental Science: Nano, 11(5), 1840–1852",
        year: 2024,
        doi: "10.1039/D4EN00112A",
        role: "First Author"
      }
    ],
    email: "kmiller@ethz.ch",
    imageSrc: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80",
    imageAlt: "Kevin Miller - Lab Alumnus",
    orderIndex: 14,
    isActive: true,
  },
];
