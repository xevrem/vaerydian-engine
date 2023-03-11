import { Animatable } from 'components';
import { EcsInstance } from 'ecsf/EcsInstance';
import { lerp, is_none } from 'utils/helpers';

export function makeAnimationSystem(ecs: EcsInstance) {
  ecs.withSystem(
    ({ query, ecs, delta }) => {
      for (const [animatable] of query.join()) {
        animatable.value.elapsed += delta;
        const percent = animatable.value.elapsed / animatable.value.duration;

        animatable.value.tracks.forEach(track => {
          if (!track) return;
          const currFrame = track.keyFrames
            .filter(frame => animatable.value.elapsed < frame.time)
            .first();

          if (is_none(currFrame)) return;

          const comp = ecs.getComponent(
            animatable.value.target,
            track.component
          );
          if (is_none(comp)) return;

          if (currFrame.property in comp) {
            const field = comp[currFrame.property] as number;
            const update = lerp(field, currFrame.value as number, percent);
            // console.log('upd:', update, field, percent, animatable.value.elapsed);
            Object.add(comp, currFrame.property, update);
	    ecs.update(comp);
          }
        });
        if (animatable.value.elapsed >= animatable.value.duration) {
          if (animatable.value.repeats) {
            animatable.value.elapsed = 0;
          } else {
            const ent = ecs.getEntity(animatable.owner);
            if (ent) ecs.deleteEntity(ent);
          }
        }
      }
    },
    [Animatable]
  );
}
