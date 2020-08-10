import { Application, Point, LoaderResource } from 'pixi.js';
import Stats from 'stats.js';
import { Screen } from './screen';
import {
  Layer,
  Position,
  GraphicsRender,
  Velocity,
  Renderable,
  Controllable,
  Rotation,
  CameraFocus,
  CameraData,
  Starfield,
  Heading,
} from '../components';
import { EcsInstance, EntitySystem } from '../ecsf';
import { EntityFactory, PlayerFactory } from '../factories';
import {
  MovementSystem,
  ControlSystem,
  GraphicsRenderSystem,
  CameraSystem,
  LayeringSystem,
  StarfieldSystem,
  RenderSystem,
} from '../systems';
import { KeyboardManager } from '../utils/keyboard';

import playerShip from 'url:../assets/player/ship.png';
import star1 from 'url:../assets/stars/star1.png';
import star2 from 'url:../assets/stars/star2.png';
import star3 from 'url:../assets/stars/star3.png';
import star4 from 'url:../assets/stars/star4.png';
import star5 from 'url:../assets/stars/star5.png';
import star6 from 'url:../assets/stars/star6.png';
import star7 from 'url:../assets/stars/star7.png';

const assets = [
  {
    url: playerShip,
    name: 'playerShip',
  },
  {
    url: star1,
    name: 'star1',
  },
  {
    url: star2,
    name: 'star2',
  },
  {
    url: star3,
    name: 'star3',
  },
  {
    url: star4,
    name: 'star4',
  },
  {
    url: star5,
    name: 'star5',
  },
  {
    url: star6,
    name: 'star6',
  },
  {
    url: star7,
    name: 'star7',
  },
];

export class GameScreen extends Screen {
  ecsInstance: EcsInstance;
  app: Application;
  stats: Stats;
  lastTime = 0;

  cameraSystem: EntitySystem;
  controlSystem: EntitySystem;
  layeringSystem: EntitySystem;
  movementSystem: EntitySystem;
  graphicsRenderSystem: EntitySystem;
  renderSystem: EntitySystem;
  starfieldSystem: EntitySystem;

  entityFactory: EntityFactory;
  playerFactory: PlayerFactory;

  initialize(): void {
    console.log('game screen initialize...');

    KeyboardManager.init();

    this.app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000,
      antialias: false,
    });

    // Scale mode for all textures, will retain pixelation
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    this.app.stage = new PIXI.display.Stage();

    this.app.ticker.autoStart = false;
    this.app.ticker.stop();

    document.body.append(this.app.view);

    this.ecsInstance = new EcsInstance();

    this.cameraSystem = this.ecsInstance.systemManager.setSystem(
      new CameraSystem(this.app),
      new Position(),
      new CameraFocus()
    );

    this.controlSystem = this.ecsInstance.systemManager.setSystem(
      new ControlSystem(),
      new Controllable(),
      new Velocity(),
      new Rotation()
    );

    this.graphicsRenderSystem = this.ecsInstance.systemManager.setSystem(
      new GraphicsRenderSystem(this.app),
      new GraphicsRender(),
      new Position()
    );

    this.layeringSystem = this.ecsInstance.systemManager.setSystem(
      new LayeringSystem(this.app),
      new Layer()
    );

    this.movementSystem = this.ecsInstance.systemManager.setSystem(
      new MovementSystem(),
      new Position(),
      new Velocity()
    );

    this.renderSystem = this.ecsInstance.systemManager.setSystem(
      new RenderSystem(this.app),
      new Renderable(),
      new Position(),
      new Rotation()
    );

    this.starfieldSystem = this.ecsInstance.systemManager.setSystem(
      new StarfieldSystem(this.app),
      new Position(),
      new Starfield()
    );

    this.ecsInstance.componentManager.registerComponent(new Controllable());
    this.ecsInstance.componentManager.registerComponent(new CameraData());
    this.ecsInstance.componentManager.registerComponent(new Heading());

    this.ecsInstance.systemManager.initializeSystems();

    this.entityFactory = new EntityFactory(this.ecsInstance);
    this.playerFactory = new PlayerFactory(this.ecsInstance);
  }

  async load(): Promise<void> {
    console.log('game screen loading...');

    const resources: Partial<Record<
      string,
      LoaderResource
    >> = await new Promise((res, _rej) => {
      this.app.loader.add(assets).load((_, resources) => {
        console.log('done loading...');
        res(resources);
      });
    });

    this.entityFactory.createCamera();

    this.playerFactory.createPlayer(
      resources,
      new Point(this.app.renderer.width / 2, this.app.renderer.height / 2)
    );

    Array(100)
      .fill('')
      .forEach(() => this.entityFactory.createStar(resources));

    this.ecsInstance.resolveEntities();
    this.ecsInstance.systemManager.systemsLoadContent();
  }

  unload(): void {}

  update(delta: number): void {
    this.ecsInstance.updateByDelta(delta);
    this.ecsInstance.resolveEntities();

    this.movementSystem.processAll();
    this.starfieldSystem.processAll();
  }

  focusUpdate(_delta: number): void {
    this.controlSystem.processAll();
  }

  draw(): void {
    this.renderSystem.processAll();
    this.graphicsRenderSystem.processAll();

    // render scene according to camera position
    this.cameraSystem.processAll();
  }
}
