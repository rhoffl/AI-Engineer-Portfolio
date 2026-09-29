import type { LedgerEntry, PortfolioProject, SiteProfile, SupportingProject } from "./types";
import siteJson from "./content/site.json";
import supportingJson from "./content/supporting.json";
import ledgerJson from "./content/ledger.json";
import researchJson from "./content/research.json";
import experienceJson from "./content/experience.json";

const projectModules = import.meta.glob("./content/projects/*.json", { eager: true, import: "default" });

export const site = siteJson as SiteProfile;
export const projects = (Object.values(projectModules) as PortfolioProject[]).sort((a, b) => a.order - b.order);
export const supporting = supportingJson as SupportingProject[];
export const ledger = ledgerJson as LedgerEntry[];
export const research = researchJson as typeof researchJson & { status: string | null; institution: string | null; publications: { title: string; venue: string; year: string; url: string | null }[] };
export const experience = experienceJson as typeof experienceJson & { roles: { title: string; org: string; dates: string; highlights: string[] }[] };

export const projectBySlug = (slug: string) => projects.find((p) => p.slug === slug);

export const CATEGORY_LABELS: Record<string, string> = {
  rag: "RAG and search",
  agents: "Agents",
  ml: "Machine learning",
  data: "Data engineering",
  mlops: "MLOps",
  serving: "Model serving",
  security: "Cybersecurity",
  "responsible-ai": "Responsible AI",
};

export const LIFECYCLE = [
  { step: "Define problem", key: null },
  { step: "Build data foundation", key: "data" },
  { step: "Select AI method", key: "ai" },
  { step: "Implement system", key: null },
  { step: "Evaluate behavior", key: "evaluation" },
  { step: "Deploy and monitor", key: "operations" },
  { step: "Govern and improve", key: "governance" },
] as const;

export const LIFECYCLE_COLUMNS = [
  { key: "data", label: "Data", short: "Data" },
  { key: "ai", label: "AI method", short: "AI" },
  { key: "evaluation", label: "Evaluation", short: "Eval" },
  { key: "operations", label: "Operations", short: "Ops" },
  { key: "governance", label: "Governance", short: "Gov" },
] as const;
