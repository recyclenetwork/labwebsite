import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local if available
const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valParts] = trimmed.split("=");
      const val = valParts.join("=").trim();
      if (key === "NEXT_PUBLIC_SUPABASE_URL" && !supabaseUrl) supabaseUrl = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY" && !supabaseServiceKey) supabaseServiceKey = val;
      if (key === "NEXT_PUBLIC_SUPABASE_ANON_KEY" && !supabaseAnonKey) supabaseAnonKey = val;
    }
  });
}

console.log("==================================================");
console.log("   LabEHE Supabase Database Diagnostic Tool");
console.log("==================================================");
console.log(`URL: ${supabaseUrl || "MISSING"}`);
console.log(`Service Role Key: ${supabaseServiceKey ? "[PRESENT]" : "[MISSING]"}`);
console.log(`Anon Key: ${supabaseAnonKey ? "[PRESENT]" : "[MISSING]"}\n`);

if (!supabaseUrl || (!supabaseServiceKey && !supabaseAnonKey)) {
  console.error("❌ Missing Supabase configuration in .env.local!");
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

const TABLES = [
  "profiles",
  "site_settings",
  "people",
  "projects",
  "publications",
  "news",
  "research_areas",
  "gallery_events",
  "inquiries",
  "opportunities",
  "messages",
  "applications"
];

async function checkHealth() {
  console.log("Checking database table status...\n");
  let foundCount = 0;
  let missingCount = 0;

  for (const table of TABLES) {
    try {
      const res = await client
        .from(table)
        .select("*")
        .limit(1);

      if (res.error) {
        console.log(`❌ Table '${table}': NOT FOUND (${res.error.message || res.error.code})`);
        missingCount++;
      } else {
        const { count } = await client.from(table).select("*", { count: "exact", head: true });
        console.log(`✅ Table '${table}': READY (${count ?? 0} records)`);
        foundCount++;
      }
    } catch (e) {
      console.log(`❌ Table '${table}': Exception (${e.message})`);
      missingCount++;
    }
  }

  console.log("\n--------------------------------------------------");
  console.log(`Summary: ${foundCount} / ${TABLES.length} tables found`);
  console.log("--------------------------------------------------\n");

  if (missingCount > 0) {
    console.log("👉 ACTION REQUIRED:");
    console.log("1. Open your Supabase Project Dashboard -> SQL Editor:");
    console.log(`   ${supabaseUrl.replace(".supabase.co", "")}`);
    console.log("2. Open the file 'supabase/schema.sql' in this repo.");
    console.log("3. Copy and paste the entire content into the SQL Editor and click 'RUN'.");
    console.log("4. Re-run this check: node scripts/db-health.mjs\n");
  } else {
    console.log("🎉 All tables are in place and operational!");
  }
}

checkHealth();
