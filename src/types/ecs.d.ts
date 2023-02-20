import { Component, Entity } from 'ecsf';
import { InstanceOf } from './common';

export declare type ComponentType = typeof Component;
export declare type ComponentTypes = ComponentType[];
export declare type ComponentTuple = [...ComponentTypes];
export declare type OrderedComponentTuple<T extends ComponentTuple> = {
  [P in keyof T]: InstanceOf<T[P]>; // ? Comp : undefined;
};

export declare type ComponentOptionType = Option<typeof Component>;
export declare type ComponentOptionTypes = ComponentOptionType[];
export declare type ComponentOptionTuple = [...ComponentOptionTypes];
export declare type OrderedComponentOptionTuple<
  T extends ComponentOptionTuple
> = {
  [P in keyof T]: InstanceOf<T[P]> extends Option<InstanceOf<T[P]>>
    ? Option<InstanceOf<T[P]>>
    : undefined;
};

export declare type JoinedResult<
  T extends ComponentTuple,
  V extends ComponentTuple
> = [
  components: [...OrderedComponentTuple<T>, ...OrderedComponentOptionTuple<V>],
  entity: Entity
];

export declare type JoinedData<
  T extends ComponentTuple,
  V extends ComponentTuple
> = [...OrderedComponentTuple<T>, ...OrderedComponentOptionTuple<V>];
export declare type JoinedQuery<
  T extends ComponentTuple,
  V extends ComponentTuple
> = [components: JoinedData<T, V>, entity: Entity];

export declare type SmartUpdate = [component: Component, systems: boolean[]];
export declare type SmartResolve = [entity: Entity, systems: boolean[]];
