import './extensions';
import * as PIXI from 'pixi.js';
import '@pixi/layers';
import { Engine } from './engine';

declare global {
  interface Window {
    engine: Engine;
    PIXI: Record<string, unknown>;
  }
}

window.PIXI = PIXI;

window.addEventListener('load', async () => {
  console.info('load...');

  const engine = new Engine();
  window.engine = engine;
  engine.start();
});
