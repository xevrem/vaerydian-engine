import { Bag, ComponentType, ComponentTypes, Entity } from 'ecsf';
import { InstanceKey, InstanceValue } from 'types';

export class KeyFrame<C extends ComponentType> {
  component: C;
  percent: boolean;
  time: number;
  property!: InstanceKey<C>;
  value!: InstanceValue<C>;

  constructor(component: C) {
    this.component = component;
    this.percent = false;
    this.time = 0;
  }

  asNum(): number {
    return this.value as number;
  }
}

export class AnimationTrack<C extends ComponentType> {
  component: C;
  keyFrames: KeyFrame<C>[];
  repeats: boolean;
  duration: number;
  startsAt: number;
  lerp: boolean;

  constructor(component: C) {
    this.component = component;
    this.startsAt = 0;
    this.duration = 0;
    this.keyFrames = [];
    this.repeats = false;
    this.lerp = true;
  }
}

export class Animation<CTypes extends ComponentTypes> {
  duration: number;
  elapsed: number;
  repeats: boolean;
  tracks: Bag<AnimationTrack<CTypes[number]>>;
  target!: Entity;

  constructor() {
    this.elapsed = 0;
    this.duration = 0;
    this.repeats = false;
    this.tracks = new Bag<AnimationTrack<CTypes[number]>>();
  }
}

// export type KeyFrameBuilder<
//   C extends ComponentType,
//   CTypes extends ComponentTypes,
// > = {
// };

export class KeyFrameBuilder<C extends ComponentType> {
  keyFrame: KeyFrame<C>;

  constructor(_component: C) {
    this.keyFrame = new KeyFrame(_component);
  }

  set(property: keyof InstanceType<C>): KeyFrameBuilder<C> {
    this.keyFrame.property = property;
    return this;
  }
  to(value: InstanceValue<C>): KeyFrameBuilder<C> {
    this.keyFrame.value = value;
    return this;
  }
  atTime(time: number): KeyFrameBuilder<C> {
    this.keyFrame.time = time;
    return this;
  }
  atPercent(percent: number): KeyFrameBuilder<C> {
    this.keyFrame.time = percent;
    this.keyFrame.percent = true;
    return this;
  }
  build(): KeyFrame<C> {
    // trackBuilder._addKeyFrame(keyFrame as KeyFrame<C>);
    return this.keyFrame;
  }
}

export class AnimationTrackBuilder<C extends ComponentType> {
  track: AnimationTrack<C>;
  constructor(component: C) {
    this.track = new AnimationTrack(component);
  }

  _addKeyFrame(keyFrame: KeyFrame<C>): void {
    this.track.keyFrames.push(keyFrame);
  }

  duration(seconds: number): AnimationTrackBuilder<C> {
    this.track.duration = seconds;
    return this;
  }

  startsAt(seconds: number): AnimationTrackBuilder<C> {
    this.track.startsAt = seconds;
    return this;
  }

  repeats(): AnimationTrackBuilder<C> {
    this.track.repeats = true;
    return this;
  }

  keyFrame(
    callback: (builder: KeyFrameBuilder<C>) => KeyFrame<C>,
  ): AnimationTrackBuilder<C> {
    const keyFrame = callback(new KeyFrameBuilder<C>(this.track.component));
    this.track.keyFrames.push(keyFrame);
    return this;
  }

  lerp(value: boolean): AnimationTrackBuilder<C> {
    this.track.lerp = value;
    return this;
  }

  build(): AnimationTrack<C> {
    this.track.keyFrames.forEach(keyFrame => {
      if (keyFrame.percent && this.track.duration) {
        keyFrame.time =
          (this.track.startsAt + keyFrame.time) * this.track.duration;
      }
    });
    return this.track;
  }

  // endTrack(): AnimationBuilder<CTypes> {
  //   const track = builder._build();
  //   animationBuilder._addTrack(track);
  //   return animationBuilder;
  // }
}

export class AnimationBuilder<CTypes extends ComponentTypes> {
  components: CTypes;
  animation: Animation<CTypes>; // =  as Animation<CTypes>;

  constructor(components: CTypes) {
    this.components = components;
    this.animation = new Animation();
  }

  _addTrack(track: AnimationTrack<CTypes[number]>) {
    this.animation.tracks.add(track);
  }

  repeats(): AnimationBuilder<CTypes> {
    this.animation.repeats = true;
    return this;
  }
  setTarget(target: Entity): AnimationBuilder<CTypes> {
    this.animation.target = target;
    return this;
  }
  addTrack<Comp extends ComponentType>(
    component: Comp,
    callback: (builder: AnimationTrackBuilder<Comp>) => AnimationTrack<Comp>,
  ): AnimationBuilder<CTypes> {
    const track = callback(new AnimationTrackBuilder(component));
    this.animation.tracks.add(track);
    return this;
  }
  build(): Animation<CTypes> {
    const anim = this.animation;
    const [_minStart, maxTime] = anim.tracks.reduce<[min: number, max: number]>(
      ([minStart, maxTime], track) => {
        if (track) {
          const dur: number = track.startsAt + track.duration;
          return [
            track.startsAt < minStart ? track.duration : minStart,
            dur > maxTime ? dur : maxTime,
          ];
        } else {
          return [minStart, maxTime];
        }
      },
      [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER],
    );
    anim.duration = maxTime;
    return anim;
  }
}

export function animationBuilder<CTypes extends ComponentTypes>(
  components: CTypes,
) {
  return new AnimationBuilder(components);
}
