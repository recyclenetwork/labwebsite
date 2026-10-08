import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const FALLBACK_SUPABASE_URL = "https://ztgwpyoztzpvqnwoixuy.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY = "sb_publishable_9y2S6BL9Zlfd-qZCr4ui7Q_0h76uko4";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entity, action, data, id } = body;
    
    const supabase = createAdminClient();

    // 1. PROJECTS
    if (entity === "project") {
      if (action === "create") {
        const payload = {
          ...data.projectPayload,
          id: data.projectPayload.id || `proj-${Date.now()}`,
        };
        const { data: created, error } = await (supabase as any)
          .from("projects")
          .insert([payload])
          .select()
          .single();

        if (error) throw error;

        // Insert junctions
        if (data.research_area_ids?.length) {
          const areaRows = data.research_area_ids.map((areaId: string) => ({
            project_id: created.id,
            research_area_id: areaId,
          }));
          await (supabase as any).from("project_research_areas").insert(areaRows);
        }

        if (data.researcher_assignments?.length) {
          const researcherRows = data.researcher_assignments.map((ra: any, idx: number) => ({
            project_id: created.id,
            person_id: ra.person_id,
            role_in_project: ra.role_in_project,
            display_order: idx + 1,
          }));
          await (supabase as any).from("project_researchers").insert(researcherRows);
        }

        if (data.collaborators?.length) {
          const collabRows = data.collaborators.map((c: any, idx: number) => ({
            project_id: created.id,
            name: c.name,
            institution: c.institution,
            role: c.role || "Collaborator",
            display_order: idx + 1,
          }));
          await (supabase as any).from("project_collaborators").insert(collabRows);
        }

        return NextResponse.json({ success: true, data: created });
      }

      if (action === "update") {
        const { error } = await (supabase as any)
          .from("projects")
          .update(data.updatePayload)
          .eq("id", id);

        if (error) throw error;

        if (data.research_area_ids !== undefined) {
          await (supabase as any).from("project_research_areas").delete().eq("project_id", id);
          if (data.research_area_ids.length > 0) {
            const rows = data.research_area_ids.map((aid: string) => ({
              project_id: id,
              research_area_id: aid,
            }));
            await (supabase as any).from("project_research_areas").insert(rows);
          }
        }

        if (data.researcher_assignments !== undefined) {
          await (supabase as any).from("project_researchers").delete().eq("project_id", id);
          if (data.researcher_assignments.length > 0) {
            const rows = data.researcher_assignments.map((ra: any, idx: number) => ({
              project_id: id,
              person_id: ra.person_id,
              role_in_project: ra.role_in_project,
              display_order: idx + 1,
            }));
            await (supabase as any).from("project_researchers").insert(rows);
          }
        }

        if (data.collaborators !== undefined) {
          await (supabase as any).from("project_collaborators").delete().eq("project_id", id);
          if (data.collaborators.length > 0) {
            const rows = data.collaborators.map((c: any, idx: number) => ({
              project_id: id,
              name: c.name,
              institution: c.institution,
              role: c.role,
              display_order: idx + 1,
            }));
            await (supabase as any).from("project_collaborators").insert(rows);
          }
        }

        return NextResponse.json({ success: true });
      }

      if (action === "delete") {
        await (supabase as any).from("project_research_areas").delete().eq("project_id", id);
        await (supabase as any).from("project_researchers").delete().eq("project_id", id);
        await (supabase as any).from("project_collaborators").delete().eq("project_id", id);
        await (supabase as any).from("publication_projects").delete().eq("project_id", id);
        const { error } = await (supabase as any).from("projects").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "toggle_publish") {
        const { error } = await (supabase as any)
          .from("projects")
          .update({ is_published: data.is_published, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "toggle_featured") {
        const { error } = await (supabase as any)
          .from("projects")
          .update({ is_featured: data.is_featured, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
    }

    // 2. PUBLICATIONS
    if (entity === "publication") {
      if (action === "create") {
        const { data: created, error } = await (supabase as any)
          .from("publications")
          .insert([data.publicationPayload])
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json({ success: true, data: created });
      }

      if (action === "update") {
        const { error } = await (supabase as any)
          .from("publications")
          .update(data.publicationPayload)
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "delete") {
        await (supabase as any).from("publication_authors").delete().eq("publication_id", id);
        await (supabase as any).from("publication_research_areas").delete().eq("publication_id", id);
        await (supabase as any).from("publication_projects").delete().eq("publication_id", id);
        const { error } = await (supabase as any).from("publications").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "batch_create") {
        const { error } = await (supabase as any)
          .from("publications")
          .insert(data.payloads);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "toggle_publish") {
        const { error } = await (supabase as any)
          .from("publications")
          .update({ is_published: data.is_published, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "toggle_featured") {
        const { error } = await (supabase as any)
          .from("publications")
          .update({ is_featured: data.is_featured, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
    }

    // 3. NEWS
    if (entity === "news") {
      function mapToDbPayload(p: any) {
        return {
          id: p.id || `news-${Date.now()}`,
          title: p.title,
          slug: p.slug,
          summary: p.summary || p.excerpt || "",
          content: p.content || "",
          category: p.category || "lab_update",
          cover_image_url: p.cover_image_url || p.cover_image || p.image_url || null,
          image_caption: p.image_caption || null,
          image_credit: p.image_credit || null,
          author_name: p.author_name || p.author || "Lab Editorial Team",
          author_role: p.author_role || null,
          author_avatar: p.author_avatar || null,
          published_at: p.published_at ? (p.published_at.includes("T") ? p.published_at.split("T")[0] : p.published_at) : new Date().toISOString().split("T")[0],
          read_time_minutes: p.read_time_minutes || p.read_time || 4,
          is_featured: !!p.is_featured,
          is_published: p.is_published !== false,
          tags: Array.isArray(p.tags) ? p.tags : [],
          related_project_ids: Array.isArray(p.related_project_ids) ? p.related_project_ids : (p.projects ? p.projects.map((pr: any) => pr.id || pr) : []),
          related_publication_ids: Array.isArray(p.related_publication_ids) ? p.related_publication_ids : [],
          updated_at: new Date().toISOString(),
        };
      }

      if (action === "create") {
        const dbPayload = mapToDbPayload(data.newsPayload);
        const { data: created, error } = await (supabase as any)
          .from("news")
          .upsert([dbPayload], { onConflict: "id" })
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json({ success: true, data: created });
      }

      if (action === "update") {
        const dbPayload = mapToDbPayload(data.newsPayload);
        delete dbPayload.id; // don't update id
        const { error } = await (supabase as any)
          .from("news")
          .update(dbPayload)
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "delete") {
        const { error } = await (supabase as any).from("news").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "toggle_publish") {
        const { error } = await (supabase as any)
          .from("news")
          .update({ is_published: data.is_published, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "toggle_featured") {
        const { error } = await (supabase as any)
          .from("news")
          .update({ is_featured: data.is_featured, updated_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "batch_upsert") {
        const payloads = (data.newsPayloads || []).map(mapToDbPayload);
        if (payloads.length > 0) {
          const { error } = await (supabase as any)
            .from("news")
            .upsert(payloads, { onConflict: "id" });
          if (error) throw error;
        }
        return NextResponse.json({ success: true });
      }
    }

    // 4. PEOPLE / TEAM
    if (entity === "person") {
      if (action === "create" || action === "upsert") {
        const rawPayload = data?.personPayload || data || {};
        const personPayload = {
          ...rawPayload,
          id: rawPayload.id || id || `person-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        };

        const { data: upserted, error } = await (supabase as any)
          .from("people")
          .upsert([personPayload])
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json({ success: true, data: upserted });
      }

      if (action === "update") {
        const rawPayload = data?.personPayload || data || {};
        const { error } = await (supabase as any)
          .from("people")
          .update(rawPayload)
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "delete") {
        await (supabase as any).from("project_researchers").delete().eq("person_id", id);
        const { error } = await (supabase as any).from("people").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
    }

    // 5. RESEARCH AREAS
    if (entity === "research_area") {
      if (action === "create" || action === "upsert") {
        const { data: upserted, error } = await (supabase as any)
          .from("research_areas")
          .upsert([data.areaPayload])
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json({ success: true, data: upserted });
      }

      if (action === "delete") {
        await (supabase as any).from("project_research_areas").delete().eq("research_area_id", id);
        const { error } = await (supabase as any).from("research_areas").delete().eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
    }

    // 6. SITE SETTINGS
    if (entity === "site_setting") {
      if (action === "upsert") {
        const { error } = await (supabase as any)
          .from("site_settings")
          .upsert([
            {
              key: data.key,
              value: data.value,
              description: data.description || null,
              updated_at: new Date().toISOString(),
            },
          ], { onConflict: "key" });
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
    }

    // 7. GALLERY EVENTS / MEDIA
    if (entity === "gallery_event") {
      if (action === "create" || action === "upsert") {
        const item = data?.itemPayload || data || {};
        const galleryPayload = {
          id: item.id || id || `gal-${Date.now()}`,
          title: item.title,
          category: item.category || "Field Expedition",
          location: item.location || null,
          date_text: item.date_text || null,
          description: item.description || null,
          image_url: item.image_url,
          badge_color: item.badge_color || null,
          updated_at: new Date().toISOString(),
        };

        const { data: upserted, error } = await (supabase as any)
          .from("gallery_events")
          .upsert([galleryPayload])
          .select()
          .single();
        if (error) throw error;
        return NextResponse.json({ success: true, data: upserted });
      }

      if (action === "update") {
        const item = data?.itemPayload || data || {};
        const { error } = await (supabase as any)
          .from("gallery_events")
          .update({
            title: item.title,
            category: item.category,
            location: item.location || null,
            date_text: item.date_text || null,
            description: item.description || null,
            image_url: item.image_url,
            badge_color: item.badge_color || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id || item.id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }

      if (action === "delete") {
        const { error } = await (supabase as any)
          .from("gallery_events")
          .delete()
          .eq("id", id);
        if (error) throw error;
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ success: false, error: "Unknown entity or action" }, { status: 400 });
  } catch (err: any) {
    console.error("Admin mutation error:", err);
    return NextResponse.json({ success: false, error: err.message || "Mutation failed" }, { status: 500 });
  }
}
