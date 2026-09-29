// Content-accuracy checks. Default mode reports draft gaps as warnings.
// --strict (publish mode) turns every gap into a failure.
import { readFileSync, readdirSync } from "node:fs";

const strict = process.argv.includes("--strict");
const read = (p) => JSON.parse(readFileSync(p, "utf8"));
const site = read("src/content/site.json");
const research = read("src/content/research.json");
const experience = read("src/content/experience.json");
const supporting = read("src/content/supporting.json");
const ledger = read("src/content/ledger.json");
const projects = readdirSync("src/content/projects").map((f) => read(`src/content/projects/${f}`));

const errors = [];   // always fail
const gaps = [];     // fail only in --strict
const PUBLIC = ["implemented", "measured", "planned"];
const METRIC_FIELDS = ["dataset", "modelVersion", "hardware", "testDate", "sampleSize", "baseline", "method", "result", "limitation"];
const SECTIONS = ["problem", "users", "constraints", "architecture", "aiTechnique", "implementation", "evaluation", "humanControl", "results", "limitations", "reproduction", "evidence"];

if (projects.length !== 6) errors.push(`Expected 6 flagship projects, found ${projects.length}`);

for (const p of projects) {
  const at = `[${p.slug}]`;
  for (const s of SECTIONS) if (p[s] == null) errors.push(`${at} missing case-study section "${s}"`);

  // A metric is an achievement only if a real run produced every field.
  for (const m of p.evaluation.metrics) {
    if (m.status === "measured") {
      const missing = METRIC_FIELDS.filter((f) => !m[f]);
      if (missing.length) errors.push(`${at} metric "${m.name}" is marked measured but lacks: ${missing.join(", ")}`);
    } else if (m.result) {
      errors.push(`${at} metric "${m.name}" has a result but status "target". Record the run or remove the number.`);
    }
  }
  const measuredMetrics = p.evaluation.metrics.filter((m) => m.status === "measured").length;
  if (p.results.measured.length && !measuredMetrics) errors.push(`${at} lists measured results with no measured metric behind them`);
  if (p.status === "measured" && !measuredMetrics) errors.push(`${at} status "measured" requires at least one measured metric`);
  if (p.capabilities.some((c) => c.status === "measured") && !measuredMetrics) errors.push(`${at} has a capability marked measured but no measured metric`);

  if (!PUBLIC.includes(p.status)) gaps.push(`${at} project status is "${p.status}"`);
  const unc = p.capabilities.filter((c) => !PUBLIC.includes(c.status));
  if (unc.length) gaps.push(`${at} ${unc.length} capability statuses unconfirmed`);
  const noUrl = p.evidence.filter((e) => !e.url);
  if (noUrl.length) gaps.push(`${at} ${noUrl.length} evidence links missing (${noUrl.map((e) => e.kind).join(", ")})`);
  if (p.status === "implemented" && !p.evidence.some((e) => e.url && (e.kind === "source" || e.kind === "package")))
    gaps.push(`${at} marked implemented without a linked source or package`);
  if (!p.reproduction.verified) gaps.push(`${at} reproduction commands not verified against the package`);
  if (p.slug === "uav-cyber-copilot" && !/not a flight-safety-certified/i.test(p.notice ?? ""))
    errors.push(`${at} must state it is a research and simulation environment, not flight-safety-certified`);
}

for (const s of supporting) if (!PUBLIC.includes(s.status)) gaps.push(`[supporting/${s.slug}] status "${s.status}"`);
for (const [k, v] of Object.entries(site.links)) if (!v) gaps.push(`[site] ${k} link missing`);
if (!site.location) gaps.push("[site] location missing");
if (!site.workPreference) gaps.push("[site] work preference missing");
if (!research.status) gaps.push("[research] dissertation/publication status not stated");
if (research.draftWording) gaps.push("[research] research question is draft wording");
if (research.publications.some((p) => !p.venue || !p.year)) errors.push("[research] every publication needs a venue and year; unpublished work must not be listed");
if (!experience.roles.length) gaps.push("[experience] no roles added");
const slugs = new Set([...projects.map((p) => p.slug), ...supporting.map((s) => s.slug)]);
for (const l of ledger) if (l.project && !slugs.has(l.project)) errors.push(`[ledger/${l.id}] unknown project ${l.project}`);
if (strict && site.draft) errors.push("[site] draft is true; set it to false for a publish build");

for (const e of errors) console.log(`✗ ${e}`);
for (const g of gaps) console.log(`${strict ? "✗" : "•"} ${g}`);
const fail = errors.length + (strict ? gaps.length : 0);
console.log(`\n${errors.length} error(s), ${gaps.length} draft gap(s)${strict ? " (strict: gaps fail)" : " (warnings; run validate:publish before release)"}`);
process.exit(fail ? 1 : 0);
