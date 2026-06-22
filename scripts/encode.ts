import { spawn } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { FPS } from '../src/engine/types';

// Encodes the PNG frame sequence into a silent, editor-friendly H.264 mp4 — or,
// with --mux, layers your own music track onto an already-encoded mp4.
//
// Encode:  npm run encode [-- --name counting] [--frames out/frames] [--crf 18]
// Mux:     npm run mux -- path/to/music.mp3 [--name counting]

function run(cmd: string, cmdArgs: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`$ ${cmd} ${cmdArgs.join(' ')}`);
    const p = spawn(cmd, cmdArgs, { stdio: 'inherit' });
    p.on('error', reject);
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

function flag(argv: string[], name: string, def?: string): string | undefined {
  const i = argv.indexOf(name);
  return i >= 0 ? argv[i + 1] : def;
}

async function encode(argv: string[]): Promise<void> {
  const name = flag(argv, '--name', 'counting')!;
  const frames = flag(argv, '--frames', 'out/frames')!;
  const crf = flag(argv, '--crf', '18')!;
  if (!existsSync(frames) || readdirSync(frames).filter((f) => f.endsWith('.png')).length === 0) {
    throw new Error(`No PNG frames in ${frames}. Run "npm run render" first.`);
  }
  const out = `out/${name}.mp4`;
  await run('ffmpeg', [
    '-y',
    '-framerate', String(FPS),
    '-i', `${frames}/f_%06d.png`,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-crf', crf,
    '-preset', 'slow',
    '-movflags', '+faststart',
    out,
  ]);
  console.log(`\n✅ Wrote ${out} (silent). Drop it into your editor and add music.`);
}

async function mux(argv: string[]): Promise<void> {
  const name = flag(argv, '--name', 'counting')!;
  const music = argv.find((a) => !a.startsWith('--') && /\.(mp3|m4a|aac|wav)$/i.test(a));
  if (!music) throw new Error('Usage: npm run mux -- path/to/music.mp3');
  const video = `out/${name}.mp4`;
  if (!existsSync(video)) throw new Error(`${video} not found. Run "npm run encode" first.`);
  const out = `out/${name}_music.mp4`;
  await run('ffmpeg', [
    '-y',
    '-i', video,
    '-i', music,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    out,
  ]);
  console.log(`\n✅ Wrote ${out} with your music track.`);
}

const argv = process.argv.slice(2);
(argv.includes('--mux') ? mux(argv) : encode(argv)).catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
