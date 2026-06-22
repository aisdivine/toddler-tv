import type { Graphics } from 'pixi.js';
import { darken } from '../engine/palette';

// Purely procedural digit glyphs — a rounded seven-segment face built from
// rounded rectangles. No fonts, no assets: keeps the "every visual is math"
// promise and stays byte-identical across machines (a system font would not).

// Which of the 7 segments light up for each digit 0-9.
//   a = top, b = upper-right, c = lower-right, d = bottom,
//   e = lower-left, f = upper-left, g = middle
type Seg = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';
const SEGMENTS: Record<string, Seg[]> = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
};

/** Aspect ratio of one digit cell relative to its height. */
export const DIGIT_ASPECT = 0.58;

function drawDigit(
  g: Graphics,
  ch: string,
  cx: number,
  cy: number,
  height: number,
  color: number,
): void {
  const segs = SEGMENTS[ch];
  if (!segs) return;
  const w = height * DIGIT_ASPECT;
  const t = height * 0.16; // segment thickness
  const r = t * 0.5; // corner radius
  const yTop = cy - height / 2;
  const yBot = cy + height / 2;
  const xL = cx - w / 2;
  const xR = cx + w / 2;
  const halfV = height / 2 - t; // vertical segment length component

  const has = (s: Seg) => segs.includes(s);
  // Horizontal segment centered on y.
  const h = (y: number) => g.roundRect(xL + t * 0.5, y - t * 0.5, w - t, t, r);
  // Vertical segment from yStart spanning halfV.
  const v = (x: number, yStart: number) =>
    g.roundRect(x - t * 0.5, yStart + t * 0.5, t, halfV, r);

  if (has('a')) h(yTop);
  if (has('g')) h(cy);
  if (has('d')) h(yBot);
  if (has('f')) v(xL, yTop);
  if (has('b')) v(xR, yTop);
  if (has('e')) v(xL, cy);
  if (has('c')) v(xR, cy);
  g.fill(color);
}

/**
 * Draw a whole number (one or more digits) horizontally centered on (cx, cy).
 * Renders a soft drop shadow then the colored glyph for a chunky, toddler look.
 */
export function drawNumber(
  g: Graphics,
  text: string,
  cx: number,
  cy: number,
  height: number,
  color: number,
): void {
  const w = height * DIGIT_ASPECT;
  const gap = w * 0.5;
  const totalW = text.length * w + (text.length - 1) * gap;
  let x = cx - totalW / 2 + w / 2;
  const xs: number[] = [];
  for (let i = 0; i < text.length; i++) {
    xs.push(x);
    x += w + gap;
  }
  // Shadow pass (offset down/right, darkened).
  for (let i = 0; i < text.length; i++) {
    drawDigit(g, text[i], xs[i] + height * 0.03, cy + height * 0.04, height, darken(color, 0.55));
  }
  // Main pass.
  for (let i = 0; i < text.length; i++) {
    drawDigit(g, text[i], xs[i], cy, height, color);
  }
}
