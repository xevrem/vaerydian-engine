import { Animation, Player, Position, Scene, Rotation } from 'components';
import { EcsInstance } from 'ecsf/EcsInstance';

export function makeAnimationSystem(ecs: EcsInstance) {
  ecs.withSystem(
    ({ query }) => {
      for (const [position, rotation, renderable] of query.join()) {
        renderable.asset.pivot = renderable.pivot;
        renderable.asset.rotation = rotation.value + rotation.offset;
        renderable.asset.position = position.value.toPoint();
      }
    },
    [Position, Rotation, Scene, Player]
  );
}
