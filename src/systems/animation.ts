import { Animatable } from 'components';
import { EcsInstance } from 'ecsf/EcsInstance';
import { is_none } from 'utils/helpers';

export function makeAnimationSystem(ecs: EcsInstance) {
  ecs.withSystem(
    ({ query, ecs, delta }) => {
      for (const [animatable] of query.join()) {
        animatable.elapsed += delta;

        const frame = animatable.value.keyFrames
          .filter(frame => delta >= frame.time)
          .last();

        if (is_none(frame)) return;

        const comp = ecs.getComponent(animatable.target, frame.component);
        if (is_none(comp)) return;

        if (frame.property in comp) {
          Object.add(comp, frame.property, frame.value);
        }
      }
    },
    [Animatable]
  );
}
