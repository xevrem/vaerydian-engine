import { EcsInstance } from 'ecsf';
import { Behavior } from '../components';

export function makeBehaviorSystem(ecs: EcsInstance) {
  ecs.withSystem(
    [[Behavior<EcsInstance, any>]],
    ({ query, ecs, delta: _delta }) => {
      for (const [[behavior]] of query.join()) {
        behavior.value.behave(ecs);
      }
    },
  );
}
