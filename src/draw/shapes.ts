import type { Graphics } from 'pixi.js';
import { darken, lighten } from '../engine/palette';
import { starPoints } from './primitives';

// The "countable objects." Each is built entirely from math (circles, polygons,
// parametric curves) — no sprites. drawShape dispatches by kind so countScene
// can rotate through them per number.

export const SHAPE_KINDS = 6;

export function drawShape(
  g: Graphics,
  kind: number,
  x: number,
  y: number,
  r: number,
  color: number,
): void {
  switch (((kind % SHAPE_KINDS) + SHAPE_KINDS) % SHAPE_KINDS) {
    case 0:
      ball(g, x, y, r, color);
      break;
    case 1:
      star(g, x, y, r, color);
      break;
    case 2:
      heart(g, x, y, r, color);
      break;
    case 3:
      flower(g, x, y, r, color);
      break;
    case 4:
      balloon(g, x, y, r, color);
      break;
    default:
      fish(g, x, y, r, color);
      break;
  }
}

function ball(g: Graphics, x: number, y: number, r: number, color: number): void {
  g.circle(x, y, r).fill(color).stroke({ color: darken(color, 0.4), width: r * 0.12 });
  // glossy highlight (pure offset circle)
  g.circle(x - r * 0.33, y - r * 0.33, r * 0.26).fill({ color: lighten(color, 0.7), alpha: 0.8 });
}

function star(g: Graphics, x: number, y: number, r: number, color: number): void {
  const pts = starPoints(x, y, r, r * 0.45, 5);
  g.poly(pts).fill(color).stroke({ color: darken(color, 0.4), width: r * 0.1 });
}

function heart(g: Graphics, x: number, y: number, r: number, color: number): void {
  // Classic parametric heart, sampled into a polygon. Screen y is flipped.
  const s = r / 17;
  const pts: number[] = [];
  for (let i = 0; i <= 48; i++) {
    const t = (i / 48) * Math.PI * 2;
    const hx = 16 * Math.sin(t) ** 3;
    const hy =
      13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push(x + hx * s, y - hy * s);
  }
  g.poly(pts).fill(color).stroke({ color: darken(color, 0.4), width: r * 0.1 });
}

function flower(g: Graphics, x: number, y: number, r: number, color: number): void {
  const petals = 6;
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2;
    g.circle(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.42).fill(color);
  }
  g.circle(x, y, r * 0.45).fill(lighten(color, 0.55));
  g.circle(x, y, r * 0.45).stroke({ color: darken(color, 0.4), width: r * 0.08 });
}

function balloon(g: Graphics, x: number, y: number, r: number, color: number): void {
  // teardrop body: ellipse with a small knot triangle below + a string.
  g.ellipse(x, y - r * 0.1, r * 0.8, r).fill(color).stroke({ color: darken(color, 0.4), width: r * 0.08 });
  g.poly([x - r * 0.12, y + r * 0.85, x + r * 0.12, y + r * 0.85, x, y + r * 1.05]).fill(
    darken(color, 0.15),
  );
  g.moveTo(x, y + r * 1.05)
    .quadraticCurveTo(x + r * 0.25, y + r * 1.4, x, y + r * 1.7)
    .stroke({ color: darken(color, 0.3), width: r * 0.05 });
  g.circle(x - r * 0.28, y - r * 0.35, r * 0.18).fill({ color: lighten(color, 0.7), alpha: 0.8 });
}

function fish(g: Graphics, x: number, y: number, r: number, color: number): void {
  g.ellipse(x, y, r, r * 0.7).fill(color).stroke({ color: darken(color, 0.4), width: r * 0.08 });
  // tail
  g.poly([x - r * 0.9, y, x - r * 1.5, y - r * 0.5, x - r * 1.5, y + r * 0.5]).fill(color);
  // eye
  g.circle(x + r * 0.4, y - r * 0.15, r * 0.16).fill(0xffffff);
  g.circle(x + r * 0.45, y - r * 0.15, r * 0.08).fill(0x222222);
}
