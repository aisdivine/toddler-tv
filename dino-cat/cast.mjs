// Turn the two real toy photos into clean character sheets on white.
import { generateStillOpenRouter } from "../../deuce-studio/lib/openrouter.mjs";
import { STYLE, DINO, CAT } from "./show.mjs";
import { log } from "./ledger.mjs";

const MODEL = "google/gemini-2.5-flash-image";
const jobs = [
  { out: "cast/dino.jpg", refs: ["refs/ref1.jpg"], who: DINO,
    note: "The reference photo shows the real orange inflatable bounce toy this character is based on. Match its exact colour, spots, horn shape and proportions." },
  { out: "cast/caterpillar.jpg", refs: ["refs/ref2.jpg"], who: CAT,
    note: "The reference photo shows the real green wooden pull-along caterpillar toy this character is based on (bottom right of frame). Match its exact disc segments, green tones, red spotted head and wooden wheels. Ignore the bicycle in the photo." },
];

for (const j of jobs) {
  const prompt = `${STYLE}\n\n${j.who}\n\n${j.note}\n\nCHARACTER SHEET: full-body three-quarter view of this single character, standing alone and centred on a plain soft white studio background, even soft lighting, no props, no other characters, no text. The character is alive and smiling at the viewer.`;
  process.stdout.write(`cast ${j.out} ... `);
  const r = await generateStillOpenRouter({ model: MODEL, prompt, refPaths: j.refs, outPath: j.out, aspectRatio: "1:1" });
  log({ kind: "still", id: j.out, model: MODEL, cost: r.cost });
}
