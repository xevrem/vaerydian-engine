import { Assets, Texture } from 'pixi.js';
import Stats from 'stats.js';
import { is_none, is_ok, is_some } from 'onsreo';
import { Vector2 } from 'evjkit';
import { QuadTree } from 'fqtree';
import { Screen } from '../screens/screen';
import * as AllComponents from '../components';
import { EntityFactory, PlayerFactory } from '../factories';
import { makeAnimationSystem } from '../systems/animation';
import { makeBehaviorSystem } from '../systems/behavior';
import { makeSpatialSystem } from '../systems/spatial';
import { LayeringSystem } from 'src/systems/layering';
import { StarfieldSystem } from 'src/systems/starfield';
import { ControlSystem } from 'src/systems/control';
import { RenderSystem } from 'src/systems/render';
import { CameraSystem } from 'src/systems/camera';
import { makeMovementSystem } from 'src/systems/movement';
import { create_enemy_ship } from 'src/factories/enemy-ship';

import playerShip from 'src/assets/player/ship.png';
import enemyShip from 'src/assets/enemy/enemy.png';
import star1 from 'src/assets/stars/star1.png';
import star2 from 'src/assets/stars/star2.png';
import star3 from 'src/assets/stars/star3.png';
import star4 from 'src/assets/stars/star4.png';
import star5 from 'src/assets/stars/star5.png';
import star6 from 'src/assets/stars/star6.png';
import star7 from 'src/assets/stars/star7.png';

const assets = [
  {
    src: playerShip,
    name: 'playerShip',
  },
  {
    src: enemyShip,
    name: 'enemyShip',
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
  quadTree!: QuadTree<AllComponents.Spatial>;

  initialize(): void {
    console.log('game screen initialize...');

    // Scale mode for all textures, will retain pixelation
    // settings.SCALE_MODE = SCALE_MODES.NEAREST;

    // Object.values(AllComponents).forEach(value => {
    //   if (isComponent(value)) {
    //     this.ecs.registerComponent(value);
    //   }
    // });
    this.ecs.registerComponents(AllComponents);

    this.ecs.registerSystem(LayeringSystem, {
      groups: this.groups,
      priority: 0,
    });

    this.ecs.registerSystem(StarfieldSystem, {
      app: this.app,
      priority: 1,
    });
    this.ecs.registerSystem(ControlSystem, { priority: 2 });
    this.ecs.registerSystem(RenderSystem, { app: this.app, priority: 3 });

    this.ecs.registerSystem(CameraSystem, {
      app: this.app,
      priority: 5,
    });

    makeMovementSystem(this.ecs);
    // this.ecs.registerSystem(MovementSystem, { priority: 6 });

    makeAnimationSystem(this.ecs);
    this.quadTree = makeSpatialSystem();
    makeBehaviorSystem(this.ecs);

    this.ecs.initializeSystems();

    this.entityFactory = new EntityFactory(this.ecs);
    this.playerFactory = new PlayerFactory(this.ecs);
  }

  async load(): Promise<void> {
    console.info('game screen loading...');

    await Promise.all(
      assets.map(asset => {
        Assets.add(asset);
        return Assets.load<Texture>(asset.name);
      }),
    );

    this.entityFactory.createCamera();

    this.playerFactory.createPlayer(Vector2.zero);

    Array(100)
      .fill('')
      .forEach(() => {
        const ent = this.entityFactory.createStar();
        if (is_ok(ent)) {
          this.entityFactory.createAnim(ent);
        }
      });

    create_enemy_ship(this.ecs, new Vector2(5, 5));
  }

  unload(): void {
    //
  }

  update(_delta: number): void {
    //
  }

  focusUpdate(_delta: number): void {
    //
  }

  draw(_delta: number): void {
    // this.app.render();
    const maybeCamera = this.ecs.getEntityByTag('camera');
    if (!is_some(maybeCamera)) return;
    const maybeData = this.ecs.getComponent(maybeCamera, AllComponents.Scene);
    if (is_none(maybeData)) return;

    // this.app.renderer.render(this.app.stage, {

    //   transform: maybeData.asset.localTransform,
    // });
    this.app.renderer.render({
      container: this.app.stage,
      transform: maybeData.asset.localTransform,
    });
  }
}
