import { Component } from './Component';

declare type QueryResult<T> = {
  [P in keyof T]: T[P] extends new (...args: any) => infer U ? U : never;
};

export class Query<T extends typeof Component[]> {
  constructor(){
    //
  }
  static retrieve<T extends typeof Component[]>(query: [...T]): QueryResult<T> {
    let foo!: QueryResult<T>;
    return foo;
  }
}








































