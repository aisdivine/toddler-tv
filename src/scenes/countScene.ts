import { Container, Graphics } from 'pixi.js';
import { HEIGHT, WIDTH, type FrameInfo, type Scene } from '../engine/types';
import { easeOutBack, smoothstep } from '../engine/easing';
import { numberColor } from '../engine/palette';
import { drawNumber } from '../draw/digits';
import { drawShape } from '../draw/shapes';
import { applyFade, drawBackground } from './common';

export interface CountOpts {
  durationSec: number;
  /** Which countable shape this number uses (rotates apple/star/heart/...). */
  shape: number;
}

const CX = WIDTH / 2;
const CY = HEIGHT / 2;

// One counting beat for the number N: the big glyph pops in, then N objects
// appear one by one around an ellipse, then a gentle "recount" highlight walks
// across them on a loop. Everything keys off info.localT — pure and replayable.
export function countScene(n: number, opts: CountOpts): Scene {
  const color = numberColor(n);
  const headerDelay = 0.8; // wait before the first object appears
  const spawnGap = 0.9; // seconds between each object appearing
  const allInAt = headerDelay + n * spawnGap + 0.5;

  // ellipse radius grows a little with the count so 10 objects don't crowd
  const R = 300 + Math.min(n, 10) * 16;
  const RY = R * 0.6;
  const objR = n <= 5 ? 78 : 64;

  let bgG: Graphics;
  let numG: Graphics; // the digit glyph, drawn once at origin then transformed
  let objG: Graphics; // objects + highlight, redrawn each frame

  return {
    id: `count-${n}`,
    durationSec: opts.durationSec,
    init(root: Container) {
      bgG = new Graphics();
      numG = new Graphics();
      objG = new Graphics();
      root.addChild(bgG, numG, objG);
      // Draw the glyph once around (0,0) so scaling pops it about its center.
      drawNumber(numG, String(n), 0, 0, 300, color);
      numG.position.set(CX, CY);
    },
    render(root: Container, info: FrameInfo) {
      const { localT } = info;
      applyFade(root, info, opts.durationSec);

      bgG.clear();
      drawBackground(bgG, info, color);

      // Number glyph: easeOutBack pop-in over 0.6s, then a slow sine "breathe".
      const popIn = smoothstep(0, 0.6, localT);
      const breathe = 1 + 0.035 * Math.sin(localT * 2.0);
      numG.scale.set(easeOutBack(popIn) * breathe);
      numG.alpha = popIn;

      objG.clear();

      // Recount highlight: after everything is in, a marker walks 1..N on a loop
      // (0.55s per object, then a 1.6s rest) so the screen is never static.
      let activeIdx = -1;
      if (localT > allInAt) {
        const perObj = 0.55;
        const rest = 1.6;
        const period = n * perObj + rest;
        const tl = (localT - allInAt) % period;
        const i = Math.floor(tl / perObj);
        if (i < n) activeIdx = i;
      }

      for (let i = 0; i < n; i++) {
        const appearAt = headerDelay + i * spawnGap;
        const appear = smoothstep(appearAt, appearAt + 0.45, localT);
        if (appear <= 0) continue;

        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const ox = CX + Math.cos(a) * R;
        const oy = CY + Math.sin(a) * RY;
        const wobble = Math.sin(localT * 2 + i * 1.3) * 6;
        const highlight = i === activeIdx ? 1.28 : 1;
        const scale = easeOutBack(appear) * highlight * (0.96 + 0.04 * Math.sin(localT * 3 + i));

        if (i === activeIdx) {
          // count ripple under the active object
          g_ring(objG, ox, oy + wobble, objR * 1.5, color, 0.4);
        }
        drawShape(objG, opts.shape + i, ox, oy + wobble, objR * scale, color);
      }

      // Final celebration: a pulsing ring around the whole group near the end.
      const prog = info.progress;
      if (prog > 0.9) {
        const cel = (prog - 0.9) / 0.1;
        const rr = R + 70 + Math.sin(localT * 6) * 14;
        objG.ellipse(CX, CY, rr, rr * 0.6).stroke({ width: 8, color, alpha: 0.45 * cel });
      }
    },
  };
}

function g_ring(g: Graphics, x: number, y: number, r: number, color: number, alpha: number): void {
  g.circle(x, y, r).stroke({ width: 6, color, alpha });
}
