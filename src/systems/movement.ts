import {
  EcsInstance,
  Entity,
  EntitySystem,
  Query,
} from 'ecsf';
import { Position, Scene, Rotation, Velocity } from 'components';

export class MovementSystem extends EntitySystem<
  any,
  [typeof Position, typeof Velocity]
> {
  process(_entity: Entity, query: Query<typeof this.needed>, delta: number) {
    const results = query.retrieve();
    const [position, velocity] = results;

    // const dx = position.value.x + velocity.vector.x * delta;
    // const dy = position.value.y + velocity.vector.y * delta;
    const newPosition = position.value.add(velocity.vector).multScalar(delta);

    position.value.set(newPosition.x, newPosition.y);
  }
}

export function makeMovementSystem(ecs: EcsInstance) {
  // update rederable container with position and rotation
  ecs.withSystem([Position, Rotation, Scene, Velocity], ({ query }) => {
    for (const [position, rotation, renderable, velocity] of query.join()) {
      const delta = position.value.add(velocity.vector);
      position.value = delta;

      renderable.asset.pivot = renderable.pivot;
      renderable.asset.transform.rotation = rotation.value + rotation.offset;
      renderable.asset.position = position.value.toPoint();
    }
  });
}
