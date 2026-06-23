import { Container, Graphics } from 'pixi.js';
import { HEIGHT, WIDTH, type FrameInfo, type Scene } from '../engine/types';
import { ARCHETYPE_LIST, idlePose } from '../characters';
import { applyFade, drawBackground } from './common';

// "Meet the cast" — every character archetype in a row, each idling/talking on
// its own offset so they don't move in unison. Great for previewing the cast
// and a nice intro beat. Reads straight from the archetype registry, so any
// character you add shows up here automatically.
export function castScene(durationSec: number): Scene {
  let bgG: Graphics;
  let charG: Graphics;
  const n = ARCHETYPE_LIST.length;

  return {
    id: 'cast',
    durationSec,
    init(root: Container) {
      bgG = new Graphics();
      charG = new Graphics();
      root.addChild(bgG, charG);
    },
    render(root: Container, info: FrameInfo) {
      const { t, localT } = info;
      applyFade(root, info, durationSec);

      bgG.clear();
      drawBackground(bgG, info, 0x3dc6c6);

      charG.clear();
      for (let i = 0; i < n; i++) {
        const arch = ARCHETYPE_LIST[i];
        const x = WIDTH * ((i + 0.5) / n);
        const y = HEIGHT * 0.52;
        // pop each one in, staggered; then idle + talk on a per-character offset
        const appear = Math.min(1, Math.max(0, (localT - i * 0.35) / 0.5));
        if (appear <= 0) continue;
        const pose = idlePose(t + i * 0.9, { talk: true, bobPx: 12 });
        arch.draw(charG, x, y, 0.74 * (0.6 + 0.4 * appear), arch.defaultColor, pose);
      }
    },
  };
}
