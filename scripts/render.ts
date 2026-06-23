import { chromium } from 'playwright';
import { createServer, type ViteDevServer } from 'vite';
import { existsSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { FPS, WIDTH, HEIGHT } from '../src/engine/types';

// Offline frame capturer. Serves the project with Vite (no build step needed),
// opens capture.html in headless Chromium, then steps the deterministic frame
// function one frame at a time and screenshots the canvas to a PNG sequence.
//
// Flags:
//   --seconds N   render only the first N seconds (fast smoke renders)
//   --scale S     render at S× resolution (e.g. 0.5 → 960×540, much faster)
//   --out DIR     frames output directory (default out/frames)
//   --resume      keep existing frames and skip ones already on disk
//   --force       (default) clear the frames dir first

interface Args {
  seconds?: number;
  from?: number; // start offset in seconds (for fast iteration on one window)
  scale: number;
  out: string;
  resume: boolean;
}

function parseArgs(argv: string[]): Args {
  const a: Args = { scale: 1, out: 'out/frames', resume: false };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--seconds') a.seconds = Number(argv[++i]);
    else if (k === '--from') a.from = Number(argv[++i]);
    else if (k === '--scale') a.scale = Number(argv[++i]);
    else if (k === '--out') a.out = argv[++i];
    else if (k === '--resume') a.resume = true;
  }
  return a;
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const outDir = args.out;

  if (!args.resume && existsSync(outDir)) rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  const server: ViteDevServer = await createServer({
    server: { host: '127.0.0.1', port: 0 },
    logLevel: 'warn',
  });
  await server.listen();
  const base = server.resolvedUrls?.local?.[0];
  if (!base) throw new Error('Vite did not report a local URL');

  const w = Math.round(WIDTH * args.scale);
  const h = Math.round(HEIGHT * args.scale);

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    deviceScaleFactor: 1,
  });
  page.on('pageerror', (e) => console.error('[page error]', e.message));
  page.on('console', (m) => {
    const type = m.type();
    if (type === 'error' || type === 'warning') console.error(`[browser ${type}]`, m.text());
  });

  await page.goto(`${base}capture.html?scale=${args.scale}`);
  await page.waitForFunction('window.__ready === true', undefined, { timeout: 30000 });

  const total: number = await page.evaluate('window.__totalFrames');
  const startFrame = args.from ? Math.min(total - 1, Math.round(args.from * FPS)) : 0;
  const count = args.seconds ? Math.round(args.seconds * FPS) : total - startFrame;
  const limit = Math.min(total, startFrame + count);
  console.log(
    `Rendering frames ${startFrame}..${limit - 1} of ${total} at ${w}×${h} ` +
      `(${((limit - startFrame) / FPS).toFixed(1)}s) → ${outDir}`,
  );

  const canvas = page.locator('#stage canvas');
  const t0 = Date.now();
  for (let i = startFrame; i < limit; i++) {
    const path = join(outDir, `f_${String(i).padStart(6, '0')}.png`);
    if (args.resume && existsSync(path)) continue;
    await page.evaluate((n) => window.__renderFrame(n), i);
    await canvas.screenshot({ path });
    if (i % 60 === 0 || i === limit - 1) {
      const done = i - startFrame + 1;
      const fps = done / ((Date.now() - t0) / 1000);
      const eta = ((limit - i - 1) / Math.max(fps, 0.01)).toFixed(0);
      console.log(`  frame ${i + 1}/${limit}  (${fps.toFixed(1)} fps, ~${eta}s left)`);
    }
  }

  await browser.close();
  await server.close();
  const written = readdirSync(outDir).filter((f) => f.endsWith('.png')).length;
  console.log(`Done. ${written} PNG frames in ${outDir}. Now run: npm run encode`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
