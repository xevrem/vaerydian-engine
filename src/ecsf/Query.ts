import { Component } from './Component';
import { EcsInstance } from './EcsInstance';

export declare type ComponentTuple = typeof Component[];

export declare type QueryResult<T extends ComponentTuple> = {
  [P in keyof T]: T[P] extends new () => infer U ? U : unknown;
};

export declare type VariadricQuery<T extends ComponentTuple> = [...T];

export declare type QueryFunc<T extends ComponentTuple> = (
  query: Query<T>,
  ecs: EcsInstance
) => void;

export class Query<T extends ComponentTuple> {
  ecs!: EcsInstance;
  data!: [...T];

  constructor(ecs: EcsInstance, data: [...T]) {
    this.ecs = ecs;
    this.data = data;
  }

  join(): IterableIterator<QueryResult<T>> {
    return this.ecs.query<T>(this.data);
  }
}
