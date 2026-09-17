"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminThemeProvider, useAdminTheme } from "@/lib/admin-theme";
import {
  LayoutDashboard,
  FlaskConical,
  FolderGit2,
  BookOpen,
  Newspaper,
  Users,
  Briefcase,
  Inbox,
  Image as ImageIcon,
  Settings,
  LogOut,
  ExternalLink,
  ArrowUpRight,
  Search,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Bell,
  Layers,
  Clock,
  Sparkles,
  ChevronDown,
  AlertTriangle
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [tablesMissing, setTablesMissing] = useState(false);

  useEffect(() => {
    fetch("/api/admin/supabase-status")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.allTablesReady) {
          setTablesMissing(true);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      if (pathname === "/admin/login") {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (!mounted) return;

        if (error || !user) {
          window.location.href = `/auth/login?redirectTo=${encodeURIComponent(pathname)}`;
          return;
        }

        setUserEmail(user.email || "sasajeeb1@gmail.com");
        setUserName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Lab Administrator");
        setIsCheckingAuth(false);
      } catch (e) {
        console.error("Auth check error:", e);
        if (mounted) {
          window.location.href = `/auth/login?redirectTo=${encodeURIComponent(pathname)}`;
        }
      }
    }

    checkAuth();

    try {
      const supabase = createClient();
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_OUT" || !session?.user) {
          if (pathname !== "/admin/login") {
            window.location.href = `/auth/login?redirectTo=${encodeURIComponent(pathname)}`;
          }
        } else if (session?.user) {
          setUserEmail(session.user.email || "sasajeeb1@gmail.com");
          setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Lab Administrator");
          setIsCheckingAuth(false);
        }
      });

      return () => {
        mounted = false;
        authListener?.subscription.unsubscribe();
      };
    } catch {
      return () => {
        mounted = false;
      };
    }
  }, [pathname, router]);

  const handleSignOut = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    try {
      if (typeof window !== "undefined") {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith("sb-") || key.includes("auth-token") || key.includes("supabase"))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && (key.startsWith("sb-") || key.includes("auth-token") || key.includes("supabase"))) {
            sessionStorage.removeItem(key);
          }
        }
      }
    } catch (err) {
      console.error("Storage clear error:", err);
    }

    try {
      const supabase = createClient();
      supabase.auth.signOut({ scope: "global" }).catch(() => {});
    } catch (err) {
      console.error("Sign out client error:", err);
    }

    window.location.href = "/api/auth/signout";
  };

  interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  interface NavSection {
    title: string | null;
    items: NavItem[];
  }

  const navSections: NavSection[] = [
    {
      title: null,
      items: [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
      ]
    },
    {
      title: "CONTENT",
      items: [
        { name: "About Page", href: "/admin/about", icon: ShieldCheck },
        { name: "Research", href: "/admin/research", icon: FlaskConical },
        { name: "Projects", href: "/admin/projects", icon: FolderGit2 },
        { name: "Publications", href: "/admin/publications", icon: BookOpen },
        { name: "People", href: "/admin/people", icon: Users },
        { name: "News & Insights", href: "/admin/news", icon: Newspaper },
      ]
    },
    {
      title: "INBOX",
      items: [
        { name: "Inquiries & Inbox", href: "/admin/inbox", icon: Inbox },
      ]
    },
    {
      title: "ASSETS",
      items: [
        { name: "Media Library", href: "/admin/media", icon: ImageIcon },
      ]
    },
    {
      title: "SYSTEM",
      items: [
        { name: "Website", href: "/admin/landing", icon: Layers },
        { name: "Activity Log", href: "/admin/activity", icon: Clock },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ]
    }
  ];

  const isLight = theme === "light";

  if (isCheckingAuth) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isLight ? "bg-[#F4F6F8] text-slate-800" : "bg-[#090D16] text-slate-100"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#14532D] to-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/20 animate-pulse">
            <FlaskConical className="w-6 h-6 text-white" />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-emerald-500">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>Verifying Admin Authorization...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex ${isLight ? "bg-[#F4F6F8] text-slate-800" : "bg-[#090D16] text-slate-100"} font-sans antialiased`}>
      {/* Desktop Sidebar (Obsidian Slate - No Green BG) */}
      <aside className={`hidden lg:flex flex-col ${isCollapsed ? "w-20" : "w-64"} ${
        isLight ? "bg-white border-r border-slate-200/90 shadow-xs" : "bg-[#0B1120] border-r border-slate-800/80 shadow-xl"
      } transition-all duration-300 z-30 shrink-0 select-none`}>
        
        {/* Brand Header */}
        <div className={`h-20 px-5 flex items-center justify-between border-b ${
          isLight ? "border-slate-100" : "border-slate-800/80"
        }`}>
          <Link href="/admin" className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#14532D] to-[#10B981] text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <FlaskConical className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className={`font-bold text-xs leading-tight line-clamp-2 ${isLight ? "text-slate-900" : "text-white"}`}>
                  Laboratory of Environmental Health and Ecotoxicology
                </span>
                <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-400"} font-medium tracking-wide mt-0.5`}>
                  LabEHE • Jahangirnagar University
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`p-1.5 rounded-lg shrink-0 ${isLight ? "hover:bg-slate-100 text-slate-400" : "hover:bg-slate-800 text-slate-400"} transition-colors`}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-thin">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              {!isCollapsed && section.title && (
                <div className={`px-3 py-1 text-[10px] font-bold tracking-wider uppercase ${isLight ? "text-slate-400" : "text-slate-500"}`}>
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = item.href === "/admin" 
                  ? pathname === "/admin" 
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center ${isCollapsed ? "justify-center px-0" : "justify-between px-3.5"} py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? isLight
                          ? "bg-emerald-50 text-emerald-700 font-bold shadow-xs border border-emerald-200/60"
                          : "bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/30"
                        : isLight
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100/90"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                    }`}
                    title={isCollapsed ? item.name : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? (isLight ? "text-emerald-600" : "text-emerald-400") : isLight ? "text-slate-500" : "text-slate-400"}`} />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </div>
                    {!isCollapsed && item.badge && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive 
                          ? isLight ? "bg-emerald-600 text-white" : "bg-emerald-400 text-slate-950" 
                          : isLight ? "bg-slate-200 text-slate-700" : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Profile Footer */}
        <div className={`p-4 border-t ${isLight ? "border-slate-100 bg-slate-50/50" : "border-slate-800/80 bg-[#090D16]/50"} relative z-20`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between gap-3"}`}>
            {isCollapsed ? (
              <a
                href="/api/auth/signout"
                onClick={(e) => handleSignOut(e)}
                title="Sign out of Admin"
                className="relative group p-1 rounded-xl hover:bg-rose-500/10 transition cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm group-hover:hidden">
                  {userName.charAt(0)}
                </div>
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white hidden group-hover:flex items-center justify-center font-bold text-xs shadow-sm">
                  <LogOut className="w-3.5 h-3.5" />
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900 group-hover:hidden" />
              </a>
            ) : (
              <>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {userName.charAt(0)}
                    </div>
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-900" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-xs font-bold leading-tight truncate ${isLight ? "text-slate-800" : "text-white"}`}>
                      {userName}
                    </span>
                    <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                      Administrator • <span className="text-emerald-500 font-medium">Online</span>
                    </span>
                  </div>
                </div>

                <a
                  href="/api/auth/signout"
                  onClick={(e) => handleSignOut(e)}
                  title="Sign out"
                  className={`p-2 rounded-xl border text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 ${
                    isLight ? "border-rose-200 bg-rose-50/80" : "border-rose-500/30 bg-rose-950/40"
                  } transition-all cursor-pointer shrink-0 flex items-center justify-center`}
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                </a>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className={`h-16 px-4 sm:px-8 flex items-center justify-between border-b ${
          isLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0B1120]/95 border-slate-800/80 backdrop-blur-md"
        } transition-colors z-20 shrink-0`}>
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-xl border ${
                isLight ? "border-slate-200 text-slate-600" : "border-slate-700 text-slate-300"
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Top Search Bar */}
            <div className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl border w-full max-w-md ${
              isLight ? "bg-slate-50 border-slate-200 text-slate-400" : "bg-[#090D16] border-slate-800 text-slate-400"
            } text-xs`}>
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, publications, people..."
                className={`bg-transparent outline-none w-full ${isLight ? "text-slate-800 placeholder-slate-400" : "text-white placeholder-slate-500"}`}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Daylight / Dark Mode Switcher */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                isLight
                  ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  : "bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-700"
              }`}
              title={isLight ? "Switch to Dark Mode" : "Switch to Daylight Mode"}
            >
              {isLight ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Notification Bell */}
            <button
              className={`relative p-2 rounded-xl border ${
                isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
              }`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {/* Profile Avatar Pill & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2.5 pl-2 py-1 pr-1.5 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition cursor-pointer ${
                  profileDropdownOpen ? (isLight ? "bg-slate-100" : "bg-slate-800") : ""
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {userName.charAt(0)}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className={`text-xs font-bold leading-tight ${isLight ? "text-slate-800" : "text-white"}`}>
                    {userName}
                  </span>
                  <span className={`text-[10px] ${isLight ? "text-slate-400" : "text-slate-400"}`}>
                    Administrator
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:block transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div
                    className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
                      isLight ? "bg-white border-slate-200" : "bg-[#0F172A] border-slate-800"
                    }`}
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className={`text-xs font-bold truncate ${isLight ? "text-slate-900" : "text-white"}`}>
                        {userName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {userEmail || "admin@ecotox-ju.ac.bd"}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        Active Administrator
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/admin/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Admin Settings</span>
                      </Link>

                      <Link
                        href="/"
                        target="_blank"
                        onClick={() => setProfileDropdownOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                          isLight ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                          <span>View Live Website</span>
                        </div>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={(e) => {
                          setProfileDropdownOpen(false);
                          handleSignOut(e);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Sidebar Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex">
            <div className={`w-72 h-full flex flex-col justify-between p-5 ${
              isLight ? "bg-white" : "bg-[#0B1120]"
            } shadow-2xl animate-in slide-in-from-left`}>
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#14532D] to-[#10B981] text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                      <FlaskConical className="w-4 h-4 text-white stroke-[2.2]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-xs">LabEHE Admin</span>
                      <span className="text-[10px] text-slate-400">Jahangirnagar Univ</span>
                    </div>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-1 text-slate-400">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-4">
                  {navSections.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-1">
                      {sec.title && (
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                          {sec.title}
                        </div>
                      )}
                      {sec.items.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium ${
                            pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
                              ? "bg-emerald-600 text-white font-semibold"
                              : isLight ? "text-slate-600 hover:bg-slate-100" : "text-slate-400 hover:bg-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <item.icon className="w-4 h-4" />
                            <span>{item.name}</span>
                          </div>
                          {item.badge && (
                            <span className="text-[10px] font-bold px-1.5 rounded-full bg-white/20 text-white">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ))}
                </nav>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold">{userName}</span>
                <button
                  type="button"
                  onClick={(e) => handleSignOut(e)}
                  className="text-xs text-rose-500 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {tablesMissing && pathname !== "/admin/settings" && (
            <div className="mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>
                  <strong>Cloud Sync Notice:</strong> Supabase database tables need setup so changes sync across your phone and deployed website.
                </span>
              </div>
              <Link
                href="/admin/settings"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 dark:text-amber-100 font-bold transition shrink-0"
              >
                <span>Setup &amp; Copy SQL</span>
                <span>&rarr;</span>
              </Link>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminThemeProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminThemeProvider>
  );
}
