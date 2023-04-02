import {
  EcsInstance,
  Entity,
  EntitySystem,
  EntitySystemArgs,
  Query,
} from 'ecsf';
import {
  Position,
  Scene,
  Rotation,
  Velocity,
} from 'components';

export class MovementSystem extends EntitySystem<
  [typeof Position, typeof Velocity]
> {
  constructor(props: EntitySystemArgs) {
    super({
      ...props,
      needed: [Position, Velocity],
    });
  }

  process(_entity: Entity, query: Query<typeof this.needed>, delta: number) {
    const results = query.retrieve();
    const [position, velocity] = results;

    let dx = position.value.x + velocity.vector.x * delta;
    let dy = position.value.y + velocity.vector.y * delta;

    position.value.set(dx, dy);
  }
}

export function makeMovementSystem(ecs: EcsInstance) {
  // update rederable container with position and rotation
  ecs.withSystem(
    ({ query }) => {
      for (const [position, rotation, renderable, velocity] of query.join()) {
        const delta = position.value.add(velocity.vector);
        position.value = delta;

        renderable.asset.pivot = renderable.pivot;
        renderable.asset.transform.rotation = rotation.value + rotation.offset;
        renderable.asset.position = position.value.toPoint();
      }
    },
    [Position, Rotation, Scene, Velocity]
  );
}
