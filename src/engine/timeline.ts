import { FPS, type FrameInfo, type Scene } from './types';

export interface Timeline {
  totalFrames: number;
  totalSec: number;
  /** Resolve a global frame index to the active scene and its local timing. */
  at(frame: number): { scene: Scene; info: FrameInfo };
}

interface Bound {
  scene: Scene;
  start: number; // first global frame of this scene
  frames: number; // length in frames
}

// Pure, fully unit-testable: lays the scenes end to end on the frame axis and
// maps any global frame back to { scene, local timing }. This is the vitest
// sweet spot — boundary math with no I/O.
export function buildTimeline(scenes: Scene[], fps = FPS): Timeline {
  const bounds: Bound[] = [];
  let acc = 0;
  for (const scene of scenes) {
    const frames = Math.max(1, Math.round(scene.durationSec * fps));
    bounds.push({ scene, start: acc, frames });
    acc += frames;
  }
  const totalFrames = acc;

  return {
    totalFrames,
    totalSec: totalFrames / fps,
    at(frame: number) {
      const f = Math.max(0, Math.min(frame, totalFrames - 1));
      let seg = bounds[bounds.length - 1];
      for (const b of bounds) {
        if (f >= b.start && f < b.start + b.frames) {
          seg = b;
          break;
        }
      }
      const localFrame = f - seg.start;
      return {
        scene: seg.scene,
        info: {
          frame: f,
          t: f / fps,
          localFrame,
          localT: localFrame / fps,
          progress: localFrame / seg.frames,
          fps,
        },
      };
    },
  };
}
