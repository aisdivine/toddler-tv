// Color helpers. lerpRgb is lifted from stronghold's main.ts; the rest are a
// small bright toddler-friendly palette plus an HSL→RGB walk for backgrounds.

export function lerpRgb(a: number, b: number, t: number): number {
  const ar = (a >> 16) & 255, ag = (a >> 8) & 255, ab = a & 255;
  const br = (b >> 16) & 255, bg = (b >> 8) & 255, bb = b & 255;
  return (
    (Math.round(ar + (br - ar) * t) << 16) |
    (Math.round(ag + (bg - ag) * t) << 8) |
    Math.round(ab + (bb - ab) * t)
  );
}

export function hslToRgb(h: number, s: number, l: number): number {
  h = ((h % 1) + 1) % 1;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  const seg = Math.floor(h * 6);
  if (seg === 0) [r, g, b] = [c, x, 0];
  else if (seg === 1) [r, g, b] = [x, c, 0];
  else if (seg === 2) [r, g, b] = [0, c, x];
  else if (seg === 3) [r, g, b] = [0, x, c];
  else if (seg === 4) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return (
    (Math.round((r + m) * 255) << 16) |
    (Math.round((g + m) * 255) << 8) |
    Math.round((b + m) * 255)
  );
}

// Ten cheerful, high-contrast colors — one per number 1..10.
const NUMBER_COLORS = [
  0xff5d5d, // 1 red
  0xff993d, // 2 orange
  0xffd23d, // 3 yellow
  0x6bd66b, // 4 green
  0x3dc6c6, // 5 teal
  0x4f9dff, // 6 blue
  0x8a6bff, // 7 indigo
  0xd86bff, // 8 violet
  0xff6bc1, // 9 pink
  0xff8f6b, // 10 coral
];

export function numberColor(n: number): number {
  return NUMBER_COLORS[(n - 1) % NUMBER_COLORS.length];
}

/** A softer, lighter variant of a color (for backgrounds / tints). */
export function lighten(color: number, amount = 0.5): number {
  return lerpRgb(color, 0xffffff, amount);
}

/** A darker variant (for outlines / shadows). */
export function darken(color: number, amount = 0.35): number {
  return lerpRgb(color, 0x000000, amount);
}
