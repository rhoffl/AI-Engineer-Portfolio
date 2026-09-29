import type { PortfolioProject } from "../types";
import { catChip, coverageBar, esc, link, list, metricCard, statusChip, todo } from "../ui";
import { renderDiagram } from "../diagram";
import { projects, site } from "../content";

export const SECTIONS = [
  ["problem", "Problem"],
  ["users", "Users and constraints"],
  ["architecture", "Architecture"],
  ["technique", "AI technique"],
  ["implementation", "Engineering implementation"],
  ["evaluation", "Evaluation"],
  ["control", "Human control"],
  ["results", "Results"],
  ["limits", "Tradeoffs and limitations"],
  ["repro", "Reproduction"],
  ["evidence", "Evidence links"],
] as const;

export function caseView(p: PortfolioProject, tab: "exec" | "tech"): string {
  const idx = projects.indexOf(p);
  const prev = projects[idx - 1];
  const next = projects[idx + 1];
  return `
  <header class="page-head case-head">
    <p class="eyebrow"><a href="#projects">Projects</a> / Flagship 0${p.order}</p>
    <h1>${esc(p.title)}</h1>
    <p class="case-msg">${esc(p.primaryMessage)}</p>
    <div class="case-meta">${statusChip(p.status)} ${list(p.categories, catChip)}</div>
    ${p.notice ? `<p class="notice" role="note"><strong>Scope:</strong> ${esc(p.notice)}</p>` : ""}
  </header>

  <div class="tabs" role="tablist" aria-label="Case study view">
    <a role="tab" id="tab-exec" href="#case-${p.slug}" aria-selected="${tab === "exec"}" class="tab">Executive summary</a>
    <a role="tab" id="tab-tech" href="#case-${p.slug}--tech" aria-selected="${tab === "tech"}" class="tab">Technical deep dive</a>
  </div>

  <div role="tabpanel" aria-labelledby="tab-${tab}">
    ${tab === "exec" ? execPanel(p) : techPanel(p)}
  </div>

  <nav class="case-nav" aria-label="Other case studies">
    ${prev ? `<a href="#case-${prev.slug}${tab === "tech" ? "--tech" : ""}">← ${esc(prev.shortTitle)}</a>` : "<span></span>"}
    ${next ? `<a href="#case-${next.slug}${tab === "tech" ? "--tech" : ""}">${esc(next.shortTitle)} →</a>` : "<span></span>"}
  </nav>`;
}

function execPanel(p: PortfolioProject): string {
  return `
  <div class="exec">
    <dl class="exec__grid">
      <div><dt>Problem</dt><dd>${esc(p.executive.problem)}</dd></div>
      <div><dt>Approach</dt><dd>${esc(p.executive.approach)}</dd></div>
      <div><dt>Impact</dt><dd>${esc(p.executive.impact)}</dd></div>
      <div><dt>Why it matters</dt><dd>${esc(p.executive.whyItMatters)}</dd></div>
    </dl>
    <div class="exec__side">
      <h2 class="h-sm">What this project demonstrates</h2>
      <ul class="caps">${list(p.capabilities, (c) => `<li><span>${esc(c.name)}</span>${statusChip(c.status)}</li>`)}</ul>
      <h2 class="h-sm">Lifecycle coverage</h2>
      ${coverageBar(p)}
      <h2 class="h-sm">Results</h2>
      ${resultsBlock(p)}
      <h2 class="h-sm">What it does not prove</h2>
      <ul class="plain">${list(p.limitations.slice(0, 3), (l) => `<li>${esc(l)}</li>`)}</ul>
      <p><a class="btn" href="#case-${p.slug}--tech">Open the technical deep dive</a></p>
    </div>
  </div>`;
}

function resultsBlock(p: PortfolioProject): string {
  return `<div class="results">
    <div><h3 class="results__h">Measured outcomes</h3>
      ${p.results.measured.length ? `<ul class="plain">${list(p.results.measured, (r) => `<li>${esc(r)}</li>`)}</ul>` : `<p class="muted">None yet. No benchmark run has been recorded for this project.</p>`}</div>
    <div><h3 class="results__h">Expected or target outcomes</h3>
      <ul class="plain">${list(p.results.expected, (r) => `<li>${esc(r)}</li>`)}</ul></div>
  </div>`;
}

