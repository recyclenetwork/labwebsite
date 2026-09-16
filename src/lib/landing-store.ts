"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { idbGet, idbSet, idbDelete, safeLocalStorageSet, safeLocalStorageGet } from "@/lib/storage/idb-storage";

export interface LandingContentData {
  hero: {
    eyebrow: string;
    headline: string;
    supportingText: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    stages: Array<{
      id: string;
      step: string;
      name: string;
      flow: string;
      eyebrow: string;
      headline: string;
      highlightPrefix: string;
      highlightWord: string;
      subheadline: string;
      imageSrc: string;
      imageAlt?: string;
      associatedNodeId?: string;
    }>;
    arcNodes?: Array<{
      id: string;
      label: string;
      desc: string;
      stageNumber?: string;
    }>;
    slideDurationSeconds?: number;
  };
  metrics: Array<{
    value: string;
    label: string;
    sublabel?: string;
    description: string;
  }>;
  researchFocus: {
    badge: string;
    title: string;
    subtitle: string;
    shuffleViewMode?: boolean;
    defaultViewMode?: "deck" | "radial" | "grid";
  };
  projectsSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  partnersSection: {
    badge: string;
    title: string;
    subtitle?: string;
    partners?: Array<{
      id: string;
      name: string;
      shortName?: string;
      type: string;
      badge: string;
      logoUrl?: string;
      websiteUrl?: string;
    }>;
  };
  publicationsSection: {
    badge: string;
    title: string;
    subtitle: string;
  };
  piSection: {
    name: string;
    designation: string;
    department: string;
    institution: string;
    bioQuote: string;
    publicationsCount: string;
    citationsCount?: string;
    hIndex?: string;
    grantsCount?: string;
    imageSrc: string;
    scholarUrl: string;
    researchgateUrl: string;
  };
  peopleSection: {
    badge: string;
    title: string;
    subtitle: string;
    autoSlideSeconds?: number;
    enableShuffle?: boolean;
  };
  newsSection: {
    badge: string;
    title: string;
    subtitle: string;
    autoSlideSeconds: number;
  };
  opportunitiesSection: {
    badge: string;
    title: string;
    highlightText: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
  };
  gallerySection: {
    badge: string;
    title: string;
    subtitle: string;
    marqueeSpeedSeconds: number;
  };
  contactSection: {
    badge: string;
    title: string;
    subtitle: string;
    facilityName: string;
    address: string;
    gpsCoordinates: string;
    email: string;
    phone: string;
    hours: string;
    mapEmbedUrl: string;
    aerialImageSrc: string;
  };
  aboutPage?: {
    hero: {
      badge: string;
      headline: string;
      supportingText: string;
      backgroundImageUrl: string;
      metrics: Array<{ label: string }>;
    };
    whoWeAre: {
      badge: string;
      headlinePrefix: string;
      headlineHighlight: string;
      paragraph1: string;
      paragraph2: string;
      rigorTitle: string;
      rigorText: string;
      policyTitle: string;
      policyText: string;
      imageSrc: string;
      imageCaptionBadge: string;
      imageCaptionTitle: string;
      imageCaptionSubtitle: string;
    };
    milestones: Array<{
      year: string;
      title: string;
      badge: string;
      desc: string;
    }>;
    galleryImages: Array<{
      title: string;
      category: string;
      image: string;
    }>;
    cta: {
      badge: string;
      headline: string;
      description: string;
      primaryBtnText: string;
      primaryBtnHref: string;
      secondaryBtnText: string;
      secondaryBtnHref: string;
    };
  };
  footer: {
    labName: string;
    description: string;
    copyrightText: string;
  };
}

