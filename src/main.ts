import "./styles.css";
import { projectBySlug, site } from "./content";
import { esc } from "./ui";
import { homeView, recruiterView } from "./views/home";
import { filterState, projectResults, projectsView } from "./views/projects";
import { caseView } from "./views/case";
import { capabilitiesView, contactView, evidenceView, experienceView, flowView, researchView } from "./views/pages";

const NAV: [string, string][] = [
  ["projects", "Projects"],
  ["capabilities", "Capabilities"],
  ["flow", "Engineering flow"],
  ["research", "Research"],
  ["experience", "Experience"],
  ["evidence", "Evidence"],
  ["contact", "Contact"],
];

let pendingJump: string | null = null;

function shell(): void {
  const app = document.getElementById("app")!;
  app.innerHTML = `
  <a class="skip" href="#main" data-skip>Skip to content</a>
  <header class="topbar">
    <div class="topbar__in">
      <a class="brand" href="#home"><span class="brand__mark" aria-hidden="true">RH</span><span class="brand__name">${esc(site.name)}</span></a>
      <button type="button" class="menu-btn" aria-expanded="false" aria-controls="nav">Menu</button>
      <nav id="nav" class="nav" aria-label="Primary">
        ${NAV.map(([k, v]) => `<a href="#${k}" data-nav="${k}">${v}</a>`).join("")}
      </nav>
    </div>
  </header>
  ${site.draft ? `<div class="draftbar" role="note">Draft build. Items marked “To add” and “Confirm status” are hidden or must be resolved before publishing. <a href="#evidence">See checklist</a></div>` : ""}
  <main id="main" class="main" tabindex="-1"></main>
  <footer class="footer">
    <div class="footer__in">
      <p>${esc(site.name)} · ${esc(site.positioning.split(" specializing")[0])}</p>
      <p class="muted small">Status labels: Implemented = working capability exists · Measured = repeatable results exist · Planned = roadmap. No simulated figure is presented as a production result.</p>
    </div>
  </footer>`;

  const btn = app.querySelector<HTMLButtonElement>(".menu-btn")!;
  const nav = app.querySelector<HTMLElement>("#nav")!;
  btn.addEventListener("click", () => {
    const open = btn.getAttribute("aria-expanded") === "true";
    btn.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("is-open", !open);
  });

  app.addEventListener("click", (e) => {
    const t = e.target as HTMLElement;
    if (t.closest("[data-skip]")) {
      e.preventDefault();
      document.getElementById("main")?.focus();
      return;
    }
    const a = t.closest("a[href^='#']");
    if (a) {
      nav.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
      const sec = a.getAttribute("data-section");
      if (sec) pendingJump = `s-${sec}`;
    }
    const cat = t.closest<HTMLButtonElement>("[data-cat]");
    if (cat) {
      filterState.cat = cat.dataset.cat!;
      document.querySelectorAll<HTMLButtonElement>("[data-cat]").forEach((b) => b.setAttribute("aria-pressed", String(b === cat)));
      document.getElementById("project-results")!.innerHTML = projectResults();
    }
    const jump = t.closest<HTMLButtonElement>("[data-jump]");
    if (jump) {
      const el = document.getElementById(jump.dataset.jump!);
      el?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
      el?.querySelector("h2")?.setAttribute("tabindex", "-1");
      (el?.querySelector("h2") as HTMLElement | null)?.focus({ preventScroll: true });
    }
    const copy = t.closest<HTMLButtonElement>("[data-copy]");
    if (copy) {
      const v = copy.dataset.copy!;
      navigator.clipboard?.writeText(v).then(
        () => (copy.textContent = "Copied"),
        () => selectText(copy.previousElementSibling)
      ) ?? selectText(copy.previousElementSibling);
    }
  });

  app.addEventListener("input", (e) => {
    const t = e.target as HTMLInputElement;
    if (t.id === "project-search") {
      filterState.q = t.value;
      document.getElementById("project-results")!.innerHTML = projectResults();
    }
  });
}

function selectText(el: Element | null) {
  if (!el) return;
  const r = document.createRange();
  r.selectNodeContents(el);
  const s = getSelection();
  s?.removeAllRanges();
  s?.addRange(r);
}

function route(): void {
  const token = decodeURIComponent(location.hash.replace(/^#/, "")) || "home";
  const main = document.getElementById("main")!;
  let html = "";
  let active = token;
  let title = site.name;

  if (token.startsWith("case-")) {
    const [slug, mode] = token.slice(5).split("--");
    const p = projectBySlug(slug);
    if (p) {
      html = caseView(p, mode === "tech" ? "tech" : "exec");
      title = `${p.shortTitle} · ${site.name}`;
    }
    active = "projects";
  } else {
    const views: Record<string, () => string> = {
      home: homeView,
      recruiter: recruiterView,
      projects: projectsView,
      capabilities: capabilitiesView,
      flow: flowView,
      research: researchView,
      experience: experienceView,
      evidence: evidenceView,
      contact: contactView,
    };
    if (views[token]) html = views[token]();
  }
  if (!html) {
    html = homeView();
    active = "home";
  }

  main.innerHTML = `<div class="page page--${active}">${html}</div>`;
  document.title = title;
  document.querySelectorAll<HTMLAnchorElement>("[data-nav]").forEach((a) => {
    if (a.dataset.nav === active) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });

  if (pendingJump) {
    const el = document.getElementById(pendingJump);
    pendingJump = null;
    if (el) {
      el.scrollIntoView({ block: "start" });
      return;
    }
  }
  window.scrollTo(0, 0);
}

shell();
window.addEventListener("hashchange", route);
route();
