import { Container, Graphics } from 'pixi.js';
import { HEIGHT, WIDTH, type FrameInfo, type Scene } from '../engine/types';
import { easeOutBack, smoothstep } from '../engine/easing';
import { numberColor } from '../engine/palette';
import { drawNumber } from '../draw/digits';
import { drawShape } from '../draw/shapes';
import { applyFade, drawBackground } from './common';

// Quick montage: flash through 1..10, each showing the digit plus a row of that
// many dots, so the whole count is recapped in one breath at the end.
export function recap(durationSec: number): Scene {
  let bgG: Graphics;
  let fg: Graphics;
  const per = durationSec / 10;

  return {
    id: 'recap',
    durationSec,
    init(root: Container) {
      bgG = new Graphics();
      fg = new Graphics();
      root.addChild(bgG, fg);
    },
    render(root: Container, info: FrameInfo) {
      const { localT } = info;
      const n = Math.min(10, Math.floor(localT / per) + 1);
      const color = numberColor(n);
      const beatT = localT - (n - 1) * per;

      applyFade(root, info, durationSec);
      bgG.clear();
      drawBackground(bgG, info, color);

      fg.clear();
      const pop = easeOutBack(smoothstep(0, 0.25, beatT));
      // big digit up top
      drawNumber(fg, String(n), WIDTH / 2, HEIGHT * 0.36, 300 * pop, 0xffffff);

      // a centered row of n dots beneath it
      const spacing = Math.min(150, (WIDTH * 0.8) / n);
      const startX = WIDTH / 2 - ((n - 1) * spacing) / 2;
      const y = HEIGHT * 0.74;
      for (let i = 0; i < n; i++) {
        const appear = easeOutBack(smoothstep(0.1 + i * 0.04, 0.3 + i * 0.04, beatT));
        if (appear <= 0) continue;
        drawShape(fg, i, startX + i * spacing, y, 40 * appear, color);
      }
    },
  };
}