export const DEFAULT_LANDING_DATA: LandingContentData = {
  hero: {
    eyebrow: "ENVIRONMENTAL SCIENCE • HEALTH • ECOSYSTEMS",
    headline: "Understanding Environmental Risks. Protecting Health.",
    supportingText:
      "We investigate environmental contaminants, ecological responses, and exposure pathways to generate evidence for healthier ecosystems and communities at Jahangirnagar University.",
    primaryCtaLabel: "Explore Our Research",
    primaryCtaHref: "/research",
    secondaryCtaLabel: "Meet Our Lab",
    secondaryCtaHref: "/people",
    stages: [
      {
        id: "stage-1",
        step: "01",
        name: "FIELD",
        flow: "ENVIRONMENT → EXPOSURE",
        eyebrow: "ENVIRONMENT • HEALTH • ECOTOXICOLOGY",
        headline: "Understanding",
        highlightPrefix: "what ",
        highlightWord: "surrounds us.",
        subheadline: "From environmental exposure to biological response.",
        imageSrc: "/images/slide-1-field.jpg",
      },
      {
        id: "stage-2",
        step: "02",
        name: "LAB",
        flow: "CONTAMINANT → BIOLOGICAL RESPONSE",
        eyebrow: "MOLECULAR TOXICOLOGY • MASS SPECTROMETRY • BIOASSAYS",
        headline: "Quantifying",
        highlightPrefix: "molecular ",
        highlightWord: "cellular risk.",
        subheadline: "High-resolution micro-FTIR, chemical fate, and sub-lethal bioassays.",
        imageSrc: "/images/slide-2-lab.jpg",
      },
      {
        id: "stage-3",
        step: "03",
        name: "ANALYSIS",
        flow: "DATA → EVIDENCE",
        eyebrow: "DATA SCIENCE • BIOINFORMATICS • PATHWAY MODELING",
        headline: "Transforming",
        highlightPrefix: "signals into ",
        highlightWord: "clear evidence.",
        subheadline: "Predictive toxicogenomic modeling and multi-scale ecological datasets.",
        imageSrc: "/images/slide-3-analysis.jpg",
      },
      {
        id: "stage-4",
        step: "04",
        name: "IMPACT",
        flow: "EVIDENCE → HEALTH",
        eyebrow: "BIOREMEDIATION • HEALTH STANDARDS • RESTORATION",
        headline: "Protecting",
        highlightPrefix: "future ",
        highlightWord: "resilient ecosystems.",
        subheadline: "Translating empirical discoveries into actionable standards and remediation.",
        imageSrc: "/images/slide-4-impact.jpg",
      },
    ],
    arcNodes: [
      {
        id: "environment",
        label: "ENVIRONMENT",
        desc: "Natural watersheds, alpine ecosystems & ambient exposure vectors",
        stageNumber: "STAGE 01 OF 05",
      },
      {
        id: "contaminant",
        label: "CONTAMINANT",
        desc: "Microplastics, PFAS, pesticides & industrial chemical persistence",
        stageNumber: "STAGE 02 OF 05",
      },
      {
        id: "exposure",
        label: "EXPOSURE",
        desc: "Aqueous uptake, atmospheric deposition & trophic bioaccumulation",
        stageNumber: "STAGE 03 OF 05",
      },
      {
        id: "response",
        label: "BIOLOGICAL RESPONSE",
        desc: "Sub-lethal physiological stress, toxicogenomics & DNA damage",
        stageNumber: "STAGE 04 OF 05",
      },
      {
        id: "health",
        label: "HEALTH",
        desc: "Organism survival, biodiversity indices & human community well-being",
        stageNumber: "STAGE 05 OF 05",
      },
    ],
    slideDurationSeconds: 3.8,
  },
  metrics: [
    {
      value: "25+",
      label: "Research Projects",
      sublabel: "Active & Completed",
      description: "Active grants across aquatic and terrestrial biomes",
    },
    {
      value: "50+",
      label: "Peer-Reviewed Publications",
      sublabel: "Q1 & High-Impact",
      description: "High-impact environmental and toxicology journals",
    },
    {
      value: "10+",
      label: "Collaborating Institutions",
      sublabel: "Global & National",
      description: "Academic institutions, EPA partners, and environmental agencies",
    },
    {
      value: "15+",
      label: "Graduate & Postgrad Researchers",
      sublabel: "PhDs, Masters & Fellows",
      description: "Dedicated scientists training in ecotoxicological methodologies",
    },
  ],
  researchFocus: {
    badge: "SCIENTIFIC PILLARS",
    title: "What We Study",
    subtitle:
      "Our research spans four interconnected domains addressing chemical persistence, biological uptake, organismal impact, and human community risk.",
    shuffleViewMode: true,
    defaultViewMode: "deck",
  },
  projectsSection: {
    badge: "FLAGSHIP RESEARCH",
    title: "Research Projects & Scientific Breakthroughs",
    subtitle: "High-impact investigative projects funded by national and international scientific bodies.",
  },
  partnersSection: {
    badge: "INSTITUTIONAL NETWORK",
    title: "Collaborating Institutions & Research Sponsors",
    subtitle: "Partnering with leading ministries, academic councils, and international environmental organizations",
    partners: [
      {
        id: "p-ju",
        name: "Jahangirnagar University",
        shortName: "JU Environmental Sciences",
        type: "Host Academic Institution",
        badge: "HOST",
        logoUrl: "",
      },
      {
        id: "p-doe",
        name: "Department of Environment (DoE)",
        shortName: "Ministry of Env & Climate",
        type: "Government Regulatory Partner",
        badge: "GOVERNMENT",
        logoUrl: "",
      },
      {
        id: "p-bcsir",
        name: "BCSIR Research Laboratories",
        shortName: "National Science Council",
        type: "Analytical Research Alliance",
        badge: "ALLIANCE",
        logoUrl: "",
      },
      {
        id: "p-unep",
        name: "United Nations Environment (UNEP)",
        shortName: "UNEP Global Chemicals",
        type: "International Agency",
        badge: "GLOBAL",
        logoUrl: "",
      },
      {
        id: "p-who",
        name: "World Health Organization",
        shortName: "WHO Environmental Health",
        type: "Health Risk Working Group",
        badge: "GLOBAL",
        logoUrl: "",
      },
      {
        id: "p-jica",
        name: "JICA Environmental Science",
        shortName: "Japan International Agency",
        type: "Bilateral Grant Sponsor",
        badge: "GRANT SPONSOR",
        logoUrl: "",
      },
      {
        id: "p-icimod",
        name: "ICIMOD Watershed Network",
        shortName: "Regional Mountain & River Alliance",
        type: "Regional Ecological Partner",
        badge: "REGIONAL",
        logoUrl: "",
      },
      {
        id: "p-nsf",
        name: "Global Toxicology Research Network",
        shortName: "International Science Consortium",
        type: "Joint Grant Consortium",
        badge: "CONSORTIUM",
        logoUrl: "",
      },
    ],
  },
  publicationsSection: {
    badge: "PEER-REVIEWED EVIDENCE",
    title: "Featured Publications",
    subtitle:
      "Recent scientific breakthroughs published in high-impact environmental toxicology and public health journals.",
  },
  piSection: {
    name: "Prof. Dr. Md. Mostafizur Rahman",
    designation: "Professor & Principal Investigator",
    department: "Department of Environmental Sciences",
    institution: "Jahangirnagar University",
    bioQuote:
      "Our mission is to translate high-resolution molecular and environmental data into actionable ecological safety thresholds and evidence-based public health protections.",
    publicationsCount: "74+",
    citationsCount: "2,840+",
    hIndex: "26",
    imageSrc: "",
    scholarUrl: "https://scholar.google.com/citations?user=example-rahman",
    researchgateUrl: "https://www.researchgate.net/profile/Mostafizur-Rahman",
  },
  peopleSection: {
    badge: "LAB ROSTER",
    title: "Meet the Researchers",
    subtitle: "The multidisciplinary faculty, doctoral scholars, and students advancing environmental health science.",
    autoSlideSeconds: 4,
    enableShuffle: true,
  },
  newsSection: {
    badge: "LAB DISPATCHES",
    title: "Latest News & Insights",
    subtitle: "Stay updated on recent grant awards, breakthrough publications, symposium keynotes, and field expeditions.",
    autoSlideSeconds: 5,
  },
  opportunitiesSection: {
    badge: "JOIN OUR RESEARCH",
    title: "Shape the Future of Environmental Health",
    highlightText: "Now recruiting funded Master of Science (MS) and Doctoral (Ph.D.) research fellows.",
    description: "Work directly on national water security, microplastic ecotoxicity, and industrial contamination projects with full laboratory mentorship and high-resolution instrumentation access.",
    ctaLabel: "Apply for Research Position",
    ctaHref: "#contact",
  },
  gallerySection: {
    badge: "VISUAL ARCHIVE",
    title: "Event Showcase & Field Gallery",
    subtitle: "A continuous glimpse into our river delta expeditions, spectroscopic instrument rooms, and international symposia.",
    marqueeSpeedSeconds: 35,
  },
  contactSection: {
    badge: "CAMPUS LOCATION & INQUIRIES",
    title: "Reach our research team.",
    subtitle: "Located at Jahangirnagar University campus in Savar, Dhaka. Whether inquiring about collaborative grant proposals, sample submission protocols, postdoctoral opportunities, or graduate admissions, our scientific team is ready to connect.",
    facilityName: "Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
    address: "Department of Environmental Sciences, Jahangirnagar University, Savar, Dhaka-1342, Bangladesh",
    gpsCoordinates: "23.8824° N, 90.2671° E",
    email: "ecotox@juniv.edu",
    phone: "+880 2-7791045 Ext. 1420",
    hours: "Sunday – Thursday: 9:00 AM – 5:00 PM (GMT+6)",
    mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3648.5146059902644!2d90.26458537604313!3d23.882434583995834!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755e9999407e997%3A0x868b4f17849e7799!2sJahangirnagar%20University!5e0!3m2!1sen!2sbd!4v1710000000000!5m2!1sen!2sbd",
    aerialImageSrc: "/images/jahangirnagar-campus.jpg",
  },
  aboutPage: {
    hero: {
      badge: "ABOUT THE LAB",
      headline: "Science with purpose.",
      supportingText: "Department of Environmental Sciences • Jahangirnagar University, Savar, Dhaka",
      backgroundImageUrl: "/images/hero-clean-bg.jpg",
      metrics: [
        { label: "15+ Years Active Research" },
        { label: "140+ Peer-Reviewed Papers" },
        { label: "5,000+ Citations" },
      ],
    },
    whoWeAre: {
      badge: "WHO WE ARE",
      headlinePrefix: "Understanding the environment.",
      headlineHighlight: "Protecting what depends on it.",
      paragraph1: "Based within the biodiverse wetland ecosystem of Jahangirnagar University in Savar, Dhaka, our laboratory is an interdisciplinary research community investigating the unseen chemistry of environmental pollution.",
      paragraph2: "We track persistent contaminants, microplastics, endocrine disruptors, and trace metals across river sediment cores, agricultural soils, aquatic food webs, and human cell lines to generate actionable scientific evidence.",
      rigorTitle: "Empirical Rigor",
      rigorText: "ISO/EPA benchmarked analytical methods with certified standards and ultra-trace limits.",
      policyTitle: "Policy Translation",
      policyText: "Translating lab discoveries into environmental guidelines and public health protection.",
      imageSrc: "/images/slide-2-lab.jpg",
      imageCaptionBadge: "DEPARTMENT OF ENVIRONMENTAL SCIENCES",
      imageCaptionTitle: "Faculty of Mathematical & Physical Sciences",
      imageCaptionSubtitle: "Jahangirnagar University Campus, Savar, Dhaka-1342, Bangladesh.",
    },
    milestones: [
      {
        year: "2019",
        title: "Microplastics Cleanroom Inception",
        badge: "Spectroscopy Hub",
        desc: "Established micro-FTIR chemical imaging facility for microplastic debris mapping in deltaic food webs.",
      },
      {
        year: "2021",
        title: "Molecular Ecotoxicology Expansion",
        badge: "Cellular Bioassays",
        desc: "Integrated mammalian in-vitro assays and flow cytometry to evaluate cellular oxidative stress.",
      },
      {
        year: "2023",
        title: "Delta-Scale GIS & Remote Sensing",
        badge: "Spatial Modeling",
        desc: "Deployed Sentinel-2 multi-spectral satellite pipelines and watershed hydrodynamic contaminant flow tracking.",
      },
      {
        year: "2025",
        title: "Autonomous Telemetry & Circular Systems",
        badge: "In-Situ Sensing",
        desc: "Developed real-time autonomous water quality monitoring sondes and catalytic nutrient recovery frameworks.",
      },
      {
        year: "2026",
        title: "Global Consortia & Policy Leadership",
        badge: "Active Milestone",
        desc: "Over 140+ peer-reviewed papers and 5,000+ citations, spearheading regional environmental health resilience.",
      },
    ],
    galleryImages: [
      {
        title: "Ultra-Trace Spectrometry & Chromatography",
        category: "Laboratory Analysis",
        image: "/images/gallery/analytical-instrumentation.jpg",
      },
      {
        title: "Microscopic Imaging & Micro-FTIR",
        category: "Microscopy & Imaging",
        image: "/images/gallery/microscopy-imaging.jpg",
      },
      {
        title: "Molecular Bioassay & Toxicogenomics",
        category: "Biological Exposure",
        image: "/images/slide-3-analysis.jpg",
      },
      {
        title: "Delta Aquatic Sampling & Field Coring",
        category: "Field Expedition",
        image: "/images/gallery/field-sampling.jpg",
      },
      {
        title: "Environmental GIS & Hydrodynamics",
        category: "Campus & Field Mapping",
        image: "/images/jahangirnagar-campus-map.jpg",
      },
      {
        title: "Ecosystem Health & Bioremediation",
        category: "Resource Recovery",
        image: "/images/slide-4-impact.jpg",
      },
    ],
    cta: {
      badge: "ENGAGE WITH OUR WORK",
      headline: "Curious About Environmental Research?",
      description: "Whether you are an aspiring researcher interested in graduate thesis opportunities, a researcher seeking collaborative projects, or an agency in need of empirical data—our doors are open.",
      primaryBtnText: "Explore Opportunities",
      primaryBtnHref: "/team#opportunities",
      secondaryBtnText: "Contact Lab",
      secondaryBtnHref: "/contact",
    },
  },
  footer: {
    labName: "Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
    description: "Department of Environmental Sciences, Jahangirnagar University. Dedicated to understanding chemical fate, ecological vulnerabilities, and safeguarding human health through evidence-based science.",
    copyrightText: "© 2026 Laboratory of Environmental Health and Ecotoxicology (LabEHE). Jahangirnagar University. All rights reserved.",
  },
};

