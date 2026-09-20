import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valParts] = trimmed.split("=");
      const val = valParts.join("=").trim();
      if (key === "NEXT_PUBLIC_SUPABASE_URL" && !supabaseUrl) supabaseUrl = val;
      if (key === "SUPABASE_SERVICE_ROLE_KEY" && !supabaseServiceKey) supabaseServiceKey = val;
    }
  });
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const OLD_EMAIL = "sasajeeb1@gmail.com";
const NEW_EMAIL = process.env.ADMIN_EMAIL || "labeheenvju@gmail.com";
const NEW_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || process.argv[2];

async function manageAdmin() {
  console.log("==========================================");
  console.log("   LabEHE Admin Account Transition");
  console.log("==========================================");

  // 1. List existing users
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) {
    console.error("Failed to list users:", listError.message);
    process.exit(1);
  }

  console.log(`Found ${users.length} user(s) in Supabase Auth.`);

  // 2. Delete old email account if present
  const oldUser = users.find((u) => u.email?.toLowerCase() === OLD_EMAIL.toLowerCase());
  if (oldUser) {
    console.log(`Deleting old admin user: ${OLD_EMAIL} (ID: ${oldUser.id})...`);
    // First remove from public.profiles if exists
    await supabase.from("profiles").delete().eq("id", oldUser.id);
    const { error: delError } = await supabase.auth.admin.deleteUser(oldUser.id);
    if (delError) {
      console.warn(`Warning deleting old user: ${delError.message}`);
    } else {
      console.log(`Successfully deleted ${OLD_EMAIL}.`);
    }
  } else {
    console.log(`Old account ${OLD_EMAIL} was not found in Supabase.`);
  }

  // 3. Check if new email account already exists
  let existingNewUser = users.find((u) => u.email?.toLowerCase() === NEW_EMAIL.toLowerCase());

  let targetUserId = "";

  if (existingNewUser) {
    console.log(`Updating existing account: ${NEW_EMAIL}...`);
    const { data: updated, error: updateError } = await supabase.auth.admin.updateUserById(
      existingNewUser.id,
      {
        password: NEW_PASSWORD,
        email_confirm: true,
        user_metadata: { role: "admin", full_name: "LabEHE Admin Desk" },
      }
    );
    if (updateError) {
      console.error("Failed to update user:", updateError.message);
      process.exit(1);
    }
    targetUserId = existingNewUser.id;
    console.log(`Successfully updated password for ${NEW_EMAIL}.`);
  } else {
    console.log(`Creating new admin account for ${NEW_EMAIL}...`);
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email: NEW_EMAIL,
      password: NEW_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "admin", full_name: "LabEHE Admin Desk" },
    });

    if (createError) {
      console.error("Failed to create user:", createError.message);
      process.exit(1);
    }
    targetUserId = created.user.id;
    console.log(`Successfully created new admin user ${NEW_EMAIL} (ID: ${targetUserId}).`);
  }

  // 4. Ensure profile in public.profiles table
  if (targetUserId) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: targetUserId,
        email: NEW_EMAIL,
        full_name: "LabEHE Admin Desk",
        role: "admin",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    if (profileError) {
      console.warn("Notice: profiles upsert:", profileError.message);
    } else {
      console.log(`Admin profile registered in public.profiles table.`);
    }
  }

  console.log("\n------------------------------------------");
  console.log("🎉 SUCCESS! New Admin Credentials:");
  console.log(`Email:    ${NEW_EMAIL}`);
  console.log(`Password: ${NEW_PASSWORD}`);
  console.log("------------------------------------------\n");
}

manageAdmin().catch(console.error);
