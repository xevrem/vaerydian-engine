import { Engine } from './engine';

import * as PIXI from 'pixi.js';

declare global {
  interface Window {
    engine: Engine;
    PIXI: any;
  }
}

globalThis.PIXI = PIXI;

window.addEventListener('load', async () => {
  console.log('load...');

  const engine: Engine = new Engine();
  window.engine = engine;
  engine.start();
});
