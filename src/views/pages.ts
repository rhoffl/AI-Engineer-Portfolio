import { experience, ledger, LIFECYCLE, LIFECYCLE_COLUMNS, projectBySlug, projects, research, site, supporting } from "../content";
import { copyButton, esc, list, metricCard, statusChip, strengthCell, todo } from "../ui";
import type { Metric } from "../types";

const projLink = (slug: string) => {
  const p = projectBySlug(slug);
  if (p) return `<a href="#case-${p.slug}">${esc(p.shortTitle)}</a>`;
  const s = supporting.find((x) => x.slug === slug);
  return s ? `<span>${esc(s.title)}</span>` : "";
};

export function capabilitiesView(): string {
  return `
  <header class="page-head">
    <p class="eyebrow">Capabilities</p>
    <h1>Four pillars, each backed by a project</h1>
    <p class="lede">Every capability below points to the case study where it is built and evaluated.</p>
  </header>
  <div class="pillar-table-wrap">
    <table class="table">
      <caption class="sr-only">Capability pillars and supporting evidence</caption>
      <thead><tr><th scope="col">Pillar</th><th scope="col">Evidence</th><th scope="col">Where to see it</th></tr></thead>
      <tbody>
      ${list(site.pillars, (p) => `<tr>
        <th scope="row"><span class="pillar-name">${esc(p.name)}</span><span class="muted small">${esc(p.headline)}</span></th>
        <td>${esc(p.evidence.join(", "))}</td>
        <td>${list(p.projects, (s) => `<div>${projLink(s)}</div>`)}</td>
      </tr>`)}
      </tbody>
    </table>
  </div>
  <section aria-labelledby="stack-h">
    <h2 id="stack-h">Supporting capabilities</h2>
    <ul class="stack">${list(site.supportingSkills, (s) => `<li>${esc(s)}</li>`)}</ul>
  </section>
  <section aria-labelledby="demo-h">
    <h2 id="demo-h">Capability by project</h2>
    <div class="cap-grid">
      ${list(projects, (p) => `<article class="cap-col">
        <h3><a href="#case-${p.slug}">${esc(p.shortTitle)}</a></h3>
        <ul class="caps">${list(p.capabilities, (c) => `<li><span>${esc(c.name)}</span>${statusChip(c.status)}</li>`)}</ul>
      </article>`)}
    </div>
  </section>`;
}

export function flowView(): string {
  return `
  <header class="page-head">
    <p class="eyebrow">Engineering flow</p>
    <h1>How the projects relate</h1>
    <p class="lede">All six systems follow one lifecycle. Each project proves some stages more strongly than others, and the matrix shows where to look for each kind of evidence.</p>
  </header>
  <ol class="flow">
    ${list([...LIFECYCLE], (s, i) => `<li class="flow__step ${s.key ? "is-scored" : ""}"><span class="flow__n">${i + 1}</span><span>${s.step}</span></li>`)}
  </ol>
  <p class="muted small">Stages 2, 3, 5, 6, and 7 are scored below. Every project defines its problem (stage 1) and implements a system (stage 4) in its case study.</p>
  <div class="table-wrap">
    <table class="table matrix">
      <caption class="sr-only">Lifecycle coverage by project</caption>
      <thead><tr><th scope="col">Project</th>${list([...LIFECYCLE_COLUMNS], (c) => `<th scope="col">${c.label}</th>`)}</tr></thead>
      <tbody>${list(projects, (p) => `<tr><th scope="row"><a href="#case-${p.slug}">${esc(p.shortTitle)}</a></th>${list([...LIFECYCLE_COLUMNS], (c) => `<td>${strengthCell(p.lifecycle[c.key])}</td>`)}</tr>`)}</tbody>
    </table>
  </div>
  <section aria-labelledby="thread-h">
    <h2 id="thread-h">The connecting thread</h2>
    <div class="thread">
      <p><a href="#case-data-quality-lineage">Data Quality &amp; Lineage</a> establishes trustworthy inputs. <a href="#case-enterprise-rag">Enterprise RAG</a> turns documents into grounded answers. <a href="#case-operations-agent">Operations Agent</a> turns reasoning into controlled action. <a href="#case-ml-decision-service">ML Decision Service</a> shows when classical models are the right tool. <a href="#case-inference-lab">Inference Lab</a> decides how to serve models affordably. <a href="#case-uav-cyber-copilot">UAV Cyber Copilot</a> combines retrieval, agents, streaming data, and security research in one system.</p>
    </div>
  </section>`;
}

