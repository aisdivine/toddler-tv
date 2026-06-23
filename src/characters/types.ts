import type { Graphics } from 'pixi.js';

// A character archetype: a reusable, self-contained creature drawn from math
// primitives, with an animatable pose. Register new ones in ./index.ts so any
// scene can reference them by id.

export interface CharacterPose {
  /** 0..1 mouth/beak openness — drive with talkEnvelope() for "talking". */
  talk?: number;
  /** 0..1 eye openness (1 = wide open) — drive with blinkEnvelope(). */
  blink?: number;
  /** -1..1 horizontal pupil glance. */
  lookX?: number;
  /** -1..1 vertical pupil glance. */
  lookY?: number;
  /** Vertical offset in pixels (already scaled), e.g. a gentle idle bob. */
  bob?: number;
  /** -1..1 ear movement (wiggle/tilt). */
  earWiggle?: number;
}

export interface CharacterArchetype {
  /** Stable identifier, e.g. "owl". */
  id: string;
  /** Display name, e.g. "Ollie the Owl". */
  name: string;
  /** Suggested body color (overridable per use). */
  defaultColor: number;
  /**
   * Draw the character centered at (x, y). scale 1 ≈ 460px tall. `color` tints
   * the body; accent colors derive from it. Pure function of its args.
   */
  draw(
    g: Graphics,
    x: number,
    y: number,
    scale: number,
    color: number,
    pose?: CharacterPose,
  ): void;
}
