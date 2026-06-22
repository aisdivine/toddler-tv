# Toddler TV

Math-made educational videos for toddlers. Every visual is generated procedurally
with PixiJS — shapes from `cos/sin` polygons, numbers from rounded seven-segment
math, motion from sine waves. No image assets. The same approach as the
[mini-games](https://github.com/aisdivine/mini-games) repo, aimed at video instead
of an interactive game.

First video: **Let's Count! (1 → 10)** — each number pops in, that many objects
appear one by one around a ring, and a gentle highlight recounts them on a loop.

## How it works

A video is a list of **scenes** (`src/video.ts`). Each scene draws frame `f` as a
**pure function of `t = f / FPS`** — never the wall clock, never `Math.random` (any
randomness is seeded, `src/engine/rng.ts`). That determinism means:

- the **live preview** in a browser and the **rendered mp4** show identical content, and
- frames can be rendered offline, one at a time, reproducibly.

The same scene code runs two ways:

| | driver | output |
|---|---|---|
| **Preview** | `src/preview.ts` — rAF loop → frame index | live in a browser |
| **Render** | `scripts/render.ts` — Playwright steps each frame | PNG sequence → mp4 |

## Quick start

```bash
npm install
npx playwright install chromium   # one-time: headless browser for rendering
brew install ffmpeg               # one-time: video encoder

npm run dev                       # live preview at http://localhost:5173
                                  #   space = pause · ← → scrub · R restart
```

## Render the video

```bash
npm run video:test   # 5-second smoke render → out/test.mp4 (fast sanity check)
npm run video        # full render → out/counting.mp4  (silent, ~14 min, slow)
```

Useful while iterating:

```bash
npm run render:preview   # 30s at half resolution — quick visual proof
npm run render -- --seconds 60 --scale 0.5
npm run encode -- --name myclip
```

The render step screenshots ~25k frames through a headless browser, so a full pass
is roughly **25 min–1.5 hr** depending on your machine; the encode is a few minutes.
Use the preview (`npm run dev`) for fast iteration and only do full renders when happy.

## Add your own music

The rendered mp4 is **silent** by design — drop it onto a video track in your editor
(CapCut / iMovie / Premiere / Resolve), add a music track, and export.

Or mux a music file directly (no video re-encode):

```bash
npm run mux -- path/to/music.mp3        # → out/counting_music.mp4
```

## Make it longer / shorter or change content

- Length: edit `COUNT_SECS` in `src/video.ts`.
- New numbers/scenes: add to the `scenes` array in `src/video.ts`.
- New countable shapes: add a case to `drawShape` in `src/draw/shapes.ts`.
- Colors: `src/engine/palette.ts`.

## Project layout

```
src/engine/   types, timeline, easing, seeded rng, color palette
src/draw/     math primitives, procedural digit glyphs, countable shapes
src/scenes/   intro, countScene (core), recap, outro, shared background
src/render/   PixiJS stage + the shared frame driver
src/video.ts  the timeline (which scenes, in what order, how long)
scripts/      render.ts (capture) + encode.ts (ffmpeg)
```

Tests: `npm test` (vitest) covers the timeline math and frame determinism.

MIT.
