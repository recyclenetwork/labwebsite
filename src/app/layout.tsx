import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#04150C" },
  ],
};

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://labehe.org";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Laboratory of Environmental Health and Ecotoxicology (LabEHE) | JU",
    template: "%s | LabEHE - Jahangirnagar University (ENV JU)",
  },
  description:
    "Official research laboratory of the Department of Environmental Sciences, Jahangirnagar University (JU / ENV JU). Investigating environmental toxicology, microplastics, heavy metals, aquatic health, and contaminants under the leadership of Dr. Mohammad Mostafizur Rahman PhD. Platform engineered by Shahed Anan Sajeeb (Env-49).",
  keywords: [
    "Laboratory of Environmental Health and Ecotoxicology",
    "LabEHE",
    "JU",
    "ENV JU",
    "Jahangirnagar University",
    "Department of Environmental Sciences Jahangirnagar University",
    "Dr. Mohammad Mostafizur Rahman PhD",
    "Dr. Mostafizur Rahman",
    "Mostafizur Rahman JU",
    "Shahed Anan Sajeeb",
    "Shahed Anan Sajeeb Env-49",
    "Shahed Anan Sajeeb JU",
    "Shahed Anan Sajeeb researcher & developer",
    "Ecotoxicology JU",
    "Environmental Health Bangladesh",
    "Microplastics Research Bangladesh",
    "Heavy Metal Ecotoxicology",
    "Aquatic Health & Watersheds",
    "Environmental Contaminants",
    "Toxicology Research Bangladesh",
    "Ecological Risk Assessment",
  ],
  authors: [
    { name: "Dr. Mohammad Mostafizur Rahman PhD", url: `${siteUrl}/team` },
    { name: "Shahed Anan Sajeeb", url: `${siteUrl}/team` },
  ],
  creator: "Shahed Anan Sajeeb (Env-49)",
  publisher: "Laboratory of Environmental Health and Ecotoxicology (LabEHE), Jahangirnagar University",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Laboratory of Environmental Health and Ecotoxicology (LabEHE) - JU",
    title: "Laboratory of Environmental Health and Ecotoxicology (LabEHE) | Jahangirnagar University",
    description:
      "Premier environmental health and ecotoxicology research portal at Jahangirnagar University (ENV JU), led by Dr. Mohammad Mostafizur Rahman PhD. Platform developed by Shahed Anan Sajeeb.",
  },
  twitter: {
    card: "summary_large_image",
    title: "LabEHE | Jahangirnagar University (ENV JU)",
    description:
      "Environmental health and ecotoxicology research facility at Jahangirnagar University, led by Dr. Mohammad Mostafizur Rahman PhD.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "ResearchOrganization",
      "@id": `${siteUrl}/#organization`,
      name: "Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
      alternateName: [
        "LabEHE",
        "ENV JU Laboratory",
        "Ecotoxicology Lab Jahangirnagar University",
        "JU Environmental Health Lab",
      ],
      url: siteUrl,
      parentOrganization: {
        "@type": "CollegeOrUniversity",
        name: "Jahangirnagar University",
        alternateName: ["JU"],
        url: "https://juniv.edu",
      },
      department: {
        "@type": "EducationalOrganization",
        name: "Department of Environmental Sciences",
        alternateName: ["ENV JU"],
      },
      member: [
        {
          "@type": "Person",
          name: "Dr. Mohammad Mostafizur Rahman PhD",
          jobTitle: "Principal Investigator & Professor",
          worksFor: { "@id": `${siteUrl}/#organization` },
        },
        {
          "@type": "Person",
          name: "Shahed Anan Sajeeb",
          jobTitle: "Lead Research Technologist & Systems Developer (Env-49)",
          worksFor: { "@id": `${siteUrl}/#organization` },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} font-sans`}
    >
      <body className="font-sans min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-300 antialiased selection:bg-[#10B981]/30 selection:text-[#34D399]">
        {/* Schema.org Structured Data (JSON-LD) for Search Engines & Google Knowledge Graph */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* Immediate theme initialization to prevent flash of unstyled content */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('ecotox-theme') || 'light';
                document.documentElement.setAttribute('data-theme', theme);
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />

        {children}
      </body>
    </html>
  );
}
