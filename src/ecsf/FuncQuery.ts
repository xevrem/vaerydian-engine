import { EcsInstance, ComponentTuple, OptionTuple, OrderedTuple, ComponentOptionTuple } from './EcsInstance';

// export declare type ComponentTuple = typeof Component[];

export declare type VariadricQuery<T extends ComponentTuple> = [...T];

export declare type QueryFunc<T extends ComponentTuple> = (
  query: FuncQuery<T>,
  ecs: EcsInstance
) => void;

export class FuncQuery<T extends ComponentTuple> {
  ecs!: EcsInstance;
  data!: [...T];

  constructor(ecs: EcsInstance, data: [...T]) {
    this.ecs = ecs;
    this.data = data;
  }

  join(): IterableIterator<OptionTuple<T>> {
    return this.ecs.query<T>(this.data);
  }
}
