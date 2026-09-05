// CUT GATE for Dino & Caterpillar. Nothing gets opened for Divine until this passes.
// Checks: D freeze stretches, K black frames, A audio present & not silent, L loudness sanity.
import { execFileSync } from "node:child_process";
const files = process.argv.slice(2);
const sh = (c) => { try { return execFileSync("sh", ["-c", c], { maxBuffer: 1e8 }).toString(); } catch (e) { return String(e.stdout ?? "") + String(e.stderr ?? ""); } };
let fail = 0;
for (const f of files) {
  const dur = parseFloat(sh(`ffprobe -v error -show_entries format=duration -of csv=p=0 '${f}'`).trim());
  const fz = sh(`ffmpeg -i '${f}' -vf freezedetect=n=-60dB:d=1.2 -map 0:v -f null - 2>&1 | grep freeze_start || true`);
  const freezes = [...fz.matchAll(/freeze_start: ([0-9.]+)/g)].map((m) => +m[1]);
  const bk = sh(`ffmpeg -i '${f}' -vf blackdetect=d=0.4:pic_th=0.98 -f null - 2>&1 | grep black_start || true`);
  const blacks = [...bk.matchAll(/black_start:([0-9.]+)/g)].map((m) => +m[1]);
  const vol = sh(`ffmpeg -i '${f}' -af volumedetect -f null - 2>&1 | grep -E 'mean_volume|max_volume' || true`);
  const mean = parseFloat((vol.match(/mean_volume: (-?[0-9.]+)/) || [])[1] ?? "-99");
  const max = parseFloat((vol.match(/max_volume: (-?[0-9.]+)/) || [])[1] ?? "-99");
  const probs = [];
  if (freezes.length) probs.push(`FREEZE at ${freezes.map((t) => t.toFixed(1)).join(", ")}s`);
  if (blacks.length) probs.push(`BLACK at ${blacks.map((t) => t.toFixed(1)).join(", ")}s`);
  if (max < -25) probs.push(`SILENT (max ${max}dB)`);
  if (mean > -8) probs.push(`CLIPPING RISK (mean ${mean}dB)`);
  if (probs.length) fail++;
  console.log(`${probs.length ? "FAIL" : "pass"}  ${f}  ${dur.toFixed(1)}s  mean ${mean}dB max ${max}dB  ${probs.join(" | ")}`);
}
console.log(fail ? `\nGATE FAILED — ${fail} file(s)` : `\nGATE PASSED — ${files.length} file(s)`);
process.exit(fail ? 1 : 0);
