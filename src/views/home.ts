import { projects, projectBySlug, site, supporting } from "../content";
import { catChip, coverageBar, esc, list, statusChip, todo } from "../ui";
import type { Status } from "../types";

export function homeView(): string {
  const strongest = site.strongestProjects.map(projectBySlug).filter(Boolean) as typeof projects;

  const counts: Record<Status, number> = { implemented: 0, measured: 0, planned: 0, unconfirmed: 0 };
  projects.forEach((p) => p.capabilities.forEach((c) => counts[c.status]++));
  const totalCaps = Object.values(counts).reduce((a, b) => a + b, 0);
  const measuredMetrics = projects.flatMap((p) => p.evaluation.metrics).filter((m) => m.status === "measured").length;
  const targetMetrics = projects.flatMap((p) => p.evaluation.metrics).length - measuredMetrics;
  const order: Status[] = site.draft ? ["measured", "implemented", "planned", "unconfirmed"] : ["measured", "implemented", "planned"];

  return `
  <section class="hero">
    <div class="hero__text">
      <p class="eyebrow">AI Engineer Portfolio</p>
      <h1 class="hero__name">${esc(site.name)}</h1>
      <p class="hero__pos">${esc(site.positioning)}</p>
      <div class="hero__vp">
        <p>${esc(site.valueProposition[0])}</p>
        <p>${esc(site.valueProposition[1])}</p>
      </div>
      <div class="hero__actions">
        <a class="btn btn--primary" href="#projects">See the six flagship systems</a>
        ${site.links.resume ? `<a class="btn" href="${esc(site.links.resume)}" target="_blank" rel="noopener">View résumé</a>` : `<a class="btn" href="#contact">Contact</a>`}
      </div>
    </div>
    <aside class="ledger-card" aria-labelledby="ev-h">
      <h2 id="ev-h" class="ledger-card__h">Evidence status</h2>
      <p class="ledger-card__sub">${totalCaps} capabilities across 6 flagship systems</p>
      <div class="stack-bar" role="img" aria-label="${order.map((s) => `${counts[s]} ${s}`).join(", ")}">
        ${list(order, (s) => (counts[s] ? `<span class="stack-bar__seg stack-bar__seg--${s}" style="flex:${counts[s]}"></span>` : ""))}
      </div>
      <ul class="ledger-card__list">
        ${list(order, (s) => `<li>${statusChip(s)}<span class="num">${counts[s]}</span></li>`)}
      </ul>
      <p class="ledger-card__note"><span class="num">${measuredMetrics}</span> measured metrics · <span class="num">${targetMetrics}</span> defined targets awaiting a benchmark run. Nothing is shown as an achievement until a run produces it.</p>
      <a class="text-link" href="#evidence">Open the evidence ledger →</a>
    </aside>
  </section>

  <section class="band" aria-labelledby="roles-h">
    <div class="split">
      <div>
        <h2 id="roles-h" class="h-sm">Target roles</h2>
        <ul class="role-list">${list(site.targetRoles, (r) => `<li>${esc(r)}</li>`)}</ul>
      </div>
      <div>
        <h2 class="h-sm">Location and work preference</h2>
        <p>${site.location ? esc(site.location) : todo("location")} ${site.workPreference ? `· ${esc(site.workPreference)}` : todo("remote / hybrid / on-site preference")}</p>
        <h2 class="h-sm">Level</h2>
        <p>Senior individual contributor and architect.</p>
      </div>
    </div>
  </section>

  <section aria-labelledby="pillars-h">
    <div class="section-head">
      <h2 id="pillars-h">Four capability pillars</h2>
      <a class="text-link" href="#capabilities">All capabilities →</a>
    </div>
    <div class="pillars">
      ${list(site.pillars, (p) => `
        <article class="pillar">
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.headline)}</p>
          <p class="pillar__ev">${esc(p.evidence.join(" · "))}</p>
        </article>`)}
    </div>
  </section>

  <section aria-labelledby="strong-h">
    <div class="section-head">
      <h2 id="strong-h">Three strongest projects</h2>
      <a class="text-link" href="#projects">All projects →</a>
    </div>
    <div class="feature-list">
      ${list(strongest, (p) => `
        <article class="feature">
          <div class="feature__meta">${statusChip(p.status)} ${list(p.categories.slice(0, 2), catChip)}</div>
          <h3><a href="#case-${p.slug}">${esc(p.title)}</a></h3>
          <p class="feature__msg">${esc(p.primaryMessage)}</p>
          <p>${esc(p.executive.impact)}</p>
          ${coverageBar(p)}
        </article>`)}
    </div>
  </section>

  <section class="band" aria-labelledby="summary-h">
    <div class="split split--wide">
      <div>
        <h2 id="summary-h">Professional summary</h2>
        <p class="lede">${esc(site.summary)}</p>
      </div>
      <div class="paths">
        <a class="path" href="#recruiter">
          <span class="path__k">For recruiters</span>
          <span class="path__t">The two-minute read</span>
          <span class="path__d">Level, specialization, strongest work, impact, roles, contact.</span>
        </a>
        <a class="path" href="#case-enterprise-rag--tech">
          <span class="path__k">For technical reviewers</span>
          <span class="path__t">Start with a technical deep dive</span>
          <span class="path__d">Architecture, design decisions, tests, evaluation, failure modes, reproduction.</span>
        </a>
      </div>
    </div>
  </section>

  <section aria-labelledby="also-h">
    <div class="section-head"><h2 id="also-h" class="h-sm">Also in the portfolio</h2></div>
    <p class="muted">${supporting.length} supporting projects in <a href="#projects">Selected Engineering Work</a>, doctoral <a href="#research">UAV cybersecurity research</a>, and the <a href="#flow">engineering flow</a> that ties the projects together.</p>
  </section>`;
}

export function recruiterView(): string {
  const strongest = site.strongestProjects.map(projectBySlug).filter(Boolean) as typeof projects;
  return `
  <header class="page-head">
    <p class="eyebrow">Recruiter path</p>
    <h1>${esc(site.name)} in two minutes</h1>
  </header>
  <dl class="brief">
    <div><dt>Professional level</dt><dd>Senior AI Engineer and Enterprise Architect</dd></div>
    <div><dt>AI specialization</dt><dd>Production RAG, reliable agentic systems, AI evaluation, secure cloud deployment, applied UAV cybersecurity research</dd></div>
    <div><dt>Target roles</dt><dd>${esc(site.targetRoles.join(", "))}</dd></div>
    <div><dt>Location / work preference</dt><dd>${site.location ? esc(site.location) : todo("location")} ${site.workPreference ? esc(site.workPreference) : todo("work preference")}</dd></div>
    <div><dt>Contact</dt><dd><a href="#contact">Contact options</a></dd></div>
  </dl>
  <h2 class="h-sm">Strongest projects and their business impact</h2>
  <ol class="brief-projects">
    ${list(strongest, (p) => `<li><a href="#case-${p.slug}"><strong>${esc(p.title)}</strong></a> ${statusChip(p.status)}<br>${esc(p.executive.impact)}</li>`)}
  </ol>
  <h2 class="h-sm">How to read the status labels</h2>
  <p><strong>Implemented</strong> means a working capability exists. <strong>Measured</strong> means repeatable test results exist. <strong>Planned</strong> means design or roadmap. No number on this site is presented as an achievement unless a benchmark produced it.</p>`;
}
