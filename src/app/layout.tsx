import type { Metadata, Viewport } from "next";
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

export const metadata: Metadata = {
  title: {
    default: "Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
    template: "%s | Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
  },
  description:
    "Leading academic research laboratory investigating environmental contaminants, exposure pathways, biological responses, and impacts on ecological and human health.",
  keywords: [
    "Ecotoxicology",
    "Environmental Health",
    "Microplastics",
    "Environmental Contaminants",
    "Toxicology Research",
    "Ecological Risk Assessment",
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
      <head>
        <script
          id="theme-init"
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
      </head>
      <body className="font-sans min-h-screen bg-[var(--bg-page)] text-[var(--text-main)] transition-colors duration-300 antialiased selection:bg-[#10B981]/30 selection:text-[#34D399]">
        {children}
      </body>
    </html>
  );
}
