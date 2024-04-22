import { EcsInstance, Entity, EntitySystem, Query } from 'ecsf';
import { Position, Scene, Rotation, Velocity } from '../components';

type Needed = [typeof Position, typeof Rotation, typeof Scene, typeof Velocity];

export class MovementSystem extends EntitySystem<any, Needed> {
  needed = [Position, Rotation, Scene, Velocity] as Needed;
  process(_entity: Entity, query: Query<Needed>, _delta: number) {
    const results = query.retrieve();
    const [position, rotation, scene, velocity] = results;
    const delta = position.value.add(velocity.vector);
    position.value = delta;
    scene.asset.pivot = scene.pivot;
    scene.asset.transform.rotation = rotation.value + rotation.offset;
    scene.asset.position.set(position.value.x, position.value.y);
  }
}

export function makeMovementSystem(ecs: EcsInstance) {
  // update rederable container with position and rotation
  ecs.withSystem([[Position, Rotation, Scene, Velocity]], ({ query }) => {
    for (const [
      [position, rotation, scene, velocity],
      _ent,
    ] of query.join()) {
      const delta = position.value.add(velocity.vector);
      position.value = delta;

      scene.asset.pivot = scene.pivot;
      scene.asset.transform.rotation = rotation.value + rotation.offset;
      scene.asset.position.set(position.value.x, position.value.y);
    }
  });
}
