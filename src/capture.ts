import { createStage } from './render/stage';
import { createDriver } from './render/driver';

// Headless capture entry. Boots the same stage + driver, then exposes a
// deterministic single-frame stepper on window for Playwright to drive. The
// renderer scale comes from ?scale= so low-res preview renders are possible.
const params = new URLSearchParams(location.search);
const scale = Number(params.get('scale') ?? '1') || 1;

const { app, root } = await createStage({ scale });
const driver = createDriver(root);

declare global {
  interface Window {
    __totalFrames: number;
    __renderFrame: (i: number) => Promise<boolean>;
    __ready: boolean;
  }
}

window.__totalFrames = driver.totalFrames;
window.__renderFrame = async (i: number): Promise<boolean> => {
  driver.renderFrame(i);
  app.renderer.render(app.stage);
  // Make sure the GPU has actually flushed before the screenshot is taken.
  const gl = (app.renderer as unknown as { gl?: WebGLRenderingContext }).gl;
  gl?.finish?.();
  return true;
};

// Only signal ready once everything above is wired up (and, in future, after
// any Assets.load(...) completes).
window.__ready = true;