export function deepMerge<T extends Record<string, any>>(target: T, source: any): T {
  if (!source || typeof source !== "object") return target;
  const result: any = Array.isArray(target) ? [...target] : { ...target };

  for (const key of Object.keys(source)) {
    const sVal = source[key];
    const tVal = (target as any)?.[key];

    if (sVal === undefined || sVal === null) continue;

    if (Array.isArray(tVal) && Array.isArray(sVal)) {
      result[key] = sVal;
    } else if (
      typeof tVal === "object" &&
      tVal !== null &&
      typeof sVal === "object" &&
      sVal !== null &&
      !Array.isArray(tVal)
    ) {
      result[key] = deepMerge(tVal, sVal);
    } else {
      result[key] = sVal;
    }
  }
  return result;
}

export function sanitizeLandingData(data: LandingContentData): LandingContentData {
  const sanitized = { ...data };

  // Sanitize legacy unsplash mock images from aboutPage
  if (sanitized.aboutPage) {
    const about = { ...sanitized.aboutPage };

    if (!about.hero?.backgroundImageUrl || about.hero.backgroundImageUrl.includes("unsplash.com")) {
      about.hero = { ...about.hero, backgroundImageUrl: "/images/hero-clean-bg.jpg" };
    }

    if (!about.whoWeAre?.imageSrc || about.whoWeAre.imageSrc.includes("unsplash.com")) {
      about.whoWeAre = { ...about.whoWeAre, imageSrc: "/images/slide-2-lab.jpg" };
    }

    if (about.galleryImages && Array.isArray(about.galleryImages)) {
      const defaultGalleryMap: Record<number, string> = {
        0: "/images/gallery/analytical-instrumentation.jpg",
        1: "/images/gallery/microscopy-imaging.jpg",
        2: "/images/slide-3-analysis.jpg",
        3: "/images/gallery/field-sampling.jpg",
        4: "/images/jahangirnagar-campus-map.jpg",
        5: "/images/slide-4-impact.jpg",
      };

      about.galleryImages = about.galleryImages.map((item, idx) => {
        if (!item.image || item.image.includes("unsplash.com")) {
          return {
            ...item,
            image: defaultGalleryMap[idx] || "/images/gallery/analytical-instrumentation.jpg",
          };
        }
        return item;
      });
    }

    sanitized.aboutPage = about;
  }

  // Sanitize PI section image: remove legacy placeholders
  if (sanitized.piSection) {
    if (sanitized.piSection.imageSrc === "/images/hero-scientist.jpg" || sanitized.piSection.imageSrc?.includes("photo-1534528741775-53994a69daeb")) {
      sanitized.piSection = {
        ...sanitized.piSection,
        imageSrc: "",
      };
    }
  }

  // Sanitize contact aerial image if pointing to external unsplash placeholder
  if (sanitized.contactSection && (!sanitized.contactSection.aerialImageSrc || sanitized.contactSection.aerialImageSrc.includes("unsplash.com"))) {
    sanitized.contactSection = {
      ...sanitized.contactSection,
      aerialImageSrc: "/images/jahangirnagar-campus.jpg",
    };
  }

  return sanitized;
}

