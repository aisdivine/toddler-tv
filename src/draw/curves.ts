import type { Graphics } from 'pixi.js';
import { hslToRgb } from '../engine/palette';

// Parametric math curves drawn straight into a PixiJS Graphics — the simple,
// reliable "cool math" path (no shaders). Each curve is a function θ → (x, y);
// drawParametric walks θ and strokes rainbow-colored segments along the way.

export type Point2 = (theta: number) => [number, number];

export interface CurveStyle {
  steps?: number; // polyline resolution
  width?: number; // stroke width
  hueBase?: number; // starting hue 0..1
  hueSpan?: number; // how much hue sweeps across the curve
  alpha?: number;
}

/** Stroke a parametric curve from θ=0 to θ=thetaMax, colored along its length. */
export function drawParametric(
  g: Graphics,
  pt: Point2,
  thetaMax: number,
  style: CurveStyle = {},
): void {
  const steps = style.steps ?? 480;
  const width = style.width ?? 5;
  const hueBase = style.hueBase ?? 0;
  const hueSpan = style.hueSpan ?? 1;
  const alpha = style.alpha ?? 1;

  let [px, py] = pt(0);
  for (let i = 1; i <= steps; i++) {
    const f = i / steps;
    const [x, y] = pt(f * thetaMax);
    const hue = (hueBase + f * hueSpan) % 1;
    g.moveTo(px, py).lineTo(x, y).stroke({ width, color: hslToRgb(hue, 0.78, 0.6), alpha });
    px = x;
    py = y;
  }
}

// --- Curve generators: each returns the point function plus a sensible θ range.

/** Hypotrochoid — the classic spirograph rosette. */
export function spirograph(
  cx: number,
  cy: number,
  scale: number,
  R: number,
  r: number,
  d: number,
  rotation = 0,
): { pt: Point2; thetaMax: number } {
  const k = (R - r) / r;
  return {
    pt: (t) => {
      const a = t + rotation;
      const x = (R - r) * Math.cos(a) + d * Math.cos(k * a);
      const y = (R - r) * Math.sin(a) - d * Math.sin(k * a);
      return [cx + x * scale, cy + y * scale];
    },
    thetaMax: Math.PI * 2 * r, // enough turns to (nearly) close the figure
  };
}

/** Lissajous figure — two perpendicular sine waves. */
export function lissajous(
  cx: number,
  cy: number,
  A: number,
  B: number,
  a: number,
  b: number,
  delta: number,
): { pt: Point2; thetaMax: number } {
  return {
    pt: (t) => [cx + A * Math.sin(a * t + delta), cy + B * Math.sin(b * t)],
    thetaMax: Math.PI * 2,
  };
}

/** Rose / rhodonea curve — r = amp·cos(kθ). Petals bloom from the center. */
export function rose(
  cx: number,
  cy: number,
  amp: number,
  k: number,
): { pt: Point2; thetaMax: number } {
  return {
    pt: (t) => {
      const rr = amp * Math.cos(k * t);
      return [cx + rr * Math.cos(t), cy + rr * Math.sin(t)];
    },
    thetaMax: Math.PI * 2,
  };
}

/** Radius of a regular polygon's edge at angle θ (unit circumradius). */
export function polygonRadius(theta: number, sides: number): number {
  const seg = (Math.PI * 2) / sides;
  const a = ((theta % seg) + seg) % seg;
  return Math.cos(seg / 2) / Math.cos(a - seg / 2);
}

/**
 * Flat point list for a shape morphing between `sidesA`-gon and `sidesB`-gon.
 * t=0 → A, t=1 → B. Use a big side count (e.g. 64) to morph to/from a circle.
 */
export function morphPolygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sidesA: number,
  sidesB: number,
  t: number,
  rotation = 0,
  samples = 120,
): number[] {
  const pts: number[] = [];
  for (let i = 0; i < samples; i++) {
    const theta = (i / samples) * Math.PI * 2;
    const rA = polygonRadius(theta - rotation, sidesA);
    const rB = polygonRadius(theta - rotation, sidesB);
    const rr = (rA + (rB - rA) * t) * radius;
    pts.push(cx + Math.cos(theta) * rr, cy + Math.sin(theta) * rr);
  }
  return pts;
}
