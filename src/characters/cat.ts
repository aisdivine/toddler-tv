import { clamp } from '../engine/easing';
import { darken, lighten } from '../engine/palette';
import { drawEye, drawMouth } from './face';
import type { CharacterArchetype } from './types';

// Coco the Cat — round head, triangle ears, whiskers, slit pupils.
export const cat: CharacterArchetype = {
  id: 'cat',
  name: 'Coco the Cat',
  defaultColor: 0xff993d,
  draw(g, x, y, scale, color, pose = {}) {
    const s = scale;
    const talk = clamp(pose.talk ?? 0);
    const eye = clamp(pose.blink ?? 1);
    const lookX = pose.lookX ?? 0;
    const wig = pose.earWiggle ?? 0;
    const cy = y + (pose.bob ?? 0);

    const outline = darken(color, 0.4);
    const belly = lighten(color, 0.45);

    // Body (sitting) + belly.
    g.ellipse(x, cy + 150 * s, 140 * s, 130 * s).fill(color).stroke({ color: outline, width: 5 * s });
    g.ellipse(x, cy + 170 * s, 80 * s, 95 * s).fill(belly);
    // Tail curling out to the side.
    g.moveTo(x + 120 * s, cy + 200 * s)
      .quadraticCurveTo(x + 250 * s, cy + 170 * s, x + 220 * s, cy + 60 * s)
      .stroke({ width: 26 * s, color, cap: 'round' });

    // Ears (triangles, wiggle) with pink inner.
    for (const dir of [-1, 1]) {
      const wx = dir * wig * 12 * s;
      g.poly([
        x + dir * 50 * s + wx, cy - 120 * s,
        x + dir * 120 * s + wx, cy - 210 * s,
        x + dir * 120 * s + wx, cy - 110 * s,
      ]).fill(color);
      g.poly([
        x + dir * 66 * s + wx, cy - 130 * s,
        x + dir * 104 * s + wx, cy - 180 * s,
        x + dir * 104 * s + wx, cy - 120 * s,
      ]).fill(0xffc2d6);
    }

    // Head.
    g.circle(x, cy - 40 * s, 130 * s).fill(color).stroke({ color: outline, width: 5 * s });

    // Eyes (slit pupils).
    for (const dir of [-1, 1]) {
      drawEye(g, x + dir * 52 * s, cy - 55 * s, {
        r: 40 * s, open: eye, lookX, slit: true, pupil: 0.55,
        pupilColor: 0x234d2a, lidColor: color,
      });
    }

    // Nose + whiskers + mouth.
    const nx = x;
    const ny = cy - 8 * s;
    g.poly([nx - 12 * s, ny, nx + 12 * s, ny, nx, ny + 12 * s]).fill(0xff7aa2);
    for (const dir of [-1, 1]) {
      for (let i = -1; i <= 1; i++) {
        g.moveTo(nx + dir * 18 * s, ny + 4 * s + i * 4 * s)
          .lineTo(nx + dir * 120 * s, ny - 6 * s + i * 18 * s)
          .stroke({ width: 3 * s, color: darken(color, 0.3), alpha: 0.8 });
      }
    }
    drawMouth(g, nx, ny + 26 * s, 70 * s, talk, darken(color, 0.4));
  },
};