export function researchView(): string {
  const r = research;
  const block = (title: string, items: string[]) => `<section class="r-block"><h2 class="h-sm">${title}</h2><ul class="plain">${list(items, (i) => `<li>${esc(i)}</li>`)}</ul></section>`;
  return `
  <header class="page-head">
    <p class="eyebrow">Research</p>
    <h1>${esc(r.title)}</h1>
    <dl class="brief brief--inline">
      <div><dt>Status</dt><dd>${r.status ? esc(r.status) : todo("dissertation / publication status, stated precisely")}</dd></div>
      <div><dt>Institution</dt><dd>${r.institution ? esc(r.institution) : todo("institution")}</dd></div>
    </dl>
    ${site.draft ? `<p class="todo-block">${esc(r.statusNote)}</p>` : ""}
  </header>
  <section class="rq" aria-labelledby="rq-h">
    <h2 id="rq-h" class="h-sm">Research question</h2>
    <blockquote>${esc(r.question)}</blockquote>
    ${r.draftWording && site.draft ? `<p class="todo-block">Draft wording. Replace with the exact question from the dissertation proposal.</p>` : ""}
  </section>
  <div class="r-grid">
    ${block("Experimental environment", r.environment)}
    ${block("Threat-intelligence architecture", r.architecture)}
    ${block("Simulation methodology", r.methodology)}
    ${block("STIX extensions and ATT&CK mapping", r.stix)}
    ${block("Evaluation measures", r.measures)}
    ${block("Current research interests", r.interests)}
  </div>
  <section aria-labelledby="pub-h">
    <h2 id="pub-h" class="h-sm">Publications</h2>
    ${r.publications.length
      ? `<ul class="plain">${list(r.publications, (p) => `<li>${esc(p.title)}, <em>${esc(p.venue)}</em>, ${esc(p.year)}</li>`)}</ul>`
      : `<p class="muted">No publications listed. Unpublished work is not described as published.</p>`}
  </section>
  <p>Applied work from this research: <a href="#case-uav-cyber-copilot">Multimodal UAV Cybersecurity Copilot</a>.</p>`;
}

export function experienceView(): string {
  return `
  <header class="page-head">
    <p class="eyebrow">Experience and leadership</p>
    <h1>Enterprise experience, connected to the work</h1>
    <p class="lede">Each area links to the projects that show it in practice.</p>
  </header>
  <div class="table-wrap">
    <table class="table">
      <caption class="sr-only">Experience areas and supporting projects</caption>
      <thead><tr><th scope="col">Area</th><th scope="col">What it covers</th><th scope="col">Shown in</th></tr></thead>
      <tbody>${list(experience.areas, (a) => `<tr><th scope="row">${esc(a.area)}</th><td>${esc(a.detail)}</td><td>${a.projects.length ? list(a.projects, (s) => `<div>${projLink(s)}</div>`) : todo("example from résumé")}</td></tr>`)}</tbody>
    </table>
  </div>
  <section aria-labelledby="roles-h">
    <h2 id="roles-h">Roles</h2>
    ${experience.roles.length
      ? list(experience.roles, (r) => `<article class="role"><h3>${esc(r.title)}, ${esc(r.org)}</h3><p class="muted">${esc(r.dates)}</p><ul class="plain">${list(r.highlights, (h) => `<li>${esc(h)}</li>`)}</ul></article>`)
      : site.draft ? `<p class="todo-block">${esc(experience.rolesNote)}</p>` : ""}
    ${site.links.resume ? `<p><a class="btn" href="${esc(site.links.resume)}" target="_blank" rel="noopener">View full résumé</a></p>` : `<p>${todo("résumé link")}</p>`}
  </section>`;
}

const EXAMPLE: Metric = {
  name: "Recall@5",
  status: "measured",
  result: "0.86",
  dataset: "150 manually reviewed commercial-drone questions; corpus of 312 U.S. regulatory and manufacturer documents",
  modelVersion: "Retriever: BM25 + pgvector",
  hardware: "Recorded with each run",
  testDate: "2026-09-28",
  sampleSize: "150 questions",
  baseline: "Recorded with each run",
  method: "Reviewed supporting passage in the top 5 results",
  limitation: "Manufacturer coverage remains incomplete",
};

