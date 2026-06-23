import { Container, Graphics } from 'pixi.js';
import { HEIGHT, WIDTH, type FrameInfo, type Scene } from '../engine/types';
import { clamp, smoothstep } from '../engine/easing';
import { hslToRgb } from '../engine/palette';
import {
  drawParametric,
  lissajous,
  morphPolygonPoints,
  rose,
  spirograph,
} from '../draw/curves';
import { applyFade, drawBackground } from './common';

const CX = WIDTH / 2;
const CY = HEIGHT / 2;

// A showcase "bumper": cycles through four parametric-geometry effects, each
// continuously animated and crossfading into the next. All pure math into the
// Graphics layer — the same reliable pipeline as every other scene.
//
// Each effect is a draw(g, t) keyed off the global clock so it stays alive
// across the whole scene; alpha handles which one is on screen.
const EFFECTS: ((g: Graphics, t: number) => void)[] = [
  // 1. Spirograph — slowly rotating rosette whose inner gear drifts.
  (g, t) => {
    const d = 95 + 35 * Math.sin(t * 0.3);
    const { pt, thetaMax } = spirograph(CX, CY, 3.0, 130, 53, d, t * 0.15);
    drawParametric(g, pt, thetaMax, { width: 4, hueBase: t * 0.05, hueSpan: 1.4, steps: 620 });
  },
  // 2. Lissajous — knot that re-folds as the phase drifts.
  (g, t) => {
    const { pt, thetaMax } = lissajous(CX, CY, 560, 380, 3, 4, t * 0.6);
    drawParametric(g, pt, thetaMax, { width: 6, hueBase: t * 0.08, hueSpan: 1, steps: 520 });
  },
  // 3. Rose — petals bloom and breathe (non-integer k keeps it morphing).
  (g, t) => {
    const k = 4 + 1.5 * Math.sin(t * 0.25);
    const amp = 420 + 30 * Math.sin(t * 1.5);
    const { pt, thetaMax } = rose(CX, CY, amp, k);
    drawParametric(g, pt, thetaMax * 3, { width: 6, hueBase: t * 0.1, hueSpan: 1, steps: 700 });
  },
  // 4. Morphing polygon — triangle → square → … → circle, filled + outlined.
  (g, t) => {
    const phase = (t * 0.25) % 1; // 0..1 within a side transition
    const idx = Math.floor(t * 0.25);
    const sidesA = 3 + (idx % 6);
    const sidesB = sidesA + 1 >= 9 ? 64 : sidesA + 1; // last step morphs to circle
    const eased = smoothstep(0.1, 0.9, phase);
    const color = hslToRgb((t * 0.1) % 1, 0.7, 0.6);
    const pts = morphPolygonPoints(CX, CY, 360, sidesA, sidesB, eased, t * 0.2);
    g.poly(pts).fill({ color, alpha: 0.85 });
    g.poly(pts).stroke({ width: 8, color: 0xffffff, alpha: 0.9 });
  },
];

export function curvesScene(durationSec: number): Scene {
  let bgG: Graphics;
  const layers: Graphics[] = [];
  const per = durationSec / EFFECTS.length;

  return {
    id: 'curves',
    durationSec,
    init(root: Container) {
      bgG = new Graphics();
      root.addChild(bgG);
      for (let i = 0; i < EFFECTS.length; i++) {
        const g = new Graphics();
        root.addChild(g);
        layers.push(g);
      }
    },
    render(root: Container, info: FrameInfo) {
      const { localT } = info;
      applyFade(root, info, durationSec);

      bgG.clear();
      drawBackground(bgG, info, 0x4f9dff);

      for (let i = 0; i < layers.length; i++) {
        const g = layers[i];
        const start = i * per;
        const end = start + per;
        // Each effect fades in at its slot start and out at its slot end. Curves
        // are mostly transparent strokes, so (unlike opaque shaders) the
        // outgoing one MUST fade out or it shows through the next.
        const alpha = clamp(
          smoothstep(start - 0.5, start + 0.4, localT) - smoothstep(end - 0.4, end + 0.3, localT),
        );
        g.alpha = alpha;
        g.clear();
        if (alpha < 0.01) continue; // skip drawing fully-hidden effects
        EFFECTS[i](g, info.t);
      }
    },
  };
}
