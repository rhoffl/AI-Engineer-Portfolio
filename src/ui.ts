import type { Metric, PortfolioProject, Status, Strength } from "./types";
import { site, CATEGORY_LABELS, LIFECYCLE_COLUMNS } from "./content";

export const esc = (s: unknown): string =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const list = <T>(items: T[], fn: (t: T, i: number) => string) => items.map(fn).join("");

/** Draft placeholder. Invisible when site.draft is false. */
export const todo = (label: string) => (site.draft ? `<span class="todo">To add: ${esc(label)}</span>` : "");

const STATUS_LABEL: Record<Status, string> = {
  implemented: "Implemented",
  measured: "Measured",
  planned: "Planned",
  unconfirmed: "Confirm status",
};

export const statusChip = (s: Status) =>
  `<span class="chip chip--${s}" title="${esc(STATUS_HELP[s])}">${STATUS_LABEL[s]}</span>`;

export const STATUS_HELP: Record<Status, string> = {
  implemented: "A working capability exists.",
  measured: "Repeatable test results exist.",
  planned: "Design or roadmap item.",
  unconfirmed: "Draft only: verify against the source package, then set implemented, measured, or planned.",
};

export const catChip = (c: string) => `<span class="tag">${esc(CATEGORY_LABELS[c] ?? c)}</span>`;

export const link = (href: string | null, label: string, cls = "") =>
  href
    ? `<a class="${cls}" href="${esc(href)}" target="_blank" rel="noopener">${esc(label)}</a>`
    : `<span class="${cls} is-pending">${esc(label)}${site.draft ? " <em>(link pending)</em>" : ""}</span>`;

export const strongestResult = (p: PortfolioProject): string => {
  const m = p.evaluation.metrics.find((x) => x.status === "measured" && x.result);
  if (m) return `<strong>${esc(m.name)}: ${esc(m.result)}</strong> <span class="muted">on ${esc(m.dataset)}</span>`;
  return `<span class="muted">No measured result yet. Targets defined for ${esc(
    p.evaluation.metrics.slice(0, 2).map((x) => x.name).join(" and ")
  )}.</span>`;
};

const STRENGTH_LABEL: Record<Strength, string> = { strong: "Strong", medium: "Medium", light: "Light" };

export const coverageBar = (p: PortfolioProject) =>
  `<div class="cover" role="img" aria-label="Lifecycle coverage: ${LIFECYCLE_COLUMNS.map(
    (c) => `${c.label} ${STRENGTH_LABEL[p.lifecycle[c.key]]}`
  ).join(", ")}">${list(
    [...LIFECYCLE_COLUMNS],
    (c) => `<span class="cover__seg cover__seg--${p.lifecycle[c.key]}" title="${c.label}: ${STRENGTH_LABEL[p.lifecycle[c.key]]}"><span aria-hidden="true">${c.short}</span></span>`
  )}</div>`;

export const strengthCell = (s: Strength) => `<span class="str str--${s}">${STRENGTH_LABEL[s]}</span>`;

const METRIC_FIELDS: [keyof Metric, string][] = [
  ["dataset", "Dataset or workload"],
  ["modelVersion", "Model version"],
  ["hardware", "Hardware or provider"],
  ["testDate", "Test date"],
  ["sampleSize", "Sample size"],
  ["baseline", "Baseline"],
  ["method", "Measurement method"],
  ["result", "Result"],
  ["limitation", "Known limitation"],
];

export const metricCard = (m: Metric) => `
  <article class="metric ${m.status === "measured" ? "metric--measured" : ""}">
    <header class="metric__head">
      <h4>${esc(m.name)}</h4>
      <span class="chip ${m.status === "measured" ? "chip--measured" : "chip--target"}">${m.status === "measured" ? "Measured" : "Target, not yet run"}</span>
    </header>
    ${m.target ? `<p class="metric__target">${esc(m.target)}</p>` : ""}
    <dl class="metric__dl">
      ${list(METRIC_FIELDS, ([k, label]) => {
        const v = m[k];
        return `<div><dt>${label}</dt><dd class="${v ? "" : "is-empty"}">${v ? esc(v) : k === "result" ? "Not measured" : "Recorded at run time"}</dd></div>`;
      })}
    </dl>
  </article>`;

export const copyButton = (value: string, id: string) =>
  `<button type="button" class="btn btn--small" id="${esc(id)}" data-copy="${esc(value)}">Copy</button>`;
