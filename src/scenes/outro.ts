import { Container, Graphics } from 'pixi.js';
import { HEIGHT, WIDTH, type FrameInfo, type Scene } from '../engine/types';
import { easeOutBack, smoothstep } from '../engine/easing';
import { hslToRgb } from '../engine/palette';
import { starPoints } from '../draw/primitives';
import { applyFade, drawBackground } from './common';

// A confetti celebration to close: a big bouncing star and a rain of falling
// confetti, all deterministic (hash-free here — positions come from index+time).
export function outro(durationSec: number): Scene {
  let bgG: Graphics;
  let fxG: Graphics;
  const count = 80;

  return {
    id: 'outro',
    durationSec,
    init(root: Container) {
      bgG = new Graphics();
      fxG = new Graphics();
      root.addChild(bgG, fxG);
    },
    render(root: Container, info: FrameInfo) {
      const { localT } = info;
      applyFade(root, info, durationSec);

      bgG.clear();
      drawBackground(bgG, info, 0xffd23d);

      fxG.clear();
      // confetti rain
      for (let i = 0; i < count; i++) {
        const baseX = ((i * 137.5) % WIDTH);
        const sway = Math.sin(localT * 2 + i) * 30;
        const fall = ((localT * (90 + (i % 5) * 20) + i * 50) % (HEIGHT + 60)) - 30;
        const c = hslToRgb((i / count) % 1, 0.7, 0.6);
        const s = 12 + (i % 4) * 4;
        const rot = localT * 3 + i;
        fxG.poly(starPoints(baseX + sway, fall, s, s * 0.45, 4, rot)).fill({ color: c, alpha: 0.95 });
      }
      // big bouncing star in the middle
      const pop = easeOutBack(smoothstep(0, 0.5, localT));
      const bounce = pop * (1 + 0.08 * Math.sin(localT * 3));
      const r = 220 * bounce;
      fxG.poly(starPoints(WIDTH / 2, HEIGHT / 2, r, r * 0.45, 5, localT * 0.5)).fill({
        color: 0xffffff,
        alpha: 0.95,
      });
      fxG
        .poly(starPoints(WIDTH / 2, HEIGHT / 2, r * 0.7, r * 0.3, 5, localT * 0.5))
        .fill({ color: 0xffd23d });
    },
  };
}
