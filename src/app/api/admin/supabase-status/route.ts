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

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      configured: false,
      error: "Supabase credentials not configured in environment.",
      tables: {},
      allTablesReady: false,
    });
  }

  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const tableStatus: Record<string, boolean> = {};

  for (const table of TABLE_NAMES) {
    try {
      const { error } = await client.from(table).select("*").limit(1);
      if (error && (error.code === "PGRST205" || error.message?.includes("Could not find the table") || error.message?.includes("relation"))) {
        tableStatus[table] = false;
      } else {
        tableStatus[table] = !error;
      }
    } catch {
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
