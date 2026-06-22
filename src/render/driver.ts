import { Container } from 'pixi.js';
import { buildTimeline, type Timeline } from '../engine/timeline';
import { video } from '../video';

export interface Driver {
  renderFrame(frame: number): void;
  totalFrames: number;
  totalSec: number;
}

// The single shared entry point both the live preview and the headless capturer
// call. It owns scene mount/unmount: each scene gets a fresh Container (so its
// init() runs exactly once) and then redraws purely from the frame's timing.
export function createDriver(stageRoot: Container): Driver {
  const timeline: Timeline = buildTimeline(video.scenes, video.fps);
  let mountedId: string | null = null;
  let sceneRoot = new Container();
  stageRoot.addChild(sceneRoot);

  function renderFrame(frame: number): void {
    const { scene, info } = timeline.at(frame);
    if (scene.id !== mountedId) {
      stageRoot.removeChild(sceneRoot);
      sceneRoot.destroy({ children: true });
      sceneRoot = new Container();
      stageRoot.addChild(sceneRoot);
      scene.init?.(sceneRoot);
      mountedId = scene.id;
    }
    scene.render(sceneRoot, info);
  }

  return { renderFrame, totalFrames: timeline.totalFrames, totalSec: timeline.totalSec };
}
