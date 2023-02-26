import { Component } from 'ecsf/Component';
import { InstanceKey, InstanceOf, InstanceValue } from 'types/common';


export type KeyFrame<C extends typeof Component> = {
  component: C;
  percent: boolean;
  property: InstanceKey<C>;
  time: number;
  value: InstanceValue<C>;
};

export type Animation<
  C extends typeof Component,
> = {
  keyFrames: KeyFrame<C>[];
  repeats: boolean;
  duration: number;
};

export type KeyFrameBuilder<
  C extends typeof Component,
> = {
  set(property: keyof InstanceOf<C>): KeyFrameBuilder<C>;
  to(value: InstanceValue<C>): KeyFrameBuilder<C>;
  atTime(time: number): KeyFrameBuilder<C>;
  atPercent(percent: number): KeyFrameBuilder<C>;
  insert(): AnimationBuilder<C>;
};

export type AnimationBuilder<
  C extends typeof Component,
> = {
  _addKeyFrame(keyFrame: KeyFrame<C>): void;
  duration(seconds: number): AnimationBuilder<C>;
  repeats(): AnimationBuilder<C>;
  keyFrame(): KeyFrameBuilder<C>;
  build(): Animation<C>;
};

export function makeKeyFrameBuilder<
  C extends typeof Component,
>(animationBuilder: AnimationBuilder<C>, component: C) {
  const keyFrame: Partial<KeyFrame<C>> = {
    component,
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
      animationBuilder._addKeyFrame(keyFrame as KeyFrame<C>);
      return animationBuilder;
    },
  };

  return builder;
}

export function makeAnimationBuilder<
  C extends typeof Component,
>(component: C) {
  const animation: Animation<C> = {
    duration: 0,
    keyFrames: [],
    repeats: false,
  };

  const builder = {
    _addKeyFrame(keyFrame: KeyFrame<C>): void {
      animation.keyFrames.push(keyFrame);
    },
    duration(seconds: number) {
      animation.duration = seconds;
      return builder;
    },
    repeats() {
      animation.repeats = true;
      return builder;
    },
    keyFrame() {
      return makeKeyFrameBuilder<C>(builder, component);
    },
    build(): Animation<C> {
      animation.keyFrames.forEach(keyFrame => {
        if (keyFrame.percent) {
          keyFrame.time = keyFrame.time * animation.duration;
        }
      });
      return animation;
    },
  };

  return builder;
}

