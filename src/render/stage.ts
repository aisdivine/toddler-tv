import { Application, Container } from 'pixi.js';
import { HEIGHT, WIDTH } from '../engine/types';

export interface Stage {
  app: Application;
  /** Add all scene content under here. Always exactly WIDTH×HEIGHT in size. */
  root: Container;
}

export interface StageOptions {
  /** Where to append the canvas. Defaults to #stage. */
  mount?: HTMLElement;
  /** Live preview letterboxes the fixed canvas into the window; capture does not. */
  fitToWindow?: boolean;
  /** Render scale for fast low-res preview renders (1 = full 1920×1080). */
  scale?: number;
}

// Builds a PixiJS app locked to the master resolution. Determinism essentials:
// fixed width/height, resolution 1, autoDensity off, NO resizeTo, and
// preserveDrawingBuffer so the offline capturer can screenshot the canvas.
export async function createStage(opts: StageOptions = {}): Promise<Stage> {
  const scale = opts.scale ?? 1;
  const app = new Application();
  await app.init({
    width: Math.round(WIDTH * scale),
    height: Math.round(HEIGHT * scale),
    background: 0x0e1530,
    resolution: 1,
    autoDensity: false,
    antialias: true,
    preserveDrawingBuffer: true,
    // Drive rendering ourselves, frame by frame — no shared ticker autoStart.
    autoStart: false,
  });

  const mount = opts.mount ?? document.getElementById('stage')!;
  mount.appendChild(app.canvas);

  // The scene graph is authored at full 1920×1080; for low-res preview renders
  // we just scale the whole root so all the math stays in master coordinates.
  const root = new Container();
  if (scale !== 1) root.scale.set(scale);
  app.stage.addChild(root);

  if (opts.fitToWindow) fitCanvasToWindow(app.canvas as HTMLCanvasElement);

  return { app, root };
}

// CSS-only fit: the backing buffer stays 1920×1080, the canvas is letterboxed
// to the window so the preview looks right on any screen without touching the
// deterministic render size.
export function fitCanvasToWindow(canvas: HTMLCanvasElement): void {
  const apply = () => {
    const sx = window.innerWidth / WIDTH;
    const sy = window.innerHeight / HEIGHT;
    const s = Math.min(sx, sy);
    canvas.style.width = `${WIDTH * s}px`;
    canvas.style.height = `${HEIGHT * s}px`;
  };
  apply();
  window.addEventListener('resize', apply);
}
