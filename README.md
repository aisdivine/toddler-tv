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
- New parametric effects: the curves bumper (`src/scenes/curvesScene.ts`) shows
  spirographs, Lissajous figures, rose curves and morphing polygons, all from
  `src/draw/curves.ts` (each is a `θ → (x,y)` function strokes-rendered in
  rainbow). Add your own curve generator there and drop it in the `EFFECTS` list.
- Colors: `src/engine/palette.ts`.

## Characters (archetypes)

Reusable creatures drawn from math primitives live in `src/characters/`. Each
exports a `CharacterArchetype` (`id`, `name`, `defaultColor`, `draw(...)`) and is
registered in `src/characters/index.ts`. Current cast: **owl, cat, dog, bunny**.

Use one anywhere:

```ts
import { ARCHETYPES, idlePose, talkEnvelope } from './characters';

ARCHETYPES.cat.draw(g, x, y, scale, ARCHETYPES.cat.defaultColor, {
  ...idlePose(t),            // bob, blink, glance, ear wiggle
  talk: talkEnvelope(t),     // 0..1 mouth flap in a speech rhythm
});
```

Pose fields (`CharacterPose`): `talk`, `blink`, `lookX`, `lookY`, `bob`, `earWiggle`
— all 0..1 / pixels, all pure functions of `t`. `src/characters/expression.ts`
provides `talkEnvelope` / `blinkEnvelope` / `idlePose`; `face.ts` has shared
`drawEye` / `drawMouth`. The cast auto-appears in `castScene` (the "meet the cast"
beat) — add a new `src/characters/<name>.ts`, list it in `index.ts`, and it shows up.

**Voice:** characters are silent; their mouths just move in a believable rhythm.
Add your voiceover in your editor. (For exact lip-sync to your own recording, a
per-frame loudness envelope can drive `talk` — same deterministic approach.)

## Project layout

```
src/engine/      types, timeline, easing, seeded rng, color palette
src/draw/        math primitives, digit glyphs, countable shapes, parametric curves
src/characters/  reusable animal archetypes (owl/cat/dog/bunny) + face + expression
src/scenes/      intro, curves & cast & owl bumpers, countScene (core), recap, outro
src/render/      PixiJS stage + the shared frame driver
src/video.ts     the timeline (which scenes, in what order, how long)
scripts/         render.ts (capture, supports --from/--seconds/--scale) + encode.ts
```

Tests: `npm test` (vitest) covers the timeline math and frame determinism.

MIT.
