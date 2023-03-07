import { Bag } from 'ecsf/Bag';
import { Entity } from 'ecsf/Entity';
import { InstanceKey, InstanceOf, InstanceValue } from 'types/common';
import { ComponentType, ComponentTypes } from 'types/ecs';
import { is_some } from './helpers';

export type KeyFrame<C extends ComponentType> = {
  percent: boolean;
  property: InstanceKey<C>;
  time: number;
  value: InstanceValue<C>;
};

export type AnimationTrack<C extends ComponentType> = {
  component: C;
  keyFrames: KeyFrame<C>[];
  repeats: boolean;
  duration: number;
};

export type Animation<CTypes extends ComponentTypes> = {
  target: Entity;
  elapsed: number;
  tracks: Bag<AnimationTrack<CTypes[number]>>;
};

export type KeyFrameBuilder<
  C extends ComponentType,
  CTypes extends ComponentTypes
> = {
  set(property: keyof InstanceOf<C>): KeyFrameBuilder<C, CTypes>;
  to(value: InstanceValue<C>): KeyFrameBuilder<C, CTypes>;
  atTime(time: number): KeyFrameBuilder<C, CTypes>;
  atPercent(percent: number): KeyFrameBuilder<C, CTypes>;
  insert(): AnimationTrackBuilder<C, CTypes>;
};

export type AnimationTrackBuilder<
  C extends ComponentType,
  CTypes extends ComponentTypes
> = {
  _addKeyFrame(keyFrame: KeyFrame<C>): void;
  duration(seconds: number): AnimationTrackBuilder<C, CTypes>;
  repeats(): AnimationTrackBuilder<C, CTypes>;
  keyFrame(): KeyFrameBuilder<C, CTypes>;
  _build(): AnimationTrack<C>;
  endTrack(): AnimationBuilder<CTypes>;
};

export type AnimationBuilder<CTypes extends ComponentTypes> = {
  _addTrack(track: AnimationTrack<CTypes[number]>): void;
  setTarget(target: Entity): AnimationBuilder<CTypes>;
  addTrack<Comp extends ComponentType>(
    component: Comp
  ): AnimationTrackBuilder<Comp, CTypes>;
  build(): Animation<CTypes>;
};

export function keyFrameBuilder<
  C extends ComponentType,
  CTypes extends ComponentTypes
>(trackBuilder: AnimationTrackBuilder<C, CTypes>, _component: C) {
  const keyFrame: Partial<KeyFrame<C>> = {
    percent: false,
    time: 0,
  };

  const builder = {
    set(property: InstanceKey<C>) {
      keyFrame.property = property;
      return builder;
    },
    to(value: InstanceValue<C>) {
      keyFrame.value = value;
      return builder;
    },
    atTime(time: number) {
      keyFrame.time = time;
      return builder;
    },
    atPercent(percent: number) {
      keyFrame.time = percent;
      keyFrame.percent = true;
      return builder;
    },
    insert() {
      trackBuilder._addKeyFrame(keyFrame as KeyFrame<C>);
      return trackBuilder;
    },
  };

  return builder;
}

export function animationTrackBuilder<
  C extends ComponentType,
  CTypes extends ComponentTypes
>(animationBuilder: AnimationBuilder<CTypes>, component: C) {
  const animation: AnimationTrack<C> = {
    component,
    duration: 0,
    keyFrames: [],
    repeats: false,
  };

  const builder = {
    _addKeyFrame(keyFrame: KeyFrame<C>): void {
      (animation.keyFrames as KeyFrame<C>[]).push(keyFrame);
    },
    duration(seconds: number) {
      animation.duration = seconds;
      return builder;
    },
    repeats() {
      animation.repeats = true;
      return builder;
    },
    // setType(component: C) {
    //   animation.component = component;
    //   return builder;
    // },
    keyFrame(): KeyFrameBuilder<C, CTypes> {
      return keyFrameBuilder(builder, component);
    },
    _build(): AnimationTrack<C> {
      (animation.keyFrames as KeyFrame<C>[]).forEach(keyFrame => {
        if (keyFrame.percent && animation.duration) {
          keyFrame.time = keyFrame.time * animation.duration;
        }
      });
      return animation as AnimationTrack<C>;
    },
    endTrack() {
      const track = builder._build();
      animationBuilder._addTrack(track);
      return animationBuilder;
    },
  };

  return builder;
}

export function animationBuilder<CTypes extends ComponentTypes>(
  _components: CTypes
) {
  const animation: Partial<Animation<CTypes>> = {
    elapsed: 0,
    tracks: new Bag<AnimationTrack<CTypes[number]>>(),
  };

  const builder = {
    _addTrack(track: AnimationTrack<CTypes[number]>) {
      if (is_some(animation.tracks)) animation.tracks.add(track);
    },
    setTarget(target: Entity) {
      animation.target = target;
      return builder;
    },
    addTrack<Comp extends ComponentType>(
      component: Comp
    ): AnimationTrackBuilder<Comp, CTypes> {
      return animationTrackBuilder<Comp, CTypes>(builder, component);
    },
    build() {
      return animation as Animation<CTypes>;
    },
  };

  return builder;
}
