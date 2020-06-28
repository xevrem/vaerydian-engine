import { Application, Point, LoaderResource } from 'pixi.js';
import Stats from 'stats.js';
import { Screen } from './screen';
import {
  Layer,
  Position,
  GraphicsRender,
  Velocity,
  SpriteRender,
  Controllable,
  Rotation,
  CameraFocus,
  CameraData,
  Starfield,
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
} from '../systems';

import playerShip from 'url:~/src/assets/player/ship.png';

import { SpriteRenderSystem } from '../systems/sprite';
import { KeyboardManager } from '../utils/keyboard';

const assets = [
  {
    url: playerShip,
    name: 'playerShip',
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
  spriteRenderSystem: EntitySystem;
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
    });

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

    this.spriteRenderSystem = this.ecsInstance.systemManager.setSystem(
      new SpriteRenderSystem(this.app),
      new SpriteRender(),
      new Position(),
      new Rotation()
    );

    this.starfieldSystem = this.ecsInstance.systemManager.setSystem(
      new StarfieldSystem(this.app),
      new Position(),
      new GraphicsRender(),
      new Starfield()
    );

    this.ecsInstance.componentManager.registerComponent(new Controllable());
    this.ecsInstance.componentManager.registerComponent(new CameraData());

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
      .forEach(() => this.entityFactory.createStar());

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
    this.spriteRenderSystem.processAll();
    this.graphicsRenderSystem.processAll();

    // render scene according to camera position
    this.cameraSystem.processAll();
  }
}
