import { existsSync } from "node:fs";
import { generateClipOpenRouter } from "../../deuce-studio/lib/openrouter.mjs";
import { STYLE, DINO, CAT, SHOTS } from "./show.mjs";
import { log } from "./ledger.mjs";

const MODEL = "google/veo-3.1-lite";
const SECONDS = 8, RES = "720p";
const only = process.argv.slice(2);
const todo = SHOTS.filter((s) => (only.length ? only.includes(s.id) : !existsSync(`clips/${s.id}.mp4`)));
console.log(`clips to make: ${todo.map((s) => s.id).join(", ") || "(none)"}`);

const VOICES =
  "VOICES: Dino has a warm, soft, slightly deep friendly voice, gentle and unhurried. " +
  "Caterpillar has a small, bright, sing-song higher voice. Both speak slowly and clearly for a toddler audience. " +
  "Gentle cheerful ukulele-and-glockenspiel music underneath, quiet birdsong ambience. " +
  "No narrator. No other voices. No subtitles, no captions, no on-screen text.";

async function run(s) {
  const prompt =
    `${STYLE}\n\n${DINO}\n\n${CAT}\n\n` +
    `The opening frame is the exact look of this shot — hold the characters, colours, lighting and setting consistent with it for the whole clip.\n\n` +
    `ACTION: ${s.action}\n\nDIALOGUE: ${s.line}\n\n${VOICES}\n\n` +
    `COLOUR LOCK (do not drift): Caterpillar's stacked body discs stay GREEN (lime and grass green) for the entire clip and its domed head stays RED-PINK with two small purple dots and two short thin black antennae. Dino stays ORANGE with pale yellow oval spots and brown horns. No character changes colour, size or shape at any point.\n\n` +
    `Single continuous shot, slow gentle camera, no cuts, no zoom crash, no text on screen.`;
  const out = `clips/${s.id}.mp4`;
  const t0 = Date.now();
  const r = await generateClipOpenRouter({
    model: MODEL, prompt, firstFramePath: `stills/${s.id}.jpg`,
    seconds: SECONDS, resolution: RES, aspectRatio: "16:9",
    generateAudio: true, seed: Number(process.env.SEED ?? 4242), outPath: out,
    onUpdate: (m) => process.stdout.write(`[${s.id}] ${m}\n`),
  });
  console.log(`[${s.id}] done in ${Math.round((Date.now() - t0) / 1000)}s`);
  log({ kind: "clip", id: s.id, model: MODEL, seconds: SECONDS, cost: r.cost ?? SECONDS * 0.05 });
}

const LIMIT = 4;
const queue = [...todo];
await Promise.all(Array.from({ length: LIMIT }, async () => {
  while (queue.length) {
    const s = queue.shift();
    try { await run(s); } catch (e) { console.error(`[${s.id}] FAILED: ${e.message}`); }
  }
}));
