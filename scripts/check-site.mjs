// Accessibility, layout and link checks against the built site (dist/index.html).
// Runs every route at desktop and phone width in light and dark mode.
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { pathToFileURL } from "node:url";
import { readdirSync, mkdirSync } from "node:fs";
import path from "node:path";

const file = pathToFileURL(path.resolve("dist/index.html")).href;
const slugs = readdirSync("src/content/projects").map((f) => f.replace(".json", ""));
const routes = ["home", "recruiter", "projects", "capabilities", "flow", "research", "experience", "evidence", "contact",
  ...slugs.flatMap((s) => [`case-${s}`, `case-${s}--tech`])];
const shots = process.env.SHOTS_DIR;
if (shots) mkdirSync(shots, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let failures = 0;
for (const scheme of ["light", "dark"]) {
  for (const vp of [{ name: "desktop", width: 1280, height: 900 }, { name: "phone", width: 390, height: 844 }]) {
    const ctx = await browser.newContext({ viewport: vp, colorScheme: scheme });
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    for (const r of routes) {
      await page.goto(`${file}#${r}`);
      await page.waitForTimeout(60);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 1) { failures++; console.log(`✗ [${scheme}/${vp.name}] #${r}: page scrolls horizontally by ${overflow}px`); }
      // internal hash links must resolve to a known route
      const bad = await page.evaluate((known) => [...document.querySelectorAll("a[href^='#']")]
        .map((a) => a.getAttribute("href").slice(1))
        .filter((h) => h && h !== "main" && !known.includes(h)), routes);
      if (bad.length) { failures++; console.log(`✗ #${r}: unknown internal links ${[...new Set(bad)].join(", ")}`); }
      if (scheme === "light" && vp.name === "desktop" || r === "home" || r.endsWith("--tech")) {
        const res = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
        for (const v of res.violations) {
          failures++;
          console.log(`✗ [${scheme}/${vp.name}] #${r}: ${v.id} (${v.impact}) – ${v.help} ×${v.nodes.length}`);
          v.nodes.slice(0, 2).forEach((n) => console.log(`    ${n.target.join(" ")}`));
        }
      }
      if (shots && ["home", "projects", "case-uav-cyber-copilot--tech", "evidence", "flow"].includes(r)) {
        await page.screenshot({ path: `${shots}/${scheme}-${vp.name}-${r}.png`, fullPage: true });
      }
    }
    if (errors.length) { failures++; console.log(`✗ script errors: ${errors.join("; ")}`); }
    await ctx.close();
  }
}
await browser.close();
console.log(failures ? `\n${failures} problem(s) found` : `✓ ${routes.length} routes × 4 modes: no overflow, no broken internal links, no axe violations`);
process.exit(failures ? 1 : 0);
