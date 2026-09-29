import { CATEGORY_LABELS, projects, site, supporting } from "../content";
import { catChip, coverageBar, esc, link, list, statusChip, strongestResult } from "../ui";

export const filterState = { cat: "all", q: "" };

export function projectsView(): string {
  return `
  <header class="page-head">
    <p class="eyebrow">Projects</p>
    <h1>Six flagship systems, one engineering standard</h1>
    <p class="lede">Each flagship follows the same eleven-part case study so you can compare them directly. Supporting work below adds breadth.</p>
  </header>
  <div class="filters" role="toolbar" aria-label="Filter projects">
    <div class="filters__chips">
      ${list([["all", "All"], ...Object.entries(CATEGORY_LABELS)], ([k, v]) =>
        `<button type="button" class="fchip" data-cat="${k}" aria-pressed="${filterState.cat === k}">${esc(v)}</button>`)}
    </div>
    <label class="search"><span class="sr-only">Search projects</span>
      <input id="project-search" type="search" placeholder="Search by technology or keyword" value="${esc(filterState.q)}">
    </label>
  </div>
  <div id="project-results">${projectResults()}</div>`;
}

const matches = (cats: string[], text: string) =>
  (filterState.cat === "all" || cats.includes(filterState.cat)) &&
  (!filterState.q || text.toLowerCase().includes(filterState.q.toLowerCase()));

export function projectResults(): string {
  const flag = projects.filter((p) => matches(p.categories, [p.title, p.summary, p.problem, ...p.technologies].join(" ")));
  const supp = supporting.filter((s) => matches(s.categories, [s.title, s.problem, ...s.technologies].join(" ")));
  return `
  <section aria-labelledby="flag-h">
    <h2 id="flag-h" class="h-sm">Flagship projects <span class="count">${flag.length} of ${projects.length}</span></h2>
    ${flag.length ? `<div class="cards">${list(flag, (p) => {
      const pkg = p.evidence.find((e) => e.kind === "package" || e.kind === "source");
      return `
      <article class="card">
        <div class="card__top">${statusChip(p.status)}<span class="card__n">0${p.order}</span></div>
        <h3 class="card__title"><a href="#case-${p.slug}">${esc(p.title)}</a></h3>
        <p class="card__problem"><span class="label">Business problem</span>${esc(p.executive.problem)}</p>
        <div class="card__tech"><span class="label">Core technologies</span><p>${esc(p.technologies.slice(0, 6).join(" · "))}</p></div>
        <div class="card__result"><span class="label">Strongest verified result</span><p>${strongestResult(p)}</p></div>
        ${coverageBar(p)}
        <div class="card__links">
          <a href="#case-${p.slug}">Case study</a>
          <a href="#case-${p.slug}--tech" data-section="architecture">Architecture</a>
          ${link(pkg?.url ?? null, "Code / download")}
        </div>
      </article>`;
    })}</div>` : `<p class="empty">No flagship project matches this filter.</p>`}
  </section>
  <section aria-labelledby="supp-h">
    <h2 id="supp-h" class="h-sm">Selected Engineering Work <span class="count">${supp.length} of ${supporting.length}</span></h2>
    <p class="muted">Supporting evidence of breadth. The flagship projects carry the main narrative.</p>
    ${supp.length ? `<ul class="supp">${list(supp, (s) => `
      <li class="supp__item">
        <div class="supp__head"><h3>${esc(s.title)}</h3>${site.draft || s.status !== "unconfirmed" ? statusChip(s.status) : ""}</div>
        <p>${esc(s.problem)}</p>
        <p class="supp__rel">${esc(s.relevance)}</p>
        <p class="supp__tech">${list(s.categories, catChip)} <span class="muted">${esc(s.technologies.join(" · "))}</span></p>
      </li>`)}</ul>` : `<p class="empty">No supporting project matches this filter.</p>`}
  </section>`;
}
