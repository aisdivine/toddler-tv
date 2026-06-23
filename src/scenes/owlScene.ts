import { Container, Graphics } from 'pixi.js';
import { HEIGHT, WIDTH, type FrameInfo, type Scene } from '../engine/types';
import { ARCHETYPES, idlePose, talkEnvelope } from '../characters';
import { applyFade, drawBackground } from './common';

const CX = WIDTH / 2;
const CY = HEIGHT / 2;

// Host segment: the owl "talks" (beak flaps in a speech rhythm) and blinks.
// Silent — lay your voiceover over this and the mouth already moves. Swap
// ARCHETYPES.owl for any other archetype to change the host.
export function owlScene(durationSec: number, color = ARCHETYPES.owl.defaultColor): Scene {
  let bgG: Graphics;
  let charG: Graphics;

  return {
    id: 'owl',
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
      drawBackground(bgG, info, color);

      charG.clear();
      // talk keyed off localT (starts speaking when the owl appears); the rest
      // off the global clock so blink/bob feel continuous.
      const pose = { ...idlePose(t), talk: talkEnvelope(localT) };
      ARCHETYPES.owl.draw(charG, CX, CY, 1.25, color, pose);
    },
  };
}
