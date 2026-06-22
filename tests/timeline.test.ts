import { describe, expect, it } from 'vitest';
import { buildTimeline } from '../src/engine/timeline';
import type { Scene } from '../src/engine/types';
import { hash01, makeRng } from '../src/engine/rng';
import { smoothstep, clamp, easeOutBack } from '../src/engine/easing';

const stub = (id: string, durationSec: number): Scene => ({
  id,
  durationSec,
  render() {},
});

describe('buildTimeline', () => {
  const fps = 30;
  const scenes = [stub('a', 2), stub('b', 3), stub('c', 1)];
  const tl = buildTimeline(scenes, fps);

  it('sums durations into total frames', () => {
    expect(tl.totalFrames).toBe((2 + 3 + 1) * fps);
    expect(tl.totalSec).toBeCloseTo(6);
  });

  it('maps frames to the right scene with local timing', () => {
    expect(tl.at(0).scene.id).toBe('a');
    expect(tl.at(0).info.localFrame).toBe(0);
    expect(tl.at(2 * fps).scene.id).toBe('b'); // first frame of b
    expect(tl.at(2 * fps).info.localFrame).toBe(0);
    expect(tl.at(5 * fps).scene.id).toBe('c'); // first frame of c
    expect(tl.at(tl.totalFrames - 1).scene.id).toBe('c'); // last frame
  });

  it('clamps out-of-range frames into the valid span', () => {
    expect(tl.at(-5).scene.id).toBe('a');
    expect(tl.at(99999).scene.id).toBe('c');
  });

  it('reports progress 0..1 within a scene', () => {
    const mid = tl.at(2 * fps + Math.floor((3 * fps) / 2)).info.progress;
    expect(mid).toBeGreaterThan(0.4);
    expect(mid).toBeLessThan(0.6);
  });
});

describe('determinism helpers', () => {
  it('makeRng is reproducible for a seed', () => {
    const a = makeRng(123);
    const b = makeRng(123);
    const seqA = [a(), a(), a()];
    const seqB = [b(), b(), b()];
    expect(seqA).toEqual(seqB);
    expect(seqA[0]).not.toBe(seqA[1]);
  });

  it('hash01 is stateless and stable', () => {
    expect(hash01(7, 2)).toBe(hash01(7, 2));
    expect(hash01(7, 2)).not.toBe(hash01(8, 2));
    expect(hash01(3)).toBeGreaterThanOrEqual(0);
    expect(hash01(3)).toBeLessThan(1);
  });
});

describe('easing', () => {
  it('smoothstep is clamped and monotonic', () => {
    expect(smoothstep(0, 1, -1)).toBe(0);
    expect(smoothstep(0, 1, 2)).toBe(1);
    expect(smoothstep(0, 1, 0.5)).toBeCloseTo(0.5);
  });
  it('clamp bounds values', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
  });
  it('easeOutBack overshoots past 1 before settling', () => {
    expect(easeOutBack(1)).toBeCloseTo(1);
    const peak = Math.max(...Array.from({ length: 20 }, (_, i) => easeOutBack((i + 1) / 20)));
    expect(peak).toBeGreaterThan(1);
  });
});
