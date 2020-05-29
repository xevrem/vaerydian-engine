import { Engine } from "./engine";

window.addEventListener('load', async () => {
  console.log('load...');

  const engine: Engine = new Engine();
  engine.initialize();
  await engine.load();
  engine.startLoop();
});
