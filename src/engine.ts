import Stats from 'stats.js';
// import '@pixi/layers';
// import { Group, Layer, Stage } from '@pixi/layers';
import { Application, Assets, IRenderLayer, RenderLayer } from 'pixi.js';
import { is_none, type Option } from 'onsreo';
import { EcsInstance } from 'ecsf';
import { GameScreen } from './screens/game';
import { ScreenManager } from './screens/manager';
import { LayerType } from './utils/constants';
import { KeyboardManager } from './utils/keyboard';

const FRAME_TARGET_FPS = 60.0;
const FRAME_TARGET_MS: number = 1000.0 / FRAME_TARGET_FPS;

export class Engine {
  assets!: typeof Assets;
  app!: Application;
  ecs!: EcsInstance;
  lastTime = 0;
  screenManager!: ScreenManager;
  stats!: Stats;
  groups: Map<number, IRenderLayer> = new Map();
  // layers: Record<string, IRenderLayer> = {};
  kb!: typeof KeyboardManager;
  targets = {
    FRAME_TARGET_MS,
    FRAME_TARGET_FPS,
  };
  gameLoop!: typeof this.runLoop;

  // constructor() {
  // }

  async init(): Promise<void> {
    this.stats = new Stats();
    document.body.append(this.stats.dom);

    const app = new Application();

    // document.body.append(app.view as any);
    this.app = app;
    this.ecs = new EcsInstance();
    this.screenManager = new ScreenManager();

    const canvas = document.getElementById(
      'canvas',
    ) as Option<HTMLCanvasElement>;
    if (is_none(canvas)) throw new Error('NO CANVAS FOUND');

    await app.init({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: false,
      canvas: canvas,
      autoStart: false,
      preference: 'webgpu',
    });

    // app.stage = new Stage();
    app.stage.sortableChildren = true;
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    this.assets = Assets;

    this.screenManager.ecs = this.ecs;
    this.kb = KeyboardManager;
    this.kb.init();

    this.gameLoop = this.runLoop.bind(this);
  }

  async start(): Promise<void> {
    Object.entries(LayerType).forEach(([layerName, order]) => {
      // const group = new Group(order, true);
      const layer = new RenderLayer();
      // this.layers[layerName] = layer;
      this.groups.set(order, layer);
      this.app.stage.addChild(layer);
    });

    await this.screenManager.addScreen(new GameScreen(this.app, this.groups));

    console.info('engine running...');
    window.requestAnimationFrame(this.gameLoop);
  }

  runLoop(time: number): void {
    this.update(time);
    this.draw(time);
    this.stats.end();
    this.stats.begin();

    window.requestAnimationFrame(this.gameLoop);
  }

  update(time: number): void {
    this.screenManager.update(time);
  }

  draw(time: number): void {
    this.screenManager.draw(time);
  }
}
