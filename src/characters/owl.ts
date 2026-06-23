import { clamp } from '../engine/easing';
import { darken, lighten } from '../engine/palette';
import { drawEye } from './face';
import type { CharacterArchetype } from './types';

// Ollie the Owl — round body, big eyes, ear tufts, a beak that opens to "talk".
export const owl: CharacterArchetype = {
  id: 'owl',
  name: 'Ollie the Owl',
  defaultColor: 0x8a6bff,
  draw(g, x, y, scale, color, pose = {}) {
    const s = scale;
    const talk = clamp(pose.talk ?? 0);
    const eye = clamp(pose.blink ?? 1);
    const lookX = pose.lookX ?? 0;
    const wig = pose.earWiggle ?? 0;
    const cy = y + (pose.bob ?? 0);

    const outline = darken(color, 0.45);
    const belly = lighten(color, 0.5);
    const beakColor = 0xffb13d;

    // Wings (behind body).
    g.ellipse(x - 150 * s, cy + 20 * s, 55 * s, 120 * s).fill(darken(color, 0.12));
    g.ellipse(x + 150 * s, cy + 20 * s, 55 * s, 120 * s).fill(darken(color, 0.12));

    // Ear tufts (wiggle).
    for (const dir of [-1, 1]) {
      const wx = dir * wig * 18 * s;
      g.poly([
        x + dir * 70 * s + wx, cy - 150 * s,
        x + dir * 130 * s + wx, cy - 250 * s,
        x + dir * 110 * s + wx, cy - 140 * s,
      ]).fill(color);
    }

    // Body / head blob + belly.
    g.ellipse(x, cy, 185 * s, 220 * s).fill(color).stroke({ color: outline, width: 6 * s });
    g.ellipse(x, cy + 40 * s, 120 * s, 150 * s).fill(belly);

    // Big owl eyes (with surrounding ring).
    for (const dir of [-1, 1]) {
      const ex = x + dir * 72 * s;
      const ey = cy - 70 * s;
      g.circle(ex, ey, 76 * s).fill(lighten(color, 0.25));
      drawEye(g, ex, ey, { r: 60 * s, open: eye, lookX, pupil: 0.43, lidColor: color });
    }

    // Beak: upper + lower triangle separating with talk; dark mouth behind.
    const bx = x;
    const by = cy - 18 * s;
    const open = talk * 48 * s;
    if (talk > 0.03) {
      g.ellipse(bx, by + 24 * s + open * 0.5, 18 * s, (10 * s + open) * 0.6).fill(0x5a2d12);
    }
    g.poly([bx - 28 * s, by, bx + 28 * s, by, bx, by + 24 * s]).fill(beakColor);
    g.poly([
      bx - 18 * s, by + 24 * s + open,
      bx + 18 * s, by + 24 * s + open,
      bx, by + 44 * s + open,
    ]).fill(darken(beakColor, 0.12));

    // Feet.
    for (const dir of [-1, 1]) {
      const fx = x + dir * 55 * s;
      const fy = cy + 210 * s;
      for (let toe = -1; toe <= 1; toe++) {
        g.poly([
          fx, fy - 8 * s,
          fx + toe * 16 * s, fy + 22 * s,
          fx + toe * 8 * s, fy + 24 * s,
        ]).fill(beakColor);
      }
    }
  },
};
