import { createStage } from './render/stage';
import { createDriver } from './render/driver';
import { FPS } from './engine/types';

// Live preview: runs the EXACT same scene code as the offline renderer, but
// samples it at real speed from a rAF loop (preview = sampling a deterministic
// function; the rendered file = exhaustively sampling it). Keyboard: space to
// pause, ←/→ to scrub one frame, R to restart.
const { app, root } = await createStage({ fitToWindow: true });
const driver = createDriver(root);

let paused = false;
let frame = 0;
let lastTs = performance.now();
let acc = 0;

app.ticker.add(() => {
  const now = performance.now();
  const dt = (now - lastTs) / 1000;
  lastTs = now;
  if (!paused) {
    acc += dt * FPS;
    while (acc >= 1) {
      frame = (frame + 1) % driver.totalFrames;
      acc -= 1;
    }
  }
  driver.renderFrame(frame);
  app.renderer.render(app.stage);
});
app.ticker.start();

addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    paused = !paused;
    e.preventDefault();
  } else if (e.code === 'ArrowRight') {
    paused = true;
    frame = (frame + 1) % driver.totalFrames;
  } else if (e.code === 'ArrowLeft') {
    paused = true;
    frame = (frame - 1 + driver.totalFrames) % driver.totalFrames;
  } else if (e.key.toLowerCase() === 'r') {
    frame = 0;
    acc = 0;
  }
});

// eslint-disable-next-line no-console
console.log(`Toddler TV preview · ${driver.totalFrames} frames · ${driver.totalSec.toFixed(1)}s`);
