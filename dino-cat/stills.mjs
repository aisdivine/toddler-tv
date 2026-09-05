import { existsSync } from "node:fs";
import { generateStillOpenRouter } from "../../deuce-studio/lib/openrouter.mjs";
import { STYLE, DINO, CAT, SET, SHOTS } from "./show.mjs";
import { log } from "./ledger.mjs";

const MODEL = "google/gemini-2.5-flash-image";
const only = process.argv.slice(2);
for (const s of SHOTS) {
  if (only.length && !only.includes(s.id)) continue;
  const out = `stills/${s.id}.jpg`;
  if (existsSync(out) && !only.length) { console.log(`skip ${s.id} (exists)`); continue; }
  const prompt = `${STYLE}\n\nCHARACTERS (the two reference images are the canonical character sheets — match them exactly in colour, shape and proportion):\n${DINO}\n\n${CAT}\n\nSETTING: ${SET}\n\nSHOT: ${s.still}\n\nSingle frame from the show. Widescreen composition, no text, no captions, no watermark, no humans.`;
  process.stdout.write(`still ${s.id} ... `);
  const r = await generateStillOpenRouter({ model: MODEL, prompt, refPaths: ["cast/dino.jpg", "cast/caterpillar.jpg"], outPath: out, aspectRatio: "16:9" });
  log({ kind: "still", id: s.id, model: MODEL, cost: r.cost });
}
