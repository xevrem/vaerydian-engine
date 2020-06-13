import { Engine } from './engine';

window.addEventListener('load', async () => {
  console.log('load...');

  const engine: Engine = new Engine();
  engine.start();
});
