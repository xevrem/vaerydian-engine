import { ComponentMapper, Entity, EntitySystem } from '../ecsf';
import { Position, Velocity } from '../components';

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

    let dx = position.point.x + velocity.vector.x * delta;
    let dy = position.point.y + velocity.vector.y * delta;

    dx = dx > window.innerWidth ? 0 : dx < 0 ? window.innerWidth : dx;
    dy = dy > window.innerHeight ? 0 : dy < 0 ? window.innerHeight : dy;

    position.point.set(
      dx,
      dy
    )
  }
}
