export async function adminMutate(
  entity: string,
  action: string,
  data?: any,
  id?: string
): Promise<any> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/admin/mutate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
