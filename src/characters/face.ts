import type { Graphics } from 'pixi.js';
import { clamp } from '../engine/easing';
import { darken } from '../engine/palette';

// Small reusable face parts shared by the animal archetypes.

export interface EyeOpts {
  r: number; // eye (white) radius
  open: number; // 0..1 openness
  lookX?: number; // -1..1
  lookY?: number;
  pupil?: number; // pupil radius (fraction of r), default 0.42
  pupilColor?: number;
  /** Color used to "close" the eye (usually the body color around it). */
  lidColor: number;
  slit?: boolean; // vertical cat-style pupil
}

/** A round eye with pupil, highlight and a blink that covers from top & bottom. */
export function drawEye(g: Graphics, x: number, y: number, o: EyeOpts): void {
  const open = clamp(o.open);
  const r = o.r;
  g.circle(x, y, r).fill(0xffffff);
  if (open > 0.25) {
    const px = x + (o.lookX ?? 0) * r * 0.3;
    const py = y + (o.lookY ?? 0) * r * 0.3;
    const pr = r * (o.pupil ?? 0.42);
    const color = o.pupilColor ?? 0x222433;
    if (o.slit) g.ellipse(px, py, pr * 0.55, pr * 1.25).fill(color);
    else g.circle(px, py, pr).fill(color);
    g.circle(px - pr * 0.35, py - pr * 0.35, pr * 0.32).fill({ color: 0xffffff, alpha: 0.9 });
  }
  if (open < 1) {
    const lid = (1 - open) * r;
    g.rect(x - r - 1, y - r, 2 * r + 2, lid).fill(o.lidColor);
    g.rect(x - r - 1, y + r - lid, 2 * r + 2, lid).fill(o.lidColor);
  }
}

/** A mammal mouth that opens downward as `talk` grows (dark cavity + lip). */
export function drawMouth(
  g: Graphics,
  x: number,
  y: number,
  width: number,
  talk: number,
  lipColor = 0x6b3b2a,
): void {
  const open = clamp(talk);
  const h = 4 + open * width * 0.7;
  // resting smile line
  g.moveTo(x - width / 2, y)
    .quadraticCurveTo(x, y + width * 0.18, x + width / 2, y)
    .stroke({ width: Math.max(3, width * 0.08), color: lipColor });
  if (open > 0.05) {
    g.ellipse(x, y + h * 0.4, width * 0.34, h * 0.6).fill(0x5a2222); // open cavity
    g.ellipse(x, y + h * 0.7, width * 0.2, h * 0.28).fill(darken(0xff6b6b, 0.1)); // tongue
  }
}
