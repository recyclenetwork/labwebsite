"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Search, Menu, X, ArrowRight, Leaf } from "lucide-react";
import { PUBLIC_NAV_ITEMS } from "@/constants";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { SearchModal } from "./search-modal";

export function Navbar() {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const isHomePage = pathname === "/";
  const isSolidNav = isScrolled || !isHomePage;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isSolidNav
            ? "bg-white/95 dark:bg-black/20 dark:backdrop-blur-md border-b border-slate-200/90 dark:border-white/10 shadow-xs dark:shadow-none py-3"
            : "bg-gradient-to-b from-black/80 via-black/40 to-transparent dark:bg-transparent border-b border-white/10 backdrop-blur-[2px] dark:backdrop-blur-none py-4 sm:py-5"
          }`}
      >
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Lab Brand Logo & Academic Identity */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3.5 group flex-shrink-0 min-w-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-[#14532D] to-[#10B981] flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
                <FlaskConical className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white stroke-[2.2]" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-extrabold text-[12.5px] sm:text-[14.5px] leading-tight tracking-tight transition-colors truncate ${isSolidNav
                        ? "text-slate-900 dark:text-white"
                        : "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)]"
                      }`}
                  >
                    <span className="inline sm:hidden">LabEHE • Ecotoxicology Lab</span>
                    <span className="hidden sm:inline">Laboratory of Environmental Health and Ecotoxicology</span>
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black tracking-wider hidden md:inline-block border transition-colors ${isSolidNav
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-300/80 dark:border-emerald-500/30"
                        : "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      }`}
                  >
                    LabEHE
                  </span>
                </div>
                <span
                  className={`text-[9.5px] sm:text-[10.5px] font-semibold mt-0.5 transition-colors truncate ${isSolidNav
                      ? "text-emerald-700 dark:text-emerald-300"
                      : "text-emerald-300 drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]"
                    }`}
                >
                  <span className="inline sm:hidden">Dept. of Env. Sciences • JU</span>
                  <span className="hidden sm:inline">Department of Environmental Sciences • Jahangirnagar University</span>
                </span>
              </div>
            </Link>

            {/* Center: Enhanced Navigation Links */}
            <nav className="hidden xl:flex items-center gap-1.5">
              {PUBLIC_NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-xl text-[13px] tracking-tight transition-all duration-200 ${isActive
                        ? isSolidNav
                          ? "bg-emerald-100/90 text-[#14532D] dark:bg-emerald-500/20 dark:text-[#34D399] dark:border-emerald-500/30 font-bold shadow-xs border border-emerald-300/70"
                          : "bg-white/20 backdrop-blur-md text-[#34D399] border border-white/25 font-bold shadow-sm"
                        : isSolidNav
                          ? "text-slate-700 dark:text-white/85 hover:text-[#14532D] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 font-semibold dark:font-medium"
                          : "text-white/90 hover:text-white hover:bg-white/15 drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)] font-medium"
                      }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Actions (Search, Theme Toggle, Single Primary CTA) */}
            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search laboratory content"
                title="Search website"
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer active:scale-95 border ${isSolidNav
                    ? "border-slate-200 dark:border-transparent bg-slate-100 dark:bg-transparent text-slate-700 hover:text-[#14532D] dark:text-white/90 dark:hover:text-white hover:bg-emerald-50 dark:hover:bg-white/10"
                    : "border-transparent text-white/90 hover:text-white hover:bg-white/10"
                  }`}
              >
                <Search className="w-4 h-4" />
              </button>

              <ThemeToggle
                className={
                  isSolidNav
                    ? "dark:border-transparent dark:bg-transparent dark:text-white dark:hover:bg-white/10 dark:shadow-none"
                    : "border-transparent bg-transparent text-white hover:bg-white/10 shadow-none"
                }
              />

              <Link
                href="/contact"
                className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all active:scale-95 border ${isSolidNav
                    ? "bg-[#14532D] hover:bg-[#166534] text-white border-transparent shadow-md shadow-emerald-900/15 dark:bg-[#10B981] dark:hover:bg-[#34D399] dark:text-[#04150C] dark:font-bold dark:shadow-md dark:shadow-emerald-500/20"
                    : "bg-[#10B981] hover:bg-[#34D399] text-[#04150C] border-transparent font-bold shadow-md shadow-emerald-500/20"
                  }`}
              >
                <span>Connect With Us</span>
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex md:hidden items-center gap-2">
              <ThemeToggle
                className={
                  isSolidNav
                    ? ""
                    : "border-white/25 bg-black/20 backdrop-blur-md text-white hover:bg-white/20 shadow-sm"
                }
              />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
                className={`p-2.5 rounded-xl border transition-colors ${isSolidNav
                    ? "border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800/60 hover:bg-emerald-50"
                    : "border-white/25 bg-black/20 backdrop-blur-md text-white hover:bg-white/20 shadow-sm"
                  }`}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Slide-in Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative ml-auto w-full max-w-xs sm:max-w-sm h-full bg-white dark:bg-[#090D16] border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#14532D] to-[#10B981] flex items-center justify-center font-bold shadow-md shadow-emerald-500/20 shrink-0">
                    <FlaskConical className="w-5 h-5 text-white stroke-[2.2]" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">LabEHE</span>
                    <span className="text-[10px] font-mono-scientific text-emerald-600 dark:text-[#34D399] uppercase tracking-wider">Environmental Health Lab</span>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Search Button */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setSearchOpen(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500"
              >
                <Search className="w-4 h-4 text-[#047857]" />
                <span>Search website...</span>
              </button>

              {/* Mobile Navigation Links */}
              <nav className="flex flex-col space-y-1">
                {PUBLIC_NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-900 dark:text-white hover:bg-[#E8F5EE] dark:hover:bg-slate-800/80 hover:text-[#14532D] transition-colors"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <Link
                href="/contact"
                className="block w-full py-3 px-4 rounded-full bg-[#14532D] hover:bg-[#166534] text-white text-center text-xs font-bold uppercase tracking-wider shadow"
              >
                Connect With Us
              </Link>
              <p className="text-center text-[11px] text-slate-500 font-mono-scientific">
                Department of Environmental Science &amp; Health
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Site-wide Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