const STORAGE_KEY = "ecotox_landing_content_v2";

export function getStoredLandingData(): LandingContentData {
  if (typeof window === "undefined") return DEFAULT_LANDING_DATA;
  try {
    const raw = safeLocalStorageGet<LandingContentData>(STORAGE_KEY);
    if (raw) {
      const merged = deepMerge(DEFAULT_LANDING_DATA, raw);
      return sanitizeLandingData(merged);
    }
  } catch (e) {
    console.warn("Could not read landing content:", e);
  }
  return DEFAULT_LANDING_DATA;
}

export async function fetchLandingDataAsync(): Promise<LandingContentData> {
  // 1. First attempt to fetch live from Supabase site_settings
  try {
    const supabase = createClient();
    const { data, error } = await (supabase as any)
      .from("site_settings")
      .select("value")
      .eq("key", "landing_content")
      .maybeSingle();

    const value = (data as any)?.value;
    if (!error && value && typeof value === "object") {
      const remoteData = sanitizeLandingData(deepMerge(DEFAULT_LANDING_DATA, value));
      // Update local storage cache
      if (typeof window !== "undefined") {
        safeLocalStorageSet(STORAGE_KEY, remoteData);
        idbSet(STORAGE_KEY, remoteData).catch(() => {});
      }
      return remoteData;
    }
  } catch (err) {
    // Supabase error or offline - fallback to local storage
  }

  // 2. Check IndexedDB
  if (typeof window !== "undefined") {
    try {
      const idbData = await idbGet<LandingContentData>(STORAGE_KEY);
      if (idbData) {
        return sanitizeLandingData(deepMerge(DEFAULT_LANDING_DATA, idbData));
      }
    } catch {}
  }

  // 3. Fallback to localStorage / default
  return getStoredLandingData();
}

