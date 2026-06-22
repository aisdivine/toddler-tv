import { FPS, HEIGHT, WIDTH, type VideoSpec } from './engine/types';
import { intro } from './scenes/intro';
import { countScene } from './scenes/countScene';
import { recap } from './scenes/recap';
import { outro } from './scenes/outro';

// The whole video, declared as a list of scenes. Total length is just the sum
// of the durations below. Tweak COUNT_SECS to make it longer/shorter.
//
//   intro 9s + 10 × 78s counting + recap 30s + outro 9s
//   = 9 + 780 + 30 + 9 = 828s ≈ 13.8 min
const COUNT_SECS = 78;

const counts = Array.from({ length: 10 }, (_, i) =>
  countScene(i + 1, { durationSec: COUNT_SECS, shape: i }),
);

export const video: VideoSpec = {
  width: WIDTH,
  height: HEIGHT,
  fps: FPS,
  scenes: [intro(9), ...counts, recap(30), outro(9)],
};
