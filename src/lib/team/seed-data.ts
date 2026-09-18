import { TeamCategoryMeta, TeamMember } from "./types";

export const TEAM_CATEGORIES_META: Record<string, TeamCategoryMeta> = {
  pi: {
    id: "pi",
    label: "Principal Investigator",
    shortLabel: "Principal Investigator",
    description: "Lab directorship, scientific oversight, and strategic research vision.",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
  phd: {
    id: "phd",
    label: "Postdoc & PhD Researchers",
    shortLabel: "Postdoc & PhD",
    description: "Doctoral candidates and postdoctoral scientists conducting hypothesis-driven research.",
    badgeColor: "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30",
  },
  graduate: {
    id: "graduate",
    label: "Graduate Researchers",
    shortLabel: "Graduate Researchers",
    description: "Master of Science students conducting analytical and computational thesis research.",
    badgeColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30",
  },
  undergraduate: {
    id: "undergraduate",
    label: "Undergraduate Researchers",
    shortLabel: "Undergraduate Researchers",
    description: "Undergraduate researchers gaining training in ecotoxicology and sampling.",
    badgeColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30",
  },
  alumni: {
    id: "alumni",
    label: "Lab Alumni",
    shortLabel: "Lab Alumni",
    description: "Former researchers and alumni advancing science in academia and industry.",
    badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
  },
};

export const INITIAL_TEAM_MEMBERS: TeamMember[] = [];
