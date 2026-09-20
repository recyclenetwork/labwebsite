"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Share2,
  Check,
  Sparkles,
  BookOpen,
  FlaskConical,
  Layers,
  ExternalLink,
  Quote,
  Newspaper,
  ChevronRight,
  ChevronLeft,
  Bookmark,
  Building2,
  Users
} from "lucide-react";
import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { NewsArticle } from "@/lib/news/types";
import { getNewsBySlug, getPublishedNews } from "@/lib/news/queries";
import { sanitizeHtml } from "@/lib/sanitize";
import { NEWS_CATEGORIES_META } from "@/lib/news/seed-data";

export default function NewsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const [item, all] = await Promise.all([
          getNewsBySlug(slug),
          getPublishedNews({}, false),
        ]);
        setArticle(item);
        setAllArticles(all);
      } catch (err) {
        console.error("Error loading news detail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadArticle();
  }, [slug]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Find next and previous articles
  const currentIndex = allArticles.findIndex((a) => a.slug === slug || a.id === slug);
  const prevArticle = currentIndex > 0 ? allArticles[currentIndex - 1] : null;
  const nextArticle = currentIndex >= 0 && currentIndex < allArticles.length - 1 ? allArticles[currentIndex + 1] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#040810] text-slate-900 dark:text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-40 text-center space-y-4">
          <div className="w-10 h-10 rounded-full border-3 border-emerald-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">Loading scientific dispatch...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#040810] text-slate-900 dark:text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-40 text-center space-y-4 max-w-md mx-auto px-4">
          <Newspaper className="w-12 h-12 text-slate-400 mx-auto" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Article Not Found</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            The scientific article you requested may have been relocated or unpublished.
          </p>
          <Link
            href="/news"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-800 dark:bg-[#34D399] text-white dark:text-slate-950 font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to News Archive</span>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const categoryMeta = NEWS_CATEGORIES_META[article.category] || NEWS_CATEGORIES_META.lab_update;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#040810] text-slate-900 dark:text-slate-100 font-[family-name:var(--font-inter)] selection:bg-emerald-500 selection:text-white">
      <Navbar />

      {/* Main Article Container */}
      <main className="pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Top Breadcrumb & Return Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <Link
              href="/news"
              className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-[#34D399] hover:underline font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to All Dispatches</span>
            </Link>

            <div className="flex items-center gap-1.5 text-slate-500">
              <Link href="/" className="hover:text-slate-800 dark:hover:text-slate-200">Home</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <Link href="/news" className="hover:text-slate-800 dark:hover:text-slate-200">News</Link>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-slate-800 dark:text-slate-200 truncate max-w-[150px] sm:max-w-xs">{categoryMeta.label}</span>
            </div>
          </div>

          {/* Article Header Header */}
          <header className="space-y-6 text-left">
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border shadow-xs ${categoryMeta.bgLight} ${categoryMeta.bgDark} ${categoryMeta.color} ${categoryMeta.borderLight} ${categoryMeta.borderDark}`}
              >
                {categoryMeta.label}
              </span>

              <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 font-mono">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(article.published_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{article.read_time_minutes} min read</span>
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white leading-[1.2] tracking-tight font-[family-name:var(--font-manrope)]">
              {article.title}
            </h1>

            {/* Author Meta Card & Share Action */}
            <div className="pt-4 border-t border-b border-slate-200 dark:border-slate-800/80 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {article.author_avatar ? (
                  <img
                    src={article.author_avatar}
                    alt={article.author_name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-600/30"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-[#34D399] flex items-center justify-center font-bold text-sm">
                    {article.author_name[0]}
                  </div>
                )}
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {article.author_name}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    {article.author_role || "Laboratory of Environmental Health and Ecotoxicology (LabEHE)"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer shadow-xs"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Link Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Story</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Hero Cover Image */}
          {article.cover_image_url && (
            <div className="space-y-2">
              <div className="rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
                <img
                  src={article.cover_image_url}
                  alt={article.title}
                  className="w-full max-h-[500px] object-cover"
                />
              </div>
              {(article.image_caption || article.image_credit) && (
                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-2 italic">
                  <span>{article.image_caption}</span>
                  {article.image_credit && <span>Photo Credit: {article.image_credit}</span>}
                </div>
              )}
            </div>
          )}

          {/* Executive Summary / Key Takeaways Box */}
          {article.summary && (
            <div className="p-6 rounded-3xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 space-y-2 text-left">
              <div className="flex items-center gap-2 text-xs font-extrabold text-emerald-900 dark:text-[#34D399] uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Executive Scientific Synopsis</span>
              </div>
              <p className="text-sm sm:text-base text-emerald-950 dark:text-emerald-100 font-medium leading-relaxed">
                {article.summary}
              </p>
            </div>
          )}

          {/* Main Article Body (Rendered with high-contrast scientific typography) */}
          <article className="prose dark:prose-invert max-w-none text-left space-y-6 text-slate-800 dark:text-slate-200 leading-relaxed font-[family-name:var(--font-inter)] text-sm sm:text-base">
            {article.content ? (
              <div
                className="space-y-6 [&>h3]:text-xl [&>h3]:sm:text-2xl [&>h3]:font-extrabold [&>h3]:text-slate-950 [&>h3]:dark:text-white [&>h3]:font-[family-name:var(--font-manrope)] [&>h3]:mt-8 [&>h3]:mb-3 [&>blockquote]:p-4 [&>blockquote]:border-l-4 [&>blockquote]:border-emerald-600 [&>blockquote]:bg-slate-100 [&>blockquote]:dark:bg-slate-900/60 [&>blockquote]:rounded-r-2xl [&>blockquote]:italic [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-2 [&>ol]:list-decimal [&>ol]:pl-5 [&>ol]:space-y-2 [&>pre]:p-4 [&>pre]:rounded-2xl [&>pre]:bg-slate-900 [&>pre]:text-emerald-400 [&>pre]:font-mono [&>pre]:text-xs [&>hr]:border-slate-200 [&>hr]:dark:border-slate-800"
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(
                    article.content
                      .replace(/### (.*)/g, "<h3>$1</h3>")
                      .replace(/## (.*)/g, "<h2>$1</h2>")
                      .replace(/> \*(.*)\*/g, "<blockquote><p>$1</p></blockquote>")
                      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                      .replace(/\*(.*?)\*/g, "<em>$1</em>")
                      .replace(/\n\n/g, "<br/><br/>")
                  )
                }}
              />
            ) : (
              <p>{article.summary}</p>
            )}
          </article>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 mr-2">Topic Tags:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Cross-Linked Research Areas & Ongoing Projects */}
          {(article.research_areas?.length || article.projects?.length) ? (
            <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 text-left">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 dark:text-white font-[family-name:var(--font-manrope)] flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-[#34D399]" />
                <span>Associated Scientific Research</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {article.research_areas?.map((area) => (
                  <div
                    key={area.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070C16] border border-slate-200 dark:border-slate-800/80 space-y-1"
                  >
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-[#34D399] uppercase tracking-wider">Research Discipline</span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{area.title}</h4>
                  </div>
                ))}

                {article.projects?.map((proj) => (
                  <Link
                    key={proj.id}
                    href={`/projects/${proj.slug}`}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-[#070C16] border border-slate-200 dark:border-slate-800/80 space-y-1 hover:border-emerald-600 transition group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">Linked Grant Project</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-[#34D399] transition-colors">{proj.title}</h4>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          {/* Next / Previous Story Navigation */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {prevArticle ? (
              <Link
                href={`/news/${prevArticle.slug}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 hover:border-emerald-600 transition group space-y-1 shadow-xs"
              >
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  <span>Previous Story</span>
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-[#34D399]">
                  {prevArticle.title}
                </div>
              </Link>
            ) : (
              <div />
            )}

            {nextArticle ? (
              <Link
                href={`/news/${nextArticle.slug}`}
                className="p-5 rounded-2xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 hover:border-emerald-600 transition group space-y-1 text-right shadow-xs"
              >
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
                  <span>Next Story</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-[#34D399]">
                  {nextArticle.title}
                </div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
