import { ComponentMapper, Entity, EntitySystem, EntitySystemArgs, Query } from '../ecsf';
import { Position, Velocity } from '../components';
import { all_some } from 'utils/helpers';

export class MovementSystem extends EntitySystem<
  [typeof Position, typeof Velocity]
> {
  constructor(props: EntitySystemArgs){
    super({
      ...props,
      needed: [Position, Velocity]
    })
  }
  // positionMap: ComponentMapper;
  // velocityMap: ComponentMapper;

  // initialize() {
  //   console.log('movement system initializing...');
  //   this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
  //   this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
  // }

  process(entity: Entity, query: Query<typeof this.needed>, delta: number) {
    // const position = this.positionMap.get(entity) as Position;
    // const velocity = this.velocityMap.get(entity) as Velocity;
    const results = query.retrieve();
    if (!all_some(results)) return;
    const [position, velocity] = results;

    let dx = position.value.x + velocity.vector.x * delta;
    let dy = position.value.y + velocity.vector.y * delta;

    // dx = dx > window.innerWidth ? 0 : dx < 0 ? window.innerWidth : dx;
    // dy = dy > window.innerHeight ? 0 : dy < 0 ? window.innerHeight : dy;

    position.value.set(dx, dy);
  }
}
