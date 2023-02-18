import {
  Container,
  Graphics,
  Point,
  SCALE_MODES,
  settings,
  Texture,
} from 'pixi.js';
import { Assets } from '@pixi/assets';
import Stats from 'stats.js';
import { Screen } from 'screens/screen';
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
} from 'components';
import { EcsInstance, EntitySystem } from 'ecsf';
import { EntityFactory, PlayerFactory } from 'factories';
import {
  AnimationSystem,
  MovementSystem,
  ControlSystem,
  GraphicsRenderSystem,
  CameraSystem,
  LayeringSystem,
  StarfieldSystem,
  RenderSystem,
} from 'systems';
import { KeyboardManager } from 'utils/keyboard';

import playerShip from 'assets/player/ship.png';
import star1 from 'assets/stars/star1.png';
import star2 from 'assets/stars/star2.png';
import star3 from 'assets/stars/star3.png';
import star4 from 'assets/stars/star4.png';
import star5 from 'assets/stars/star5.png';
import star6 from 'assets/stars/star6.png';
import star7 from 'assets/stars/star7.png';

const assets = [
  {
    src: playerShip,
    name: 'playerShip',
  },
  {
    src: star1,
    name: 'star1',
  },
  {
    src: star2,
    name: 'star2',
  },
  {
    src: star3,
    name: 'star3',
  },
  {
    src: star4,
    name: 'star4',
  },
  {
    src: star5,
    name: 'star5',
  },
  {
    src: star6,
    name: 'star6',
  },
  {
    src: star7,
    name: 'star7',
  },
];

export class GameScreen extends Screen {
  ecs!: EcsInstance;
  assets!: typeof Assets;
  stats!: Stats;
  lastTime = 0;

  // animationSystem!: EntitySystem;
  // cameraSystem!: EntitySystem;
  // controlSystem!: EntitySystem;
  // layeringSystem!: EntitySystem;
  // movementSystem!: EntitySystem;
  // graphicsRenderSystem!: EntitySystem;
  // renderSystem!: EntitySystem;
  // starfieldSystem!: EntitySystem;

  entityFactory!: EntityFactory;
  playerFactory!: PlayerFactory;

  initialize(): void {
    console.log('game screen initialize...');

    KeyboardManager.init();

    // Scale mode for all textures, will retain pixelation
    settings.SCALE_MODE = SCALE_MODES.NEAREST;

    // this.app.stage = new Stage();
    // this.app.ticker.autoStart = false;
    // this.app.ticker.stop();

    this.ecs = new EcsInstance();

    this.ecs.systemManager.registerSystem(
      CameraSystem,
      {
        app: this.app,
      }
      // Position,
      // CameraFocus
    );

    this.ecs.systemManager.registerSystem(
      ControlSystem,
      // Controllable,
      // Velocity,
      // Rotation
    );

    this.graphicsRenderSystem = this.ecs.systemManager.setSystem(
      new GraphicsRenderSystem(this.app),
      GraphicsRender,
      Position
    );

    this.layeringSystem = this.ecs.systemManager.setSystem(
      new LayeringSystem(this.groups),
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

    const resources = await Promise.all(
      assets.map(asset => {
        Assets.add(asset.name, asset.src);
        return Assets.load<Texture>(asset.name);
      })
    );
    console.log({ resources });

    this.entityFactory.createCamera();

    this.playerFactory.createPlayer(
      new Point(this.app.renderer.width / 2, this.app.renderer.height / 2)
    );

    Array(100)
      .fill('')
      .forEach(() => this.entityFactory.createStar());

    this.ecs.resolveEntities();
    this.ecs.systemManager.systemsLoadContent();

    this.ecs.withSystem(
      (query, ecs) => {
        for (const [position, velocity] of query.join()) {
          const dx = position.point.x + velocity.vector.x * ecs.delta;
          const dy = position.point.y + velocity.vector.y * ecs.delta;
          position.point.set(dx, dy);
        }
      },
      [Position, Velocity]
    );

    const graphic = new Graphics();
    graphic
      .clear()
      .lineStyle({
        color: 0xff5555,
        width: 10,
      })
      .drawCircle(200, 200, 100);
    graphic.cacheAsBitmap = true;
    const cont = new Container();
    cont.addChild(graphic);

    this.app.stage.addChild(cont);
  }

  unload(): void {
    //
  }

  /**
   * @param {number} delta - data
   * @return {void}
   */
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
