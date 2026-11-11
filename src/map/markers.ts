/* Todo:
-> report pins shared by the WebGL map and the raster (Leaflet) map: grouping and the pin button
*/
import type { PublicReport } from '../public-reports/data';
import { conditionGlyph } from '../public-reports/conditionFeatures';

export type PinGroup = { x: number; y: number; selected: boolean; members: PublicReport[] };

// input param : rows, their screen position, the visible size, the selected report
// output      : groups of reports whose pins would overlap (closer than 44 px on both axes); the selected pin stays alone
// Why/Note: grouped by distance, not grid cells - pins in neighbouring cells could sit 1 px apart and their 44 px buttons overlapped
export function groupReports(rows: PublicReport[], project: (row: PublicReport) => { x: number; y: number }, width: number, height: number, selectedId: string | null) {
  const groups: PinGroup[] = [];
  for (const row of rows) {
    const point = project(row);
    if (point.x < -44 || point.y < -44 || point.x > width + 44 || point.y > height + 44) continue;
    const selected = selectedId === row.id;
    let near: PinGroup | undefined, best = 44;
    if (!selected) for (const group of groups) {
      const gap = Math.max(Math.abs(group.x - point.x), Math.abs(group.y - point.y));
      if (!group.selected && gap < best) { best = gap; near = group; }
    }
    if (near) near.members.push(row); else groups.push({ x: point.x, y: point.y, selected, members: [row] });
  }
  return groups;
}

const PATHS: Record<string, string> = { road: 'm8 4-2 16M16 4l2 16M12 5v3m0 3v3m0 3v2',
  construction: 'M4 8h16v7H4zM7 15v5m10-5v5M7 8l5 7m1-7 5 7',
  drain: 'M3 7c3-4 6 4 9 0s6 4 9 0M3 12c3-4 6 4 9 0s6 4 9 0M3 17c3-4 6 4 9 0s6 4 9 0',
  burning: 'M12 3c1 5 7 5 7 11a7 7 0 0 1-14 0c0-3 2-5 4-7 0 3 1 4 3 5 2-3 1-6 0-9Z' };

// the pin button: a count for a group, the condition or category glyph for one report, ringed in its category colour
export function pinButton(group: PublicReport[], selected: boolean, disabled: boolean) {
  const row = group[0], isGroup = group.length > 1;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `lj-marker${isGroup ? ' is-cluster' : ` cat-${row.category}`}${selected ? ' is-selected' : ''}`; // cat-* colours the ring (public-reports.css)
  button.dataset.reportIds = group.map(item => item.id).join(',');
  button.innerHTML = isGroup ? `<span>${group.length}</span>` : `<span><svg viewBox="0 0 24 24" aria-hidden="true">${(row.condition && conditionGlyph(row.condition.kind)) ?? `<path d="${PATHS[row.category] ?? PATHS.road}"/>`}</svg></span>`;
  button.disabled = disabled;
  button.setAttribute('aria-label', isGroup ? `Perbesar ${group.length} laporan` : `Buka laporan ${row.code}`);
  return button;
}