export function evidenceView(): string {
  const issues = draftIssues();
  return `
  <header class="page-head">
    <p class="eyebrow">Evidence</p>
    <h1>Evidence ledger</h1>
    <p class="lede">Every public claim on this site maps to a piece of evidence and a status. A metric appears as an achievement only after a real benchmark produces it.</p>
  </header>
  <section aria-labelledby="labels-h">
    <h2 id="labels-h" class="h-sm">Public labels</h2>
    <dl class="labels">
      <div><dt>${statusChip("implemented")}</dt><dd>A working capability exists.</dd></div>
      <div><dt>${statusChip("measured")}</dt><dd>Repeatable test results exist.</dd></div>
      <div><dt>${statusChip("planned")}</dt><dd>Design or roadmap item.</dd></div>
      ${site.draft ? `<div><dt>${statusChip("unconfirmed")}</dt><dd>Draft-only marker. Verify against the source package, then change to one of the three public labels. A publish build fails while any remain.</dd></div>` : ""}
    </dl>
  </section>
  <section aria-labelledby="ledger-h">
    <h2 id="ledger-h" class="h-sm">Claims</h2>
    <div class="table-wrap">
      <table class="table">
        <caption class="sr-only">Claims, evidence, and status</caption>
        <thead><tr><th scope="col">Claim</th><th scope="col">Evidence</th><th scope="col">Status</th></tr></thead>
        <tbody>${list(ledger, (l) => `<tr>
          <td>${esc(l.claim)}${l.project ? `<div class="small">${projLink(l.project)}</div>` : ""}</td>
          <td>${esc(l.evidence)}${l.note ? `<div class="small muted">${esc(l.note)}</div>` : ""}</td>
          <td><span class="lstat lstat--${l.status}">${l.status === "verified" ? "Verified" : l.status === "pending" ? "Pending" : "Unverified until measured"}</span></td>
        </tr>`)}</tbody>
      </table>
    </div>
  </section>
  <section aria-labelledby="std-h">
    <h2 id="std-h" class="h-sm">How metrics are reported</h2>
    <p>Every metric states its dataset or workload, model version, hardware or hosted provider, test date, sample size, baseline, measurement method, result, and known limitation. A bare figure such as "improved search by 86%" is ambiguous and does not appear here.</p>
    <p class="small muted">Format example from the portfolio standard. This illustrates the reporting format and is not a reported result.</p>
    <div class="metrics metrics--one">${metricCard(EXAMPLE).replace('class="metric', 'class="metric metric--example')}</div>
  </section>
  ${site.draft ? `<section aria-labelledby="chk-h" class="checklist">
    <h2 id="chk-h" class="h-sm">Before publishing <span class="count">${issues.length} open items</span></h2>
    <p class="small muted">Visible only while <code>draft</code> is true in site.json. <code>npm run validate:publish</code> lists the same items and fails until they are resolved.</p>
    <ul class="plain">${list(issues, (i) => `<li>${esc(i)}</li>`)}</ul>
  </section>` : ""}`;
}

export function draftIssues(): string[] {
  const out: string[] = [];
  Object.entries(site.links).forEach(([k, v]) => { if (!v) out.push(`Add ${k} link in site.json`); });
  if (!site.location) out.push("Add location in site.json");
  if (!site.workPreference) out.push("Add work preference in site.json");
  if (!research.status) out.push("State dissertation or publication status precisely in research.json");
  if (research.draftWording) out.push("Replace draft research-question wording in research.json");
  if (!experience.roles.length) out.push("Add roles from the résumé in experience.json");
  projects.forEach((p) => {
    if (p.status === "unconfirmed") out.push(`${p.shortTitle}: confirm project status`);
    const unc = p.capabilities.filter((c) => c.status === "unconfirmed").length;
    if (unc) out.push(`${p.shortTitle}: confirm ${unc} capability statuses`);
    const missing = p.evidence.filter((e) => !e.url).length;
    if (missing) out.push(`${p.shortTitle}: link ${missing} evidence items`);
    if (!p.reproduction.verified) out.push(`${p.shortTitle}: verify reproduction commands against the package`);
  });
  const sup = supporting.filter((s) => s.status === "unconfirmed").length;
  if (sup) out.push(`Selected Engineering Work: confirm ${sup} project statuses`);
  return out;
}

export function contactView(): string {
  const L = site.links;
  const action = (title: string, desc: string, href: string | null, label: string, internal = false) => `
    <article class="action">
      <h2 class="h-sm">${title}</h2>
      <p>${desc}</p>
      ${href ? `<a class="btn" href="${esc(href)}" ${internal ? "" : 'target="_blank" rel="noopener"'}>${label}</a>` : todo(label.toLowerCase())}
    </article>`;
  return `
  <header class="page-head">
    <p class="eyebrow">Contact</p>
    <h1>Talk about an AI system</h1>
    <p class="lede">Open to senior AI engineering and architecture roles and to conversations about production RAG, agents, evaluation, and UAV security.</p>
  </header>
  <div class="actions">
    ${action("View résumé", "Roles, dates, and full experience.", L.resume, "Open résumé")}
    ${action("Review architecture work", "Diagrams, trust boundaries, and design decisions for all six systems.", "#case-enterprise-rag--tech", "Start with Enterprise RAG", true)}
    ${action("Explore source code", "Repositories, tests, and downloadable packages.", L.github, "Open GitHub")}
    ${action("Connect on LinkedIn", "Professional profile and updates.", L.linkedin, "Open LinkedIn")}
    <article class="action action--wide">
      <h2 class="h-sm">Discuss an AI system or send email</h2>
      <p>Describe the problem, the data, and the constraints. A short note is enough to start.</p>
      ${L.email ? `<p class="email"><span class="email__addr">${esc(L.email)}</span> ${copyButton(L.email, "copy-email")} <a class="btn btn--small" href="mailto:${esc(L.email)}">Open mail app</a></p>` : todo("email address")}
    </article>
  </div>`;
}
