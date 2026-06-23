import { clamp } from '../engine/easing';
import { darken, lighten } from '../engine/palette';
import { drawEye, drawMouth } from './face';
import type { CharacterArchetype } from './types';

// Pip the Puppy — floppy ears, a muzzle with a black nose, waggy tail.
export const dog: CharacterArchetype = {
  id: 'dog',
  name: 'Pip the Puppy',
  defaultColor: 0xc79a5b,
  draw(g, x, y, scale, color, pose = {}) {
    const s = scale;
    const talk = clamp(pose.talk ?? 0);
    const eye = clamp(pose.blink ?? 1);
    const lookX = pose.lookX ?? 0;
    const wig = pose.earWiggle ?? 0;
    const cy = y + (pose.bob ?? 0);

    const outline = darken(color, 0.4);
    const belly = lighten(color, 0.5);
    const earColor = darken(color, 0.2);

    // Body + belly + wagging tail.
    g.ellipse(x, cy + 150 * s, 135 * s, 130 * s).fill(color).stroke({ color: outline, width: 5 * s });
    g.ellipse(x, cy + 165 * s, 78 * s, 95 * s).fill(belly);
    g.moveTo(x - 120 * s, cy + 175 * s)
      .quadraticCurveTo(x - 210 * s, cy + 150 * s - wig * 40 * s, x - 200 * s, cy + 90 * s - wig * 30 * s)
      .stroke({ width: 24 * s, color, cap: 'round' });

    // Floppy ears (behind head), swinging with wiggle.
    for (const dir of [-1, 1]) {
      g.ellipse(x + dir * 110 * s, cy - 30 * s + wig * dir * 14 * s, 46 * s, 110 * s).fill(earColor);
    }

    // Head.
    g.circle(x, cy - 40 * s, 128 * s).fill(color).stroke({ color: outline, width: 5 * s });

    // Eyes.
    for (const dir of [-1, 1]) {
      drawEye(g, x + dir * 48 * s, cy - 60 * s, { r: 38 * s, open: eye, lookX, lidColor: color });
    }

    // Muzzle + nose + mouth.
    const mx = x;
    const my = cy + 8 * s;
    g.ellipse(mx, my + 6 * s, 78 * s, 60 * s).fill(belly);
    g.ellipse(mx, my - 22 * s, 22 * s, 16 * s).fill(0x2a2a2a); // nose
    drawMouth(g, mx, my + 18 * s, 84 * s, talk, darken(color, 0.45));

    // Front paws.
    for (const dir of [-1, 1]) {
      g.ellipse(x + dir * 55 * s, cy + 255 * s, 42 * s, 30 * s).fill(belly);
    }
  },
};
