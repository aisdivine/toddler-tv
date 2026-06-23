import { clamp } from '../engine/easing';
import { darken, lighten } from '../engine/palette';
import { drawEye, drawMouth } from './face';
import type { CharacterArchetype } from './types';

// Bea the Bunny — tall wiggly ears, round cheeks, twitchy nose.
export const bunny: CharacterArchetype = {
  id: 'bunny',
  name: 'Bea the Bunny',
  defaultColor: 0xff8fb3,
  draw(g, x, y, scale, color, pose = {}) {
    const s = scale;
    const talk = clamp(pose.talk ?? 0);
    const eye = clamp(pose.blink ?? 1);
    const lookX = pose.lookX ?? 0;
    const wig = pose.earWiggle ?? 0;
    const cy = y + (pose.bob ?? 0);

    const outline = darken(color, 0.35);
    const belly = lighten(color, 0.5);
    const inner = 0xffd0e0;

    // Tall ears (the wiggly stars of the show) — outer + inner, tilting.
    for (const dir of [-1, 1]) {
      const tilt = wig * dir * 26 * s;
      g.ellipse(x + dir * 55 * s + tilt, cy - 230 * s, 34 * s, 130 * s).fill(color).stroke({ color: outline, width: 4 * s });
      g.ellipse(x + dir * 55 * s + tilt, cy - 230 * s, 16 * s, 100 * s).fill(inner);
    }

    // Body + belly.
    g.ellipse(x, cy + 150 * s, 130 * s, 135 * s).fill(color).stroke({ color: outline, width: 5 * s });
    g.ellipse(x, cy + 165 * s, 78 * s, 100 * s).fill(belly);

    // Head.
    g.circle(x, cy - 30 * s, 125 * s).fill(color).stroke({ color: outline, width: 5 * s });

    // Eyes.
    for (const dir of [-1, 1]) {
      drawEye(g, x + dir * 50 * s, cy - 45 * s, { r: 38 * s, open: eye, lookX, lidColor: color });
    }
    // Round cheeks.
    for (const dir of [-1, 1]) {
      g.circle(x + dir * 78 * s, cy + 6 * s, 26 * s).fill({ color: 0xff7aa2, alpha: 0.35 });
    }

    // Nose + mouth (+ a couple of front teeth when talking).
    const nx = x;
    const ny = cy + 2 * s;
    g.poly([nx - 12 * s, ny, nx + 12 * s, ny, nx, ny + 12 * s]).fill(0xff5d8a);
    drawMouth(g, nx, ny + 24 * s, 60 * s, talk, darken(color, 0.4));
    if (talk < 0.4) {
      g.rect(nx - 9 * s, ny + 22 * s, 8 * s, 16 * s).fill(0xffffff);
      g.rect(nx + 1 * s, ny + 22 * s, 8 * s, 16 * s).fill(0xffffff);
    }

    // Feet.
    for (const dir of [-1, 1]) {
      g.ellipse(x + dir * 60 * s, cy + 270 * s, 48 * s, 28 * s).fill(belly);
    }
  },
};
