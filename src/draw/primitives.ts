import type { Graphics } from 'pixi.js';

// Math-built shape primitives drawn straight into a PixiJS Graphics, mirroring
// stronghold's approach (radial point lists from cos/sin, no image assets).

/** Flat [x0,y0, x1,y1, ...] point list for a regular polygon. */
export function polygonPoints(
  cx: number,
  cy: number,
  radius: number,
  sides: number,
  rotation = 0,
): number[] {
  const pts: number[] = [];
  for (let i = 0; i < sides; i++) {
    const a = rotation + (i / sides) * Math.PI * 2 - Math.PI / 2;
    pts.push(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
  }
  return pts;
}

/** Flat point list for an N-pointed star (alternating outer/inner radius). */
export function starPoints(
  cx: number,
  cy: number,
  outer: number,
  inner: number,
  points: number,
  rotation = 0,
): number[] {
  const pts: number[] = [];
  const n = points * 2;
  for (let i = 0; i < n; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = rotation + (i / n) * Math.PI * 2 - Math.PI / 2;
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}

/** A wobbly "blob" circle whose radius is modulated by a couple of sines. */
export function blobPoints(
  cx: number,
  cy: number,
  radius: number,
  wob: number,
  phase: number,
  steps = 48,
): number[] {
  const pts: number[] = [];
  for (let i = 0; i < steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r =
      radius * (1 + wob * Math.sin(a * 3 + phase) + wob * 0.5 * Math.sin(a * 5 - phase));
    pts.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return pts;
}

/** Filled polygon with an optional outline, in one call. */
export function fillPoly(
  g: Graphics,
  pts: number[],
  color: number,
  outline?: { color: number; width: number },
): void {
  g.poly(pts).fill(color);
  if (outline) g.poly(pts).stroke({ color: outline.color, width: outline.width });
}
