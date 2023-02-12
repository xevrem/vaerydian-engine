import Stats from 'stats.js';
import '@pixi/layers';
import { Group, Layer, Stage } from '@pixi/layers';
import { Application } from 'pixi.js';
import { GameScreen, ScreenManager } from 'screens';
import { LayerType } from 'utils/constants';
import { KeyboardManager } from 'utils/keyboard';

const FRAME_TARGET_FPS = 30.0;
const FRAME_TARGET_MS: number = 1000.0 / FRAME_TARGET_FPS;

// applyRendererMixin(Renderer);

export class Engine {
  app: Application;
  lastTime = 0;
  screenManager: ScreenManager;
  stats: Stats;
  groups: Record<string, Group> = {};
  layers: Record<string, Layer> = {};
  kb!: typeof KeyboardManager;

  constructor() {
    this.screenManager = new ScreenManager();
    this.kb = KeyboardManager;

    this.stats = new Stats();
    document.body.append(this.stats.dom);

    const app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: false,
    });
    app.stage = new Stage();
    app.stage.sortableChildren = true;
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    document.body.append(app.view as any);
    this.app = app;

    // this.app.stage.sortableChildren = true;
  }

  async start(): Promise<void> {
    Object.entries(LayerType).forEach(([layerName, order]) => {
      const group = new Group(order, false);
      const layer = new Layer(group);
      this.layers[layerName] = layer;
      this.groups[layerName] = group;
      this.app.stage.addChild(layer);
    });

    await this.screenManager.addScreen(
      new GameScreen(this.app, this.layers, this.groups)
    );

    console.log('engine running...');
    // this.timeoutLoop();
    // window.requestAnimationFrame(this.runLoop);
    this.app.ticker.add(this.runLoop);
    // this.app.ticker.start();
    this.app.start();
  }

  runLoop = (time: number): void => {
    // const delta = time - this.lastTime;
    // this.lastTime = time;

    const delta = time / 100;
    this.stats.begin();
    // console.log(time);
    this.update(delta);
    this.draw(delta);
    this.stats.end();

    // window.requestAnimationFrame(this.runLoop);
  };

  timeoutLoop = (): void => {
    window.setTimeout(this.doPreFrame, FRAME_TARGET_MS);
  };

  doPreFrame = (): void => {
    // compute delta time
    const time = performance.now();
    const delta = time - this.lastTime;

    const seconds = delta / 1000;

    this.stats.begin();
    this.update(seconds);
    this.draw(seconds);
    this.stats.end();

    const frameTime = performance.now() - time;
    this.lastTime = time;

    if (frameTime < FRAME_TARGET_MS) {
      window.setTimeout(this.doPreFrame, FRAME_TARGET_MS - frameTime);
    } else {
      // skip the frame calculating time for next frame
      window.setTimeout(
        this.doPreFrame,
        FRAME_TARGET_MS - (frameTime - FRAME_TARGET_MS)
      );
    }
  };

  update(delta: number): void {
    this.screenManager.update(delta);
  }

  draw(delta: number): void {
    this.screenManager.draw(delta);
  }
}
