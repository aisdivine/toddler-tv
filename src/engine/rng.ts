// Seeded RNG (mulberry32), copied in spirit from the stronghold sim. Scene code
// must never call Math.random() — any "randomness" comes from here, keyed by a
// fixed seed, so a given frame always produces identical visuals.

export function makeRng(seed: number): () => number {
  let state = seed >>> 0;
  return function next(): number {
    let t = (state = (state + 0x6d2b79f5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Deterministic pseudo-random in [0,1) from two integer keys (no state). */
export function hash01(a: number, b = 0): number {
  let t = (Math.imul(a + 0x6d2b79f5, 0x85ebca6b) ^ Math.imul(b + 0x165667b1, 0xc2b2ae35)) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