export async function saveLandingDataAsync(data: LandingContentData): Promise<boolean> {
  if (typeof window === "undefined") return false;
  const sanitized = sanitizeLandingData(data);
  try {
    // 1. Save directly into IndexedDB (guaranteed persistent storage)
    await idbSet(STORAGE_KEY, sanitized);

    // 2. Mirror into localStorage safely without throwing QuotaExceededError
    safeLocalStorageSet(STORAGE_KEY, sanitized);

    // 3. Sync to Supabase site_settings
    try {
      const supabase = createClient();
      await (supabase as any).from("site_settings").upsert({
        key: "landing_content",
        value: sanitized,
        updated_at: new Date().toISOString(),
      });
    } catch (syncErr) {
      console.warn("Supabase landing content sync warning:", syncErr);
    }

    window.dispatchEvent(new Event("landing-content-updated"));
    return true;
  } catch (e: any) {
    console.error("Failed to save landing content:", e);
    return false;
  }
}

export function saveLandingData(data: LandingContentData): boolean {
  if (typeof window === "undefined") return false;
  const sanitized = sanitizeLandingData(data);
  try {
    idbSet(STORAGE_KEY, sanitized).catch((err) => console.warn("IDB landing save error:", err));
    safeLocalStorageSet(STORAGE_KEY, sanitized);

    // Sync in background to Supabase
    try {
      const supabase = createClient();
      (supabase as any)
        .from("site_settings")
        .upsert({
          key: "landing_content",
          value: sanitized,
          updated_at: new Date().toISOString(),
        })
        .then(() => {})
        .catch((err: any) => console.warn("Background Supabase save warning:", err));
    } catch {}

    window.dispatchEvent(new Event("landing-content-updated"));
    return true;
  } catch (e: any) {
    console.error("Failed to save landing content:", e);
    return false;
  }
}

export function resetLandingData(): LandingContentData {
  if (typeof window !== "undefined") {
    idbDelete(STORAGE_KEY).catch(() => {});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    try {
      const supabase = createClient();
      (supabase as any)
        .from("site_settings")
        .upsert({
          key: "landing_content",
          value: DEFAULT_LANDING_DATA,
          updated_at: new Date().toISOString(),
        })
        .then(() => {})
        .catch(() => {});
    } catch {}

    window.dispatchEvent(new Event("landing-content-updated"));
  }
  return DEFAULT_LANDING_DATA;
}

export function useLandingData() {
  const [data, setData] = useState<LandingContentData>(DEFAULT_LANDING_DATA);

  useEffect(() => {
    // 1. Synchronously load from localStorage cache for instant render
    const initial = getStoredLandingData();
    setData(initial);

    // 2. Asynchronously fetch from Supabase (or IndexedDB)
    fetchLandingDataAsync().then((latest) => {
      setData(latest);
    }).catch(() => {});

    const handleUpdate = () => {
      setData(getStoredLandingData());
      fetchLandingDataAsync().then((latest) => {
        setData(latest);
      }).catch(() => {});
    };

    window.addEventListener("landing-content-updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("landing-content-updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return data;
}

