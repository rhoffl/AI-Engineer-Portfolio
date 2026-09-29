/**
 * Portfolio content model.
 *
 * Public status labels (shown to readers):
 *   implemented – a working capability exists
 *   measured    – repeatable test results exist
 *   planned     – design or roadmap item
 *
 * Internal draft label (never allowed in a publish build):
 *   unconfirmed – status not yet verified against the source package.
 *                 `npm run validate:publish` fails while any remain.
 */
export type Status = "implemented" | "measured" | "planned" | "unconfirmed";

export type Category =
  | "rag"
  | "agents"
  | "ml"
  | "data"
  | "mlops"
  | "serving"
  | "security"
  | "responsible-ai";

export type Strength = "strong" | "medium" | "light";

/** A metric is an achievement only when status === "measured" and every field is filled. */
export interface Metric {
  name: string;
  status: "measured" | "target";
  /** What "good" looks like before a run exists, e.g. "≥ 0.80". */
  target?: string;
  /** Only set by an actual benchmark run. */
  result: string | null;
  dataset: string | null;
  modelVersion: string | null;
  hardware: string | null;
  testDate: string | null;
  sampleSize: string | null;
  baseline: string | null;
  method: string;
  limitation: string | null;
}

export interface EvidenceLink {
  kind: "source" | "diagram" | "demo" | "report" | "tests" | "package";
  label: string;
  /** null = not yet linked; rendered as "pending" in draft mode. */
  url: string | null;
}

export interface DiagramNode {
  id: string;
  label: string;
  sub?: string;
}

export interface Diagram {
  columns: { title: string; nodes: DiagramNode[] }[];
  edges: [string, string][];
  /** Trust boundaries drawn as dashed frames across a column range (inclusive). */
  zones: { label: string; from: number; to: number }[];
}

export interface Capability {
  name: string;
  status: Status;
}

export interface Lifecycle {
  data: Strength;
  ai: Strength;
  evaluation: Strength;
  operations: Strength;
  governance: Strength;
}

export interface PortfolioProject {
  slug: string;
  order: number;
  title: string;
  shortTitle: string;
  summary: string;
  primaryMessage: string;
  status: Status;
  featured: boolean;
  categories: Category[];
  technologies: string[];
  sourceArchive: string | null;
  diagramFile: string | null;
  notice?: string;

  executive: {
    problem: string;
    approach: string;
    impact: string;
    whyItMatters: string;
  };

  // The eleven case-study sections, in order.
  problem: string;
  users: string[];
  constraints: { kind: string; detail: string }[];
  architecture: Diagram;
  architectureNotes: string[];
  aiTechnique: { choice: string; rationale: string; rejected: { option: string; reason: string }[] };
  implementation: { area: string; detail: string }[];
  evaluation: {
    datasets: string[];
    baselines: string[];
    metrics: Metric[];
    regression: string[];
    failureAnalysis: string[];
  };
  humanControl: { control: string; detail: string }[];
  results: { measured: string[]; expected: string[] };
  limitations: string[];
  reproduction: {
    verified: boolean;
    setup: string[];
    testData: string;
    credentials: string;
    expectedOutput: string;
    teardown: string[];
  };
  evidence: EvidenceLink[];

  capabilities: Capability[];
  lifecycle: Lifecycle;
}

export interface SupportingProject {
  slug: string;
  title: string;
  problem: string;
  status: Status;
  categories: Category[];
  technologies: string[];
  relevance: string;
  url: string | null;
}

export interface LedgerEntry {
  id: string;
  claim: string;
  project: string | null;
  evidence: string;
  status: "verified" | "pending" | "unverified";
  note?: string;
}

export interface SiteProfile {
  draft: boolean;
  name: string;
  positioning: string;
  valueProposition: [string, string];
  summary: string;
  targetRoles: string[];
  location: string | null;
  workPreference: string | null;
  links: {
    email: string | null;
    linkedin: string | null;
    github: string | null;
    resume: string | null;
  };
  strongestProjects: string[];
  pillars: {
    id: string;
    name: string;
    headline: string;
    evidence: string[];
    projects: string[];
  }[];
  supportingSkills: string[];
}
