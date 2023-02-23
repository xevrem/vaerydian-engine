import { Container, Graphics, SCALE_MODES, settings, Texture } from 'pixi.js';
import { Assets } from '@pixi/assets';
import Stats from 'stats.js';
import { Screen } from 'screens/screen';
import * as AllComponents from 'components';
import { isComponent } from 'ecsf';
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

import playerShip from 'assets/player/ship.png';
import star1 from 'assets/stars/star1.png';
import star2 from 'assets/stars/star2.png';
import star3 from 'assets/stars/star3.png';
import star4 from 'assets/stars/star4.png';
import star5 from 'assets/stars/star5.png';
import star6 from 'assets/stars/star6.png';
import star7 from 'assets/stars/star7.png';
import { LayerType } from 'utils/constants';
import { Vector2 } from 'utils/vector';

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
  stats!: Stats;
  lastTime = 0;

  entityFactory!: EntityFactory;
  playerFactory!: PlayerFactory;

  initialize(): void {
    console.log('game screen initialize...');

    // Scale mode for all textures, will retain pixelation
    settings.SCALE_MODE = SCALE_MODES.NEAREST;

    this.ecs.registerSystem(CameraSystem, {
      app: this.app,
      priority: 5,
    });

    this.ecs.registerSystem(ControlSystem, { priority: 2 });

    this.ecs.registerSystem(GraphicsRenderSystem, {
      app: this.app,
      priority: 4,
    });

    this.ecs.registerSystem(LayeringSystem, {
      groups: this.groups,
      priority: 0,
    });

    // this.ecs.registerSystem(MovementSystem, {});

    this.ecs.registerSystem(RenderSystem, { app: this.app, priority: 3 });

    this.ecs.registerSystem(StarfieldSystem, { app: this.app, priority: 1 });

    // this.ecs.registerSystem(AnimationSystem, {});

    Object.values(AllComponents).forEach(value => {
      if (isComponent(value)) {
        this.ecs.registerComponent(value);
      }
    });

    this.ecs.initializeSystems();

    this.entityFactory = new EntityFactory(this.ecs);
    this.playerFactory = new PlayerFactory(this.ecs);
  }

  async load(): Promise<void> {
    console.info('game screen loading...');

    const resources = await Promise.all(
      assets.map(asset => {
        Assets.add(asset.name, asset.src);
        return Assets.load<Texture>(asset.name);
      })
    );
    console.info('gs:l::', { resources });

    this.entityFactory.createCamera();

    this.playerFactory.createPlayer(Vector2.zero);

    Array(100)
      .fill('')
      .forEach(() => this.entityFactory.createStar());

    this.ecs.initialResolve();
    this.ecs.loadSystems();
    this.ecs.initialCreate();

    // movement system
    this.ecs.withSystem(
      (query, ecs) => {
        for (const [position, velocity] of query.join()) {
          const delta = position.point.add(velocity.vector);
          position.point = delta;
        }
      },
      [AllComponents.Position, AllComponents.Velocity]
    );

    // positioning and rotation
    this.ecs.withSystem(
      (query, ecs) => {
        for (const [position, rotation, renderable] of query.join()) {
          renderable.container.pivot = renderable.pivot;
          renderable.container.rotation = rotation.amount + rotation.offset;
          renderable.container.position = position.point.toPoint();
        }
      },
      [
        AllComponents.Position,
        AllComponents.Rotation,
        AllComponents.Renderable,
        AllComponents.Player,
      ]
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
    cont.parentGroup = this.groups[LayerType.sprites];

    this.app.stage.addChild(cont);

    this.ecs.scheduleSystems();
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
    this.ecs.runSystems();
  }

  focusUpdate(_delta: number): void {
    // this.controlSystem.processAll();
  }

  draw(): void {
    // this.renderSystem.processAll();
    // this.graphicsRenderSystem.processAll();
    // render scene according to camera position
    // this.cameraSystem.processAll();
  }
}
