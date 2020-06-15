import { Application, Point, LoaderResource } from 'pixi.js';
import Stats from 'stats.js';
import { Screen } from './screen';
import { Position, Renderable, Velocity, SpriteRender, Controllable } from '../components';
import { EcsInstance, EntitySystem } from '../ecsf';
import { EntityFactory, PlayerFactory } from '../factories';
import { MovementSystem, InputSystem, RenderSystem } from '../systems';

import playerIdle from 'assets/player/idle.png';
import { SpriteSystem } from '../systems/sprite';
import { KeyboardManager } from '../utils/keyboard';

const assets = [
  {
    url: playerIdle,
    name: 'playerIdle',
  },
];

export class GameScreen extends Screen {
  ecsInstance: EcsInstance;
  app: Application;
  stats: Stats;
  lastTime = 0;

  inputSystem: EntitySystem;
  movementSystem: EntitySystem;
  renderSystem: EntitySystem;
  spriteSystem: EntitySystem;

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

    document.body.append(this.app.view);

    this.ecsInstance = new EcsInstance();

    this.movementSystem = this.ecsInstance.systemManager.setSystem(
      new MovementSystem(),
      new Position(),
      new Velocity()
    );

    this.inputSystem = this.ecsInstance.systemManager.setSystem(
      new InputSystem()
    );

    this.renderSystem = this.ecsInstance.systemManager.setSystem(
      new RenderSystem(this.app),
      new Renderable(),
      new Position()
    );

    this.spriteSystem = this.ecsInstance.systemManager.setSystem(
      new SpriteSystem(this.app),
      new SpriteRender(),
      new Position()
    );

    this.ecsInstance.componentManager.registerComponent(new Controllable());

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

    this.playerFactory.createPlayer(
      resources,
      new Point(this.app.renderer.width / 2, this.app.renderer.height / 2)
    );

    Array(100)
      .fill('')
      .forEach(() => this.entityFactory.createGraphic());

    this.ecsInstance.resolveEntities();
    this.ecsInstance.systemManager.systemsLoadContent();
  }

  unload(): void {}

  update(delta: number) {
    this.ecsInstance.updateByDelta(delta);
    this.ecsInstance.resolveEntities();

    this.movementSystem.processAll();
  }

  focusUpdate(_delta: number) {}

  draw() {
    this.spriteSystem.processAll();
    this.renderSystem.processAll();
  }
}
