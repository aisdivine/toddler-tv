import { clamp, smoothstep } from '../engine/easing';

// Shared facial-animation envelopes. All pure functions of t so characters stay
// deterministic. Voice is added in the editor; these just make mouths/eyes move.

/**
 * Speech-like mouth openness 0..1: bursty syllable flaps grouped into phrases
 * with short pauses between them. Lay your voiceover on top and it reads as
 * talking. `rate` speeds up / slows down the cadence.
 */
export function talkEnvelope(t: number, rate = 1): number {
  const period = 2.6 / rate; // one phrase + pause
  const talkLen = 2.0 / rate; // speaking portion
  const tc = ((t % period) + period) % period;
  if (tc >= talkLen) return 0; // pause between phrases
  const flap = 0.5 + 0.5 * Math.sin(t * 30 * rate); // ~5 flaps/sec
  const syllable = 0.55 + 0.45 * Math.sin(t * 7.3 * rate + 1.0); // amplitude wobble
  const edges = smoothstep(0, 0.15, tc) * smoothstep(talkLen, talkLen - 0.2, tc);
  return clamp(flap * syllable * edges);
}

/** Eye openness 0..1: mostly open with a quick blink every `period` seconds. */
export function blinkEnvelope(t: number, period = 3.4): number {
  const tc = ((t % period) + period) % period;
  const blinkStart = period - 0.16;
  if (tc < blinkStart) return 1;
  const k = (tc - blinkStart) / 0.16;
  return Math.abs(2 * k - 1); // 1 → 0 → 1 (closed mid-blink)
}

/** A convenient "idle alive" pose: bob, glance, blink and (optionally) talk. */
export function idlePose(
  t: number,
  opts: { talk?: boolean; bobPx?: number } = {},
): { talk: number; blink: number; lookX: number; bob: number; earWiggle: number } {
  return {
    talk: opts.talk ? talkEnvelope(t) : 0,
    blink: blinkEnvelope(t),
    lookX: Math.sin(t * 0.7) * 0.6,
    bob: Math.sin(t * 2) * (opts.bobPx ?? 10),
    earWiggle: Math.sin(t * 1.3) * 0.5,
  };
}
