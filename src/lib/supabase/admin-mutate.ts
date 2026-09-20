import { createClient } from "@/lib/supabase/client";

export async function adminMutate(
  entity: string,
  action: string,
  data?: any,
  id?: string
): Promise<any> {
  if (typeof window !== "undefined") {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      try {
        const supabase = createClient();
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.access_token) {
          headers["Authorization"] = `Bearer ${sessionData.session.access_token}`;
        }
      } catch (authErr) {
        // Non-fatal if session token cannot be retrieved
      }

      const res = await fetch("/api/admin/mutate", {
        method: "POST",
        headers,
        body: JSON.stringify({ entity, action, data, id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        console.warn(`Admin mutate API warning (${entity}.${action}):`, json.error);
        return { success: false, error: json.error };
      }
      return { success: true, data: json.data };
    } catch (err: any) {
      console.warn(`Admin mutate network error (${entity}.${action}):`, err);
      return { success: false, error: err.message };
    }
  }

  return { success: false, error: "adminMutate called outside browser context" };
}

