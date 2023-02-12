import * as PIXI from 'pixi.js';
import '@pixi/layers';
import '@pixi/mixin-cache-as-bitmap';
import { Engine } from './engine';

declare global {
  interface Window {
    engine: Engine;
    PIXI: Record<string, unknown>;
  }
}

window.PIXI = PIXI;

window.addEventListener('load', async () => {
  console.log('load...');

  const engine: Engine = new Engine();
  window.engine = engine;
  engine.start();
});
