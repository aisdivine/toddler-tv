import { Container, Graphics } from 'pixi.js';
import { HEIGHT, WIDTH, type FrameInfo, type Scene } from '../engine/types';
import { easeOutBack, smoothstep } from '../engine/easing';
import { hslToRgb, numberColor } from '../engine/palette';
import { drawNumber } from '../draw/digits';
import { starPoints } from '../draw/primitives';
import { applyFade, drawBackground } from './common';

// A playful countdown into the show: 3 … 2 … 1 …, each digit bouncing in with a
// burst of spinning stars. Purely numeric so it needs no font.
export function intro(durationSec: number): Scene {
  let bgG: Graphics;
  let fxG: Graphics;
  const step = durationSec / 3; // three big beats: 3, 2, 1

  return {
    id: 'intro',
    durationSec,
    init(root: Container) {
      bgG = new Graphics();
      fxG = new Graphics();
      root.addChild(bgG, fxG);
    },
    render(root: Container, info: FrameInfo) {
      const { localT } = info;
      const idx = Math.min(2, Math.floor(localT / step)); // 0,1,2
      const value = 3 - idx; // 3,2,1
      const color = numberColor(value);
      const beatT = localT - idx * step; // time within this beat

      applyFade(root, info, durationSec);

      bgG.clear();
      drawBackground(bgG, info, color);

      fxG.clear();
      // spinning star burst behind the digit
      const pop = smoothstep(0, 0.4, beatT);
      const burst = easeOutBack(pop);
      const rays = 12;
      for (let i = 0; i < rays; i++) {
        const a = (i / rays) * Math.PI * 2 + localT * 0.8;
        const rr = (220 + Math.sin(localT * 4 + i) * 30) * burst;
        const x = WIDTH / 2 + Math.cos(a) * rr;
        const y = HEIGHT / 2 + Math.sin(a) * rr * 0.7;
        const c = hslToRgb((i / rays + localT * 0.1) % 1, 0.7, 0.6);
        fxG.poly(starPoints(x, y, 34 * burst, 15 * burst, 5, a)).fill({ color: c, alpha: 0.9 });
      }
      // the big bouncing digit, drawn on top of the burst
      const bounce = burst * (1 + 0.05 * Math.sin(beatT * 6));
      drawDigitScaled(fxG, String(value), WIDTH / 2, HEIGHT / 2, 340 * bounce, 0xffffff);
    },
  };
}

// drawNumber draws at a fixed size; for the bounce we just feed it the scaled
// height (all in master coordinates, so it stays crisp).
function drawDigitScaled(
  g: Graphics,
  text: string,
  cx: number,
  cy: number,
  height: number,
  color: number,
): void {
  drawNumber(g, text, cx, cy, Math.max(1, height), color);
}
