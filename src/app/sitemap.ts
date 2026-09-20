import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://labehe.org";
  const now = new Date();

  // Core Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/team`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/people`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/publications`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/news`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.75,
    },
  ];

  // Dynamic Content Routes from Supabase
  const dynamicRoutes: MetadataRoute.Sitemap = [];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && anonKey) {
    try {
      const client = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      // 1. Team & Researchers (e.g. Dr. Mostafizur Rahman, Shahed Anan Sajeeb)
      const { data: people } = await client
        .from("people")
        .select("slug, updated_at")
        .eq("is_active", true);

      if (people && Array.isArray(people)) {
        people.forEach((p) => {
          if (p.slug) {
            dynamicRoutes.push({
              url: `${baseUrl}/team/${p.slug}`,
              lastModified: p.updated_at ? new Date(p.updated_at) : now,
              changeFrequency: "monthly",
              priority: 0.85,
            });
          }
        });
      }

      // 2. Research Projects
      const { data: projects } = await client
        .from("projects")
        .select("slug, updated_at")
        .eq("is_published", true);

      if (projects && Array.isArray(projects)) {
        projects.forEach((proj) => {
          if (proj.slug) {
            dynamicRoutes.push({
              url: `${baseUrl}/projects/${proj.slug}`,
              lastModified: proj.updated_at ? new Date(proj.updated_at) : now,
              changeFrequency: "monthly",
              priority: 0.8,
            });
          }
        });
      }

      // 3. Publications
      const { data: publications } = await client
        .from("publications")
        .select("slug, updated_at")
        .eq("is_published", true);

      if (publications && Array.isArray(publications)) {
        publications.forEach((pub) => {
          if (pub.slug) {
            dynamicRoutes.push({
              url: `${baseUrl}/publications/${pub.slug}`,
              lastModified: pub.updated_at ? new Date(pub.updated_at) : now,
              changeFrequency: "monthly",
              priority: 0.8,
            });
          }
        });
      }

      // 4. News & Dispatches
      const { data: news } = await client
        .from("news")
        .select("slug, published_at, updated_at")
        .eq("is_published", true);

      if (news && Array.isArray(news)) {
        news.forEach((item) => {
          if (item.slug) {
            dynamicRoutes.push({
              url: `${baseUrl}/news/${item.slug}`,
              lastModified: item.updated_at
                ? new Date(item.updated_at)
                : item.published_at
                ? new Date(item.published_at)
                : now,
              changeFrequency: "monthly",
              priority: 0.75,
            });
          }
        });
      }
    } catch {
      // Safe fallback if Supabase is offline during build
    }
  }

  return [...staticRoutes, ...dynamicRoutes];
}
