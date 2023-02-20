export declare type ValueOf<T, K = keyof T> = K extends keyof T ? T[K] : never;
export declare type InstanceOf<T> = T extends new () => infer R ? R : undefined;

export declare type OrderedTuple<T extends unknown[]> = {
  [P in keyof T]: T[P]; // extends new () => infer U ? U : undefined;
};

export declare type OptionTypes<T> = Option<T>[];
export declare type OptionTuple<T> = [...OptionTypes<T>];
export declare type OrderedSomeTuple<
  T,
  O extends OptionTuple<T> = OptionTuple<T>
> = {
  [P in keyof O]: O[P] extends Option<O[P]> ? Some<O[P]> : None;
};
export declare type OrderedNoneTuple<T, O extends OptionTuple<T>> = {
  [P in keyof O]: O[P] extends Option<O[P]> ? None : Some<O[P]>;
};

export declare type OrderedOptionTuple<
  T,
  O extends OptionTuple<T> = OptionTuple<T>
> = OrderedSomeTuple<T, O> | OrderedNoneTuple<T, O>;
