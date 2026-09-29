import type { Diagram } from "./types";
import { esc } from "./ui";

/**
 * Renders a column-layout architecture diagram as inline SVG from project data.
 * Columns flow left to right; zones draw trust boundaries across column ranges.
 */
export function renderDiagram(d: Diagram, title: string): string {
  const colW = 172;
  const gap = 58;
  const nodeH = 52;
  const nodeGap = 14;
  const padX = 16;
  const headH = 34;
  const zoneLabelH = d.zones.length ? 30 : 0;

  const maxNodes = Math.max(...d.columns.map((c) => c.nodes.length));
  const bodyH = maxNodes * nodeH + (maxNodes - 1) * nodeGap;
  const width = padX * 2 + d.columns.length * colW + (d.columns.length - 1) * gap;
  const height = headH + 16 + bodyH + 18 + zoneLabelH + 8;

  const pos = new Map<string, { x: number; y: number; col: number; idx: number }>();
  d.columns.forEach((col, ci) => {
    const colH = col.nodes.length * nodeH + (col.nodes.length - 1) * nodeGap;
    const top = headH + 16 + (bodyH - colH) / 2;
    col.nodes.forEach((n, ni) => {
      pos.set(n.id, { x: padX + ci * (colW + gap), y: top + ni * (nodeH + nodeGap), col: ci, idx: ni });
    });
  });

  const zones = d.zones
    .map((z) => {
      const x = padX + z.from * (colW + gap) - 10;
      const w = (z.to - z.from + 1) * colW + (z.to - z.from) * gap + 20;
      const y = headH + 4;
      const h = bodyH + 24 + zoneLabelH;
      return `<g class="dg-zone"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>
        <text x="${x + 12}" y="${y + h - 11}">${esc(z.label)}</text></g>`;
    })
    .join("");

  const heads = d.columns
    .map((c, ci) => `<text class="dg-colhead" x="${padX + ci * (colW + gap) + colW / 2}" y="20">${esc(c.title.toUpperCase())}</text>`)
    .join("");

  const edges = d.edges
    .map(([a, b]) => {
      const s = pos.get(a);
      const t = pos.get(b);
      if (!s || !t) return "";
      let path: string;
      if (s.col === t.col) {
        if (Math.abs(s.idx - t.idx) === 1) {
          const down = t.idx > s.idx;
          const x = s.x + colW / 2;
          const y1 = down ? s.y + nodeH : s.y;
          const y2 = down ? t.y - 2 : t.y + nodeH + 2;
          path = `M${x},${y1} L${x},${y2}`;
        } else {
          const x = s.x;
          const y1 = s.y + nodeH / 2;
          const y2 = t.y + nodeH / 2;
          path = `M${x},${y1} C${x - 26},${y1} ${x - 26},${y2} ${x - 2},${y2}`;
        }
      } else if (t.col > s.col) {
        const x1 = s.x + colW;
        const y1 = s.y + nodeH / 2;
        const x2 = t.x - 2;
        const y2 = t.y + nodeH / 2;
        const mx = (x1 + x2) / 2;
        path = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
      } else {
        const x1 = s.x;
        const y1 = s.y + nodeH / 2;
        const x2 = t.x + colW + 2;
        const y2 = t.y + nodeH / 2;
        const mx = (x1 + x2) / 2;
        path = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
      }
      return `<path class="dg-edge" d="${path}" marker-end="url(#dg-arrow)"/>`;
    })
    .join("");

  const nodes = d.columns
    .flatMap((c) => c.nodes)
    .map((n) => {
      const p = pos.get(n.id)!;
      const cx = p.x + colW / 2;
      const labelY = n.sub ? p.y + 22 : p.y + nodeH / 2 + 5;
      return `<g class="dg-node"><rect x="${p.x}" y="${p.y}" width="${colW}" height="${nodeH}" rx="7"/>
        <text class="dg-label" x="${cx}" y="${labelY}">${esc(n.label)}</text>
        ${n.sub ? `<text class="dg-sub" x="${cx}" y="${p.y + 39}">${esc(n.sub)}</text>` : ""}</g>`;
    })
    .join("");

  return `<figure class="diagram">
    <div class="diagram__scroll" tabindex="0" role="region" aria-label="${esc(title)} architecture diagram, scrolls horizontally">
      <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${esc(title)} architecture">
        <defs><marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="dg-arrowhead" d="M0,0 L10,5 L0,10 z"/></marker></defs>
        ${zones}${heads}${edges}${nodes}
      </svg>
    </div>
  </figure>`;
}
