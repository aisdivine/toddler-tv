import type { Container, Graphics } from 'pixi.js';
import { HEIGHT, WIDTH, type FrameInfo } from '../engine/types';
import { smoothstep } from '../engine/easing';
import { hash01 } from '../engine/rng';
import { lerpRgb, lighten } from '../engine/palette';

// Crossfade the whole scene in over its first FADE seconds and out over its
// last FADE seconds, using only the frame timing (stays pure/deterministic).
const FADE = 0.4;
export function applyFade(root: Container, info: FrameInfo, durationSec: number): void {
  const inA = smoothstep(0, FADE, info.localT);
  const outA = smoothstep(0, FADE, durationSec - info.localT);
  root.alpha = Math.min(inA, outA);
}

// A calm animated backdrop: a soft two-tone wash plus a field of slowly
// drifting bubbles. Every bubble's position is a pure function of (index, t)
// via hash01 — no Math.random, so it renders identically every time.
export function drawBackground(
  g: Graphics,
  info: FrameInfo,
  baseColor: number,
  count = 16,
): void {
  // Bright pastel vertical wash in the base hue: a deeper tint up top easing to
  // a soft light tint at the bottom (cheap banded gradient).
  const top = lerpRgb(baseColor, 0x1b2444, 0.35); // rich but not muddy
  const bottom = lighten(baseColor, 0.7); // soft pastel
  const bands = 16;
  for (let i = 0; i < bands; i++) {
    const k = i / (bands - 1);
    g.rect(0, (HEIGHT / bands) * i, WIDTH, HEIGHT / bands + 1).fill({
      color: lerpRgb(top, bottom, k),
      alpha: 1,
    });
  }

  for (let i = 0; i < count; i++) {
    const r = 26 + hash01(i, 1) * 70;
    const speed = 8 + hash01(i, 2) * 22;
    const driftX = Math.sin(info.t * 0.2 + i) * 40;
    const x = hash01(i, 3) * WIDTH + driftX;
    // rise slowly and wrap around the top
    const span = HEIGHT + 2 * r;
    const y = HEIGHT + r - ((info.t * speed + hash01(i, 4) * span) % span);
    const a = 0.05 + hash01(i, 5) * 0.06;
    g.circle(x, y, r).fill({ color: lighten(baseColor, 0.8), alpha: a });
  }
}
