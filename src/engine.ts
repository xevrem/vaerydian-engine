import { EcsInstance, EntitySystem } from './ecsf';
import { Application } from 'pixi.js';
import { RenderSystem, MovementSystem } from './systems';
import { Renderable, Position, Velocity } from './components';
import { EntityFactory } from './factories';
import Stats from 'stats.js';

const FRAME_TARGET: number = 1000 / 30;

export class Engine {
  ecsInstance: EcsInstance;
  app: Application;
  lastTime = 0;
  movementSystem: EntitySystem;
  renderSystem: EntitySystem;
  entityFactory: EntityFactory;
  stats: Stats;


  initialize(): void {
    console.log('engine initialize...');

    this.app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0x000000
    });

    document.body.append(this.app.view);

    this.ecsInstance = new EcsInstance();

    this.movementSystem = this.ecsInstance.systemManager.setSystem(
      new MovementSystem(),
      new Position(),
      new Velocity()
    )

    this.renderSystem = this.ecsInstance.systemManager.setSystem(
      new RenderSystem(this.app),
      new Renderable(),
      new Position()
    )

    this.ecsInstance.systemManager.initializeSystems();

    this.entityFactory = new EntityFactory(this.ecsInstance);

    this.stats = new Stats();
    document.body.append(this.stats.dom);
  }

  async load(): Promise<void> {
    console.log('engine loading...');

    Array(100).fill('').forEach(() => this.entityFactory.createGraphic())

    this.ecsInstance.resolveEntities();

    this.ecsInstance.systemManager.systemsLoadContent();
  }

  startLoop(): void {
    console.log('engine running...');
    this.timeoutRun();
    // window.requestAnimationFrame(this.run);
  }

  run = (time: number): void => {
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.stats.begin();
    this.update(delta / 1000);
    this.draw();
    this.stats.end();

    window.requestAnimationFrame(this.run);
  }

  timeoutRun = (): void => {
    window.setTimeout(this.doPreFrame, FRAME_TARGET);
  };

  doPreFrame = (): void => {
    // compute delta time
    let time = performance.now();
    let delta = time - this.lastTime;

    this.stats.begin();
    this.update(delta/1000);
    this.draw();
    this.stats.end();

    let frameTime = performance.now() - time;
    this.lastTime = time;

    if (frameTime < FRAME_TARGET) {
      window.setTimeout(this.doPreFrame, FRAME_TARGET - frameTime);
    } else {
      // skip the frame calculating time for next frame
      window.setTimeout(this.doPreFrame, FRAME_TARGET - (frameTime - FRAME_TARGET));
    }
  };

  update(delta: number) {
    this.ecsInstance.updateByDelta(delta);
    this.ecsInstance.resolveEntities();

    this.movementSystem.processAll();
  }

  draw() {
    this.renderSystem.processAll();
  }
}
