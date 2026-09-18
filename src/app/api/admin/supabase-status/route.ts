import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const TABLE_NAMES = [
  "projects",
  "people",
  "publications",
  "news",
  "site_settings",
  "research_areas",
];

export async function GET() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "https://ztgwpyoztzpvqnwoixuy.supabase.co";

  // Use service role key if available, otherwise fall back to anon key
  // Both can query tables — the anon key works for RLS-enabled tables
  const apiKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !apiKey) {
    return NextResponse.json({
      configured: false,
      error: "Supabase credentials not configured in environment.",
      tables: {},
      allTablesReady: false,
    });
  }

  const client = createClient(supabaseUrl, apiKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tableStatus: Record<string, boolean> = {};

  for (const table of TABLE_NAMES) {
    try {
      const { data, error } = await client.from(table).select("*").limit(1);

      if (error) {
        // Only mark as missing if the error specifically says table doesn't exist
        if (
          error.code === "PGRST205" ||
          error.message?.includes("Could not find the table") ||
          error.message?.includes("relation") ||
          error.code === "42P01"
        ) {
          tableStatus[table] = false;
        } else {
          // Other errors (e.g. RLS permission, network) — table likely exists
          // but we can't query it. Mark as true to avoid false "not created" warning.
          tableStatus[table] = true;
        }
      } else {
        // No error means table exists (data may be empty array, that's fine)
        tableStatus[table] = true;
      }
    } catch {
      // Network or runtime error — don't mark tables as missing
      tableStatus[table] = false;
    }
  }

  const allTablesReady = Object.values(tableStatus).every(Boolean);

  let schemaSql = "";
  try {
    const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
    if (fs.existsSync(schemaPath)) {
      schemaSql = fs.readFileSync(schemaPath, "utf-8");
    }
  } catch {
    // ignore
  }

  // Extract project ref from URL
  let projectRef = "ztgwpyoztzpvqnwoixuy";
  try {
    const urlObj = new URL(supabaseUrl);
    projectRef = urlObj.hostname.split(".")[0] || projectRef;
  } catch {}

  const sqlEditorUrl = `https://supabase.com/dashboard/project/${projectRef}/sql/new`;

  return NextResponse.json({
    configured: true,
    supabaseUrl,
    projectRef,
    sqlEditorUrl,
    tables: tableStatus,
    allTablesReady,
    schemaSql,
  });
}
