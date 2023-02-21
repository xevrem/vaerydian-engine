import { Component, Entity } from 'ecsf';
import {
  InstanceOf,
  NoneTuple,
  OptionTuple,
  OrderedNoneTuple,
  OrderedOptionTuple,
  OrderedSomeTuple,
  OrderedTuple,
  SomeTuple,
} from './common';

export declare type ComponentType = typeof Component;
export declare type ComponentTypes = ComponentType[];
export declare type ComponentTuple = [...ComponentTypes];

export declare type ComponentOptionType = Option<typeof Component>;
export declare type ComponentOptionTypes = ComponentOptionType[];
export declare type ComponentOptionTuple = [...ComponentOptionTypes];

export declare type OrderedComponentTuple<T extends ComponentTuple> = {
  [P in keyof T]: InstanceOf<T[P]>; // ? Comp : undefined;
};

export declare type OrderedComponentOptionTuple<
  T extends ComponentOptionTuple
> = {
  [P in keyof T]: T[P] extends Option<any>
    ? Option<InstanceOf<T[P]>>
    : unknown;
};

export declare type OrderedComponentSomeTuple<T extends ComponentOptionTuple> =
  {
    [P in keyof T]: T[P] extends Some<any> ? InstanceOf<Some<T[P]>> : InstanceOf<Option<T[P]>>;
  };

export declare type OrderedComponentNoneTuple<T extends ComponentOptionTuple> =
  {
    [P in keyof T]: T[P] extends None ? None : InstanceOf<Option<T[P]>>;
  };

export declare type JoinedResult<
  T extends ComponentTuple,
  V extends ComponentOptionTuple
> = [
  components: [...OrderedComponentTuple<T>, ...OrderedComponentOptionTuple<V>],
  entity: Entity
];

export declare type JoinedData<
  T extends ComponentTuple,
  V extends ComponentOptionTuple
> = [...OrderedComponentTuple<T>, ...OrderedComponentOptionTuple<V>];
export declare type JoinedQuery<
  T extends ComponentTuple,
  V extends ComponentOptionTuple
> = [components: JoinedData<T, V>, entity: Entity];

export declare type SmartUpdate = [component: Component, systems: boolean[]];
export declare type SmartResolve = [entity: Entity, systems: boolean[]];
