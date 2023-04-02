import { Animatable } from 'components';
import { EcsInstance } from 'ecsf/EcsInstance';
import { KeyFrame } from 'utils/animation';
import { lerp, is_none } from 'utils/helpers';

export function makeAnimationSystem(ecs: EcsInstance) {
  ecs.withSystem(
    ({ query, ecs, delta }) => {
      for (const [animatable] of query.join()) {
        animatable.value.elapsed += delta;
        const percent = animatable.value.elapsed / animatable.value.duration;

        animatable.value.tracks.forEach(track => {
          if (!track) return;
          let prevFrame!: KeyFrame<typeof track.component>,
            currFrame!: KeyFrame<typeof track.component>;
          track.keyFrames.forEach(frame => {
            if (animatable.value.elapsed > track.startsAt + frame.time) {
              prevFrame = frame;
              return;
            }
            if (
              !currFrame &&
              animatable.value.elapsed <= track.startsAt + frame.time
            ) {
              currFrame = frame;
              return;
            }
          });

          if (is_none(currFrame)) currFrame = prevFrame;
          if (is_none(prevFrame)) prevFrame = currFrame;

          const comp = ecs.getComponent(
            animatable.value.target,
            track.component
          );
          if (is_none(comp)) return;

          if (currFrame.property in comp) {
            //const field = comp[currFrame.property] as number;
            const update = lerp(
              prevFrame.value as number,
              currFrame.value as number,
              percent
            );
            console.log('upd:', update, prevFrame.value, currFrame.value, percent, animatable, delta);//, animatable.value.elapsed);
            Object.add(comp, currFrame.property, update);
            ecs.update(comp);
          }
        });
        if (
          animatable.value.elapsed >= animatable.value.duration &&
          animatable.value.repeats
        ) {
          animatable.value.elapsed = 0;
        } else {
          const ent = ecs.getEntity(animatable.owner);
          ent && ecs.deleteEntity(ent);
        }
      }
    },
    [Animatable]
  );
}
