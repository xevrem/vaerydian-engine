import { EcsInstance, EntitySystem } from 'ecsf';
import { Application } from 'pixi.js';
import { RenderSystem, MovementSystem } from './systems';
import { Renderable, Position, Velocity } from './components';
import { EntityFactory } from './factories/entity';

export class Engine {
  ecsInstance: EcsInstance;
  app: Application;
  lastTime: number = 0;
  movementSystem: EntitySystem;
  renderSystem: EntitySystem;
  entityFactory: EntityFactory;


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

    // console.log(Renderable, Position);

    this.ecsInstance.systemManager.initializeSystems();

    this.entityFactory = new EntityFactory(this.ecsInstance);
  }

  async load(): Promise<void> {
    console.log('engine loading...');

    Array(50).fill().forEach(()=>this.entityFactory.createGraphic())
    // this.entityFactory.createGraphic();
    // this.entityFactory.createGraphic();
    // this.entityFactory.createGraphic();
    // this.entityFactory.createGraphic();

    this.ecsInstance.resolveEntities();

    this.ecsInstance.systemManager.systemsLoadContent();
  }

  startLoop(): void {
    console.log('engine running...');
    window.requestAnimationFrame(this.run);
  }

  run = (time: number): void => {
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.update(delta/1000);
    this.draw();

    window.requestAnimationFrame(this.run);
  }

  update(delta: number) {
    this.ecsInstance.updateByDelta(delta);
    this.ecsInstance.resolveEntities();

    this.movementSystem.processAll();
  }

  draw() {
    this.renderSystem.processAll();
  }
}
