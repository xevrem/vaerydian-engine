import { ComponentMapper, Entity, EntitySystem } from './ecsf';
import { Application } from 'pixi.js';
import { Renderable, Position, Velocity } from './components';

export class MovementSystem extends EntitySystem {
  positionMap: ComponentMapper;
  velocityMap: ComponentMapper;

  initialize() {
    console.log('movement system initializing...');
    this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
    this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
  }

  process(entity: Entity, delta: number) {
    const position = this.positionMap.get(entity) as Position;
    const velocity = this.velocityMap.get(entity) as Velocity;

    let dx = position.point.x + velocity.vector.x * 100 * delta;
    let dy = position.point.y + velocity.vector.y * 100 * delta;

    dx = dx > window.innerWidth ? 0 : dx < 0 ? window.innerWidth : dx;
    dy = dy > window.innerHeight ? 0 : dy < 0 ? window.innerHeight : dy;

    position.point.set(
      dx,
      dy
    )
  }
}

export class RenderSystem extends EntitySystem {
  app: Application;
  renderMap: ComponentMapper;
  positionMap: ComponentMapper;

  constructor(app: Application) {
    super();
    this.app = app;
  }

  initialize() {
    console.log('render system initializing...')
    this.renderMap = new ComponentMapper(new Renderable(), this.ecsInstance);
    this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
  }

  added(entity: Entity) {
    this.app.stage.addChild((<Renderable>this.renderMap.get(entity)).graphics);
  }

  process(entity: Entity) {
    const render = this.renderMap.get(entity) as Renderable;
    const position = this.positionMap.get(entity) as Position;

    render.graphics.position.set(position.point.x, position.point.y);
  }
}
