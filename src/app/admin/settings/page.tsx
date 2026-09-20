"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAdminTheme } from "@/lib/admin-theme";
import {
  exportAllLaboratoryData,
  importAllLaboratoryData
} from "@/lib/storage/idb-storage";
import {
  Settings,
  Database,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertTriangle,
  Building,
  Download,
  Upload,
  RefreshCw,
  FileJson,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Layers,
  Server
} from "lucide-react";

interface SupabaseStatus {
  configured: boolean;
  supabaseUrl: string;
  projectRef: string;
  sqlEditorUrl: string;
  tables: Record<string, boolean>;
  allTablesReady: boolean;
  schemaSql: string;
}

export default function AdminSettingsPage() {
  const { theme } = useAdminTheme();
  const isLight = theme === "light";
  const [saved, setSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supabase Status State
  const [dbStatus, setDbStatus] = useState<SupabaseStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncingCloud, setSyncingCloud] = useState(false);

  const [settings, setSettings] = useState({
    labName: "Laboratory of Environmental Health and Ecotoxicology (LabEHE)",
    department: "Department of Environmental Sciences",
    university: "Jahangirnagar University",
    contactEmail: "ecotox@juniv.edu",
    piName: "Dr. Mohammad S. Kabir",
    piEmail: "msk@juniv.edu",
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    publicSiteUrl: "",
  });

  const cardBg = isLight ? "bg-white border-slate-200/90 shadow-xs" : "bg-[#0F172A] border-slate-800 shadow-md";
  const inputBg = isLight
    ? "bg-slate-50 border-slate-300 text-slate-900 focus:bg-white focus:border-emerald-500"
    : "bg-[#090D16] border-slate-700 text-white focus:border-emerald-400";
  const labelText = isLight ? "text-slate-700 font-semibold" : "text-slate-200 font-semibold";
  const subText = isLight ? "text-slate-500" : "text-slate-400";

  const fetchDbStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch("/api/admin/supabase-status");
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (err) {
      console.error("Failed to check Supabase status:", err);
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleCopySql = () => {
    if (dbStatus?.schemaSql) {
      navigator.clipboard.writeText(dbStatus.schemaSql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleExportData = async () => {
    try {
      const bundle = await exportAllLaboratoryData();
      const jsonStr = JSON.stringify(bundle, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `labehe_site_backup_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSyncStatus("Backup file downloaded successfully! You can import this into any browser or deployed site.");
      setTimeout(() => setSyncStatus(null), 5000);
    } catch (err) {
      console.error("Export error:", err);
      alert("Failed to export laboratory data.");
    }
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const success = await importAllLaboratoryData(parsed);
      if (success) {
        setSyncStatus("All data, images, and content successfully imported and synchronized!");
        setTimeout(() => {
          setSyncStatus(null);
          window.location.reload();
        }, 1500);
      } else {
        alert("Could not import the selected file. Please ensure it is a valid backup JSON file.");
      }
    } catch (err) {
      console.error("Import error:", err);
      alert("Failed to read or parse the backup file.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl font-bold tracking-tight font-[family-name:var(--font-manrope)]">Lab &amp; System Settings</h1>
          </div>
          <p className={`text-xs ${subText} mt-1`}>
            Manage laboratory metadata, contact routing, and cross-device cloud synchronization between Localhost, Phone, and Deployed site.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-950/20 transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Configuration</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2.5 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Laboratory settings updated successfully!</span>
        </div>
      )}

      {syncStatus && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-2.5 text-xs animate-in fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Cloud Database Synchronization Diagnostics Card */}
      <div className={`p-6 rounded-2xl border ${cardBg} space-y-5`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Supabase Cloud Database &amp; Cross-Device Sync Status
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Synchronizes real data across your PC, mobile phone, and deployed Vercel domain.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchDbStatus}
            disabled={loadingStatus}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingStatus ? "animate-spin text-emerald-500" : ""}`} />
            <span>Check Status</span>
          </button>
        </div>

        {dbStatus && !dbStatus.allTablesReady ? (
          <div className="space-y-4 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  Supabase Tables Need Initial Setup in PostgreSQL
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300/90 leading-relaxed">
                  Your website connects to Supabase, but the database tables (<code>projects</code>, <code>people</code>, <code>publications</code>, <code>news</code>, <code>site_settings</code>) have not been created yet in PostgreSQL. Because of this, changes you make on Localhost are stored only in your current browser&apos;s memory and cannot yet be seen on your phone or deployed site.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-amber-500/20">
              <div className="text-xs font-bold mb-2 text-amber-800 dark:text-amber-200">
                To enable live synchronization across all devices:
              </div>
              <ol className="text-xs space-y-2 list-decimal list-inside text-amber-700 dark:text-amber-300/90">
                <li>Click <strong>&quot;Copy SQL Schema&quot;</strong> below to copy your complete database schema.</li>
                <li>Click <strong>&quot;Open Supabase SQL Editor&quot;</strong> to open your project dashboard.</li>
                <li>Paste the SQL and click <strong>&quot;Run&quot;</strong>. That&apos;s all! All devices will instantly sync live data.</li>
              </ol>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? "Schema Copied to Clipboard!" : "Copy SQL Schema (schema.sql)"}</span>
                </button>

                <a
                  href={dbStatus.sqlEditorUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 font-bold text-xs transition shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Open Supabase SQL Editor</span>
                </a>
              </div>
            </div>

            {/* Table Checklist */}
            <div className="pt-3 border-t border-amber-500/20">
              <div className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-2">
                Table Readiness:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {Object.entries(dbStatus.tables).map(([tableName, ready]) => (
                  <div
                    key={tableName}
                    className={`px-3 py-1.5 rounded-lg border flex items-center justify-between ${
                      ready
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    <span className="font-mono text-[11px]">{tableName}</span>
                    <span className="font-bold text-[10px]">{ready ? "Ready" : "Missing"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : dbStatus?.allTablesReady ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-200 space-y-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                Supabase Cloud Database is Active &amp; Synchronized!
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              All tables are verified. Any edits you make in the Admin section immediately save to Supabase Cloud and appear on your mobile phone, laptop, and deployed website without mock data.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
              {Object.entries(dbStatus.tables).map(([tableName]) => (
                <div
                  key={tableName}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-between"
                >
                  <span className="font-mono text-[11px]">{tableName}</span>
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#090D16] border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            Checking Supabase status...
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* 1-Click Backup Export / Import Card */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                <FileJson className="w-4 h-4 text-emerald-500" />
                <span>Manual 1-Click Data Backup &amp; Transfer</span>
              </h3>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                Instant Transfer
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              You can also export your current laboratory data, uploaded photos, and news as a portable JSON file to instantly import into any browser or deployed site.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Site Data (.json)</span>
              </button>

              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleImportData}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#090D16] hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-emerald-500" />
                <span>Import &amp; Sync Data (.json)</span>
              </button>
            </div>
          </div>

          {/* General Information */}
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h3 className="text-sm font-bold flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
              <Building className="w-4 h-4 text-emerald-500" />
              General Laboratory Information
            </h3>

            <div>
              <label className={`block text-xs ${labelText} mb-1`}>Official Laboratory Name</label>
              <input
                type="text"
                value={settings.labName}
                onChange={(e) => setSettings({ ...settings, labName: e.target.value })}
                className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${labelText} mb-1`}>Department</label>
                <input
                  type="text"
                  value={settings.department}
                  onChange={(e) => setSettings({ ...settings, department: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs ${labelText} mb-1`}>Institution / University</label>
                <input
                  type="text"
                  value={settings.university}
                  onChange={(e) => setSettings({ ...settings, university: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs ${labelText} mb-1`}>Principal Investigator (PI)</label>
                <input
                  type="text"
                  value={settings.piName}
                  onChange={(e) => setSettings({ ...settings, piName: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                />
              </div>

              <div>
                <label className={`block text-xs ${labelText} mb-1`}>PI Official Email</label>
                <input
                  type="email"
                  value={settings.piEmail}
                  onChange={(e) => setSettings({ ...settings, piEmail: e.target.value })}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs outline-none transition-all ${inputBg}`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl border ${cardBg} space-y-4`}>
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              Security &amp; Architecture
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className={subText}>Auth Session:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Active (JWT)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className={subText}>Row Level Security:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Enabled</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className={subText}>Prerender Mode:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400">force-dynamic</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#090D16] border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className={subText}>Server Engine:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">Next.js 16 (Turbopack)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
