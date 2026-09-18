import { NewsArticle } from "./types";

export const SEED_NEWS_ARTICLES: NewsArticle[] = [];

export const NEWS_CATEGORIES_META: Record<
  string,
  { label: string; color: string; bgLight: string; bgDark: string; borderLight: string; borderDark: string }
> = {
  breakthrough: {
    label: "Research Breakthrough",
    color: "text-emerald-800 dark:text-[#34D399]",
    bgLight: "bg-emerald-100",
    bgDark: "dark:bg-emerald-950/80",
    borderLight: "border-emerald-300",
    borderDark: "dark:border-emerald-800",
  },
  opportunity: {
    label: "Opportunities & Openings",
    color: "text-amber-800 dark:text-amber-300",
    bgLight: "bg-amber-100",
    bgDark: "dark:bg-amber-950/80",
    borderLight: "border-amber-300",
    borderDark: "dark:border-amber-800/80",
  },
  expedition: {
    label: "Field Expedition",
    color: "text-blue-800 dark:text-blue-400",
    bgLight: "bg-blue-100",
    bgDark: "dark:bg-blue-950/80",
    borderLight: "border-blue-300",
    borderDark: "dark:border-blue-800",
  },
  grant_award: {
    label: "Grant Award",
    color: "text-amber-800 dark:text-amber-400",
    bgLight: "bg-amber-100",
    bgDark: "dark:bg-amber-950/80",
    borderLight: "border-amber-300",
    borderDark: "dark:border-amber-800",
  },
  symposium: {
    label: "Symposium & Talks",
    color: "text-purple-800 dark:text-purple-400",
    bgLight: "bg-purple-100",
    bgDark: "dark:bg-purple-950/80",
    borderLight: "border-purple-300",
    borderDark: "dark:border-purple-800",
  },
  lab_update: {
    label: "Facility & Lab Update",
    color: "text-teal-800 dark:text-teal-400",
    bgLight: "bg-teal-100",
    bgDark: "dark:bg-teal-950/80",
    borderLight: "border-teal-300",
    borderDark: "dark:border-teal-800",
  },
  press: {
    label: "Press & Media",
    color: "text-rose-800 dark:text-rose-400",
    bgLight: "bg-rose-100",
    bgDark: "dark:bg-rose-950/80",
    borderLight: "border-rose-300",
    borderDark: "dark:border-rose-800",
  },
};
