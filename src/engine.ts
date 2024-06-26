import Stats from 'stats.js';
// import '@pixi/layers';
// import { Group, Layer, Stage } from '@pixi/layers';
import { Application, Assets } from 'pixi.js';
import { is_none, type Option } from 'onsreo';
import { EcsInstance } from 'ecsf';
import { GameScreen } from './screens/game';
import { ScreenManager } from './screens/manager';
import { LayerType } from './utils/constants';
import { KeyboardManager } from './utils/keyboard';

const FRAME_TARGET_FPS = 60.0;
const FRAME_TARGET_MS: number = 1000.0 / FRAME_TARGET_FPS;

export class Engine {
  assets: typeof Assets;
  app: Application;
  ecs: EcsInstance;
  lastTime = 0;
  screenManager: ScreenManager;
  stats: Stats;
  groups: Map<number, Group> = new Map();
  layers: Record<string, Layer> = {};
  kb!: typeof KeyboardManager;
  targets = {
    FRAME_TARGET_MS,
    FRAME_TARGET_FPS,
  };
  gameLoop: typeof this.runLoop;

  constructor() {
    this.stats = new Stats();
    document.body.append(this.stats.dom);

    const canvas = document.getElementById(
      'canvas',
    ) as Option<HTMLCanvasElement>;
    if (is_none(canvas)) throw new Error('NO CANVAS FOUND');

    const app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: false,
      view: canvas,
      autoStart: false,
    });

    app.stage = new Stage();
    app.stage.sortableChildren = true;
    app.stage.interactive = true;
    app.stage.hitArea = app.screen;

    this.assets = Assets;

    // document.body.append(app.view as any);
    this.app = app;

    this.ecs = new EcsInstance();
    this.screenManager = new ScreenManager();
    this.screenManager.ecs = this.ecs;
    this.kb = KeyboardManager;
    this.kb.init();

    this.gameLoop = this.runLoop.bind(this);
  }

  async start(): Promise<void> {
    Object.entries(LayerType).forEach(([layerName, order]) => {
      const group = new Group(order, true);
      const layer = new Layer(group);
      this.layers[layerName] = layer;
      this.groups.set(order, group);
      this.app.stage.addChild(layer);
    });

    await this.screenManager.addScreen(
      new GameScreen(this.app, this.layers, this.groups),
    );

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
