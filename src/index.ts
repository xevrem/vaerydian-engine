import { Engine } from "./engine";

window.addEventListener('load', () => {
  console.log('load...');

  const engine: Engine = new Engine();
  engine.initialize();
  engine.load();
  engine.run();
});
