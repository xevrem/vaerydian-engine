import * as PIXI from 'pixi.js';
import { Engine } from './engine';

declare global {
  interface Window {
    engine: Engine;
    PIXI: Record<string, unknown>;
  }
}

globalThis.PIXI = PIXI;

window.addEventListener('load', async () => {
  console.log('load...');

  const engine: Engine = new Engine();
  window.engine = engine;
  engine.start();
});
