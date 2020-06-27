import { Engine } from './engine';

import * as PIXI from 'pixi.js';
import type {} from 'pixi-layers';

globalThis.PIXI = PIXI;
require('pixi-layers');

window.addEventListener('load', async () => {
  console.log('load...');

  const engine: Engine = new Engine();
  engine.start();
});
