import type { Container } from 'pixi.js';

// Master video resolution and frame rate. Everything is rendered at this exact
// size; the offline capture locks the canvas to WIDTH×HEIGHT, while the live
// preview letterboxes it to the window.
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

// Everything a scene needs to draw exactly one frame. The golden rule of this
// repo: a scene's visuals are a PURE FUNCTION of these numbers — never the wall
// clock, never Math.random(). Same FrameInfo in ⇒ identical pixels out.
export interface FrameInfo {
  /** Global frame index, 0-based, across the whole video. */
  frame: number;
  /** Global seconds since the video started = frame / FPS. */
  t: number;
  /** Frames since the active scene started. */
  localFrame: number;
  /** Seconds since the active scene started. */
  localT: number;
  /** 0..1 progress through the active scene. */
  progress: number;
  fps: number;
}

export interface Scene {
  /** Stable id; a change between frames triggers a fresh mount. */
  id: string;
  durationSec: number;
  /** Build reusable display objects once. Called when the scene mounts. */
  init?(root: Container): void;
  /** Redraw the scene to its exact state for this frame. Pure in FrameInfo. */
  render(root: Container, info: FrameInfo): void;
}

export interface VideoSpec {
  width: number;
  height: number;
  fps: number;
  scenes: Scene[];
}