function techPanel(p: PortfolioProject): string {
  const sec = (id: string, n: number, title: string, body: string) =>
    `<section class="cs" id="s-${id}" aria-labelledby="h-${id}"><h2 id="h-${id}"><span class="cs__n">${n}</span>${title}</h2>${body}</section>`;

  return `
  <div class="tech">
    <nav class="toc" aria-label="Case study sections">
      <p class="toc__h">Sections</p>
      <ol>${list([...SECTIONS], ([id, t]) => `<li><button type="button" data-jump="s-${id}">${t}</button></li>`)}</ol>
    </nav>
    <div class="tech__body">
      ${sec("problem", 1, "Problem", `<p class="lede">${esc(p.problem)}</p>`)}
      ${sec("users", 2, "Users and constraints", `
        <div class="two">
          <div><h3 class="h-xs">Users</h3><ul class="plain">${list(p.users, (u) => `<li>${esc(u)}</li>`)}</ul></div>
          <div><h3 class="h-xs">Constraints</h3><dl class="kv">${list(p.constraints, (c) => `<div><dt>${esc(c.kind)}</dt><dd>${esc(c.detail)}</dd></div>`)}</dl></div>
        </div>`)}
      ${sec("architecture", 3, "Architecture", `
        ${renderDiagram(p.architecture, p.title)}
        <ul class="plain notes">${list(p.architectureNotes, (n) => `<li>${esc(n)}</li>`)}</ul>`)}
      ${sec("technique", 4, "AI technique", `
        <p><strong>${esc(p.aiTechnique.choice)}</strong></p>
        <p>${esc(p.aiTechnique.rationale)}</p>
        <h3 class="h-xs">Alternatives considered</h3>
        <dl class="kv">${list(p.aiTechnique.rejected, (r) => `<div><dt>${esc(r.option)}</dt><dd>${esc(r.reason)}</dd></div>`)}</dl>`)}
      ${sec("implementation", 5, "Engineering implementation", `
        <dl class="kv">${list(p.implementation, (i) => `<div><dt>${esc(i.area)}</dt><dd>${esc(i.detail)}</dd></div>`)}</dl>
        <p class="muted">Stack: ${esc(p.technologies.join(" · "))}</p>`)}
      ${sec("evaluation", 6, "Evaluation", `
        <div class="two">
          <div><h3 class="h-xs">Datasets</h3><ul class="plain">${list(p.evaluation.datasets, (d) => `<li>${esc(d)}</li>`)}</ul></div>
          <div><h3 class="h-xs">Baselines</h3><ul class="plain">${list(p.evaluation.baselines, (d) => `<li>${esc(d)}</li>`)}</ul></div>
        </div>
        <h3 class="h-xs">Metrics</h3>
        <div class="metrics">${list(p.evaluation.metrics, metricCard)}</div>
        <div class="two">
          <div><h3 class="h-xs">Regression tests</h3><ul class="plain">${list(p.evaluation.regression, (d) => `<li>${esc(d)}</li>`)}</ul></div>
          <div><h3 class="h-xs">Failure analysis</h3><ul class="plain">${list(p.evaluation.failureAnalysis, (d) => `<li>${esc(d)}</li>`)}</ul></div>
        </div>`)}
      ${sec("control", 7, "Human control", `<dl class="kv">${list(p.humanControl, (h) => `<div><dt>${esc(h.control)}</dt><dd>${esc(h.detail)}</dd></div>`)}</dl>`)}
      ${sec("results", 8, "Results", resultsBlock(p))}
      ${sec("limits", 9, "Tradeoffs and limitations", `<ul class="plain">${list(p.limitations, (l) => `<li>${esc(l)}</li>`)}</ul>`)}
      ${sec("repro", 10, "Reproduction", `
        ${!p.reproduction.verified && site.draft ? `<p class="todo-block">Commands follow the standard package layout. Run them against ${esc(p.sourceArchive ?? "the source package")} and correct them before publishing.</p>` : ""}
        <h3 class="h-xs">Setup and run</h3>
        <div class="code-wrap"><pre class="code" tabindex="0"><code>${esc(p.reproduction.setup.join("\n"))}</code></pre></div>
        <dl class="kv">
          <div><dt>Test data</dt><dd>${esc(p.reproduction.testData)}</dd></div>
          <div><dt>Demo credentials</dt><dd>${esc(p.reproduction.credentials)}</dd></div>
          <div><dt>Expected output</dt><dd>${esc(p.reproduction.expectedOutput)}</dd></div>
        </dl>
        <h3 class="h-xs">Teardown</h3>
        <div class="code-wrap"><pre class="code" tabindex="0"><code>${esc(p.reproduction.teardown.join("\n"))}</code></pre></div>`)}
      ${sec("evidence", 11, "Evidence links", `
        <ul class="evidence">${list(p.evidence, (e) => `<li><span class="evidence__k">${esc(e.kind)}</span>${link(e.url, e.label)}</li>`)}</ul>
        ${p.sourceArchive ? `<p class="muted">Source archive: <code>${esc(p.sourceArchive)}</code>${p.diagramFile ? ` · Diagram: <code>${esc(p.diagramFile)}</code>` : ""}</p>` : site.draft ? `<p>${todo("source archive name and diagram file")}</p>` : ""}`)}
    </div>
  </div>`;
}
