import { ComponentTypes, EcsInstance } from 'ecsf';
import { is_none } from 'onsreo';
import { Animatable } from '../components';
import { KeyFrame } from '../utils/animation';
import { lerp } from '../utils/helpers';
import { InstanceValue } from '../types';

export function makeAnimationSystem<CTypes extends ComponentTypes = any>(
  ecs: EcsInstance,
) {
  ecs.withSystem([[Animatable<CTypes>]], ({ query, ecs, delta }) => {
    for (const [[animatable]] of query.join()) {
      animatable.value.elapsed += delta;

      animatable.value.tracks.forEach(track => {
        if (!track) return;
        let prevFrame!: KeyFrame<CTypes[number]>,
          currFrame!: KeyFrame<CTypes[number]>;
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

        const comp = ecs.getComponent(animatable.value.target, track.component);
        if (is_none(comp)) return;
        const startTime = track.startsAt + prevFrame.time;
        const endTime = track.startsAt + currFrame.time;
        const totalTime = endTime - startTime;
        const frameTime = animatable.value.elapsed - startTime;
        const percent = frameTime / totalTime;

        if (track.lerp) {
          if (currFrame.property in comp) {
            const update = lerp(
              prevFrame.asNum(),
              currFrame.asNum(),
              percent,
            ) as InstanceValue<CTypes[number]>;
            comp[currFrame.property] = update;
            ecs.update(comp);
          }
        } else {
          if (currFrame.property in comp) {
            comp[currFrame.property] = currFrame.value;
            ecs.update(comp);
          }
        }
      });
      if (animatable.value.elapsed >= animatable.value.duration) {
        if (animatable.value.repeats) {
          animatable.value.elapsed = 0;
        } else {
          const ent = ecs.getEntity(animatable.owner);
          ent && ecs.deleteEntity(ent);
        }
      }
    }
  });
}
