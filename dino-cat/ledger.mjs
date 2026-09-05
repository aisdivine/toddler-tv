import { readFileSync, writeFileSync, existsSync } from "node:fs";
const F = new URL("./cost.json", import.meta.url).pathname;
export function log(entry) {
  const d = existsSync(F) ? JSON.parse(readFileSync(F, "utf8")) : { entries: [], total: 0 };
  d.entries.push({ ts: new Date().toISOString(), ...entry });
  d.total = +d.entries.reduce((s, e) => s + (e.cost || 0), 0).toFixed(4);
  writeFileSync(F, JSON.stringify(d, null, 2));
  console.log(`  $${(entry.cost ?? 0).toFixed(4)}  (running total $${d.total.toFixed(4)})`);
  return d.total;
}
export function total() {
  return existsSync(F) ? JSON.parse(readFileSync(F, "utf8")).total : 0;
}
