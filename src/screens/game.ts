import { Application } from 'pixi.js';
import Stats from 'stats.js';

import { Screen } from './screen';
import { Position, Renderable, Velocity } from '../components';
import { EcsInstance, EntitySystem } from '../ecsf';
import { EntityFactory } from '../factories';
import { MovementSystem, RenderSystem, InputSystem } from '../systems';

export class GameScreen extends Screen {
  ecsInstance: EcsInstance;
  app: Application;
  lastTime = 0;
  movementSystem: EntitySystem;
  inputSystem: EntitySystem;
  renderSystem: EntitySystem;
  entityFactory: EntityFactory;
  stats: Stats;

  initialize(): void {
    console.log('game screen initialize...');

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

    this.ecsInstance.systemManager.initializeSystems();

    this.entityFactory = new EntityFactory(this.ecsInstance);
  }

  async load(): Promise<void> {
    console.log('game screen loading...');

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
    this.renderSystem.processAll();
  }
}
