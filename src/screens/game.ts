import {
  Application,
  Point,
  LoaderResource,
  settings,
  SCALE_MODES,
} from 'pixi.js';
import Stats from 'stats.js';
import { Screen } from '../screens/screen';
import {
  Layers,
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
  Animatable,
} from '../components';
import {
  EcsInstance,
  EntitySystem,
} from '../ecsf';
import { EntityFactory, PlayerFactory } from '../factories';
import {
  AnimationSystem,
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
import { Stage } from '@pixi/layers';

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
  ecs!: EcsInstance;
  app!: Application;
  stats!: Stats;
  lastTime = 0;

  animationSystem!: EntitySystem;
  cameraSystem!: EntitySystem;
  controlSystem!: EntitySystem;
  layeringSystem!: EntitySystem;
  movementSystem!: EntitySystem;
  graphicsRenderSystem!: EntitySystem;
  renderSystem!: EntitySystem;
  starfieldSystem!: EntitySystem;

  entityFactory!: EntityFactory;
  playerFactory!: PlayerFactory;

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
    settings.SCALE_MODE = SCALE_MODES.NEAREST;

    this.app.stage = new Stage();

    this.app.ticker.autoStart = false;
    this.app.ticker.stop();

    document.body.append(this.app.view);

    this.ecs = new EcsInstance();

    this.cameraSystem = this.ecs.systemManager.setSystem(
      new CameraSystem(this.app),
      Position,
      CameraFocus
    );

    this.controlSystem = this.ecs.systemManager.setSystem(
      new ControlSystem(),
      Controllable,
      Velocity,
      Rotation
    );

    this.graphicsRenderSystem = this.ecs.systemManager.setSystem(
      new GraphicsRenderSystem(this.app),
      GraphicsRender,
      Position
    );

    this.layeringSystem = this.ecs.systemManager.setSystem(
      new LayeringSystem(this.app),
      Layers
    );

    this.movementSystem = this.ecs.systemManager.setSystem(
      new MovementSystem(),
      Position,
      Velocity
    );

    this.renderSystem = this.ecs.systemManager.setSystem(
      new RenderSystem(this.app),
      Renderable,
      Position,
      Rotation
    );

    this.starfieldSystem = this.ecs.systemManager.setSystem(
      new StarfieldSystem(this.app),
      Position,
      Starfield
    );

    this.animationSystem = this.ecs.systemManager.setSystem(
      new AnimationSystem(),
      Animatable
    );

    this.ecs.componentManager.registerComponent(Controllable);
    this.ecs.componentManager.registerComponent(CameraData);
    this.ecs.componentManager.registerComponent(Heading);

    this.ecs.systemManager.initializeSystems();

    this.entityFactory = new EntityFactory(this.ecs);
    this.playerFactory = new PlayerFactory(this.ecs);
  }

  async load(): Promise<void> {
    console.log('game screen loading...');

    const resources: Partial<Record<string, LoaderResource>> =
      await new Promise(res => {
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

    this.ecs.resolveEntities();
    this.ecs.systemManager.systemsLoadContent();

    this.ecs.withSystem(
      (query, ecs) => {
        for (const [position , velocity] of query.join()) {
          const dx = position.point.x + velocity.vector.x * ecs.delta;
          const dy = position.point.y + velocity.vector.y * ecs.delta;
          position.point.set(dx, dy);
        }
      },
      [Position, Velocity]
    );
  }

  unload(): void {
    //
  }

  update(delta: number): void {
    this.ecs.updateByDelta(delta);
    this.ecs.resolveEntities();

    this.ecs.runQuerySystems();
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
