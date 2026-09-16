import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" }).catch(() => {});
  } catch (error) {
    console.error("SignOut API Error:", error);
  }

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  
  // Clear all Supabase related cookies on the response
  for (const cookie of allCookies) {
    if (cookie.name.startsWith("sb-") || cookie.name.includes("auth-token") || cookie.name.includes("supabase")) {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
      });
      try {
        cookieStore.delete(cookie.name);
      } catch {
        // ignore in case cookieStore is immutable in this context
      }
    }
  }

  return response;
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut({ scope: "global" }).catch(() => {});
  } catch (error) {
    console.error("SignOut API GET Error:", error);
  }

  const { origin } = new URL(request.url);
  const response = NextResponse.redirect(`${origin}/auth/login`);

  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();

  for (const cookie of allCookies) {
    if (cookie.name.startsWith("sb-") || cookie.name.includes("auth-token") || cookie.name.includes("supabase")) {
      response.cookies.set(cookie.name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
        sameSite: "lax",
      });
      try {
        cookieStore.delete(cookie.name);
      } catch {
        // ignore
      }
    }
  }

  return response;
}
