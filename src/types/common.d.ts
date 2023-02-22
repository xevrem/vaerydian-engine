export declare type ValueOf<T, K = keyof T> = K extends keyof T ? T[K] : never;
export declare type InstanceOf<T> = T extends new () => infer R ? R : undefined;

export declare type OrderedTuple<T extends unknown[]> = {
  [P in keyof T]: T[P]; // extends new () => infer U ? U : undefined;
};

export declare type OptionTypes<T> = Option<T>[];
export declare type OptionTuple<T> = [...OptionTypes<T>];
export declare type SomeTuple<T> = [...Some<T>[]];
export declare type NoneTuple = [...None[]];

export declare type OrderedOptionTuple<T extends OptionTuple<T>> = {
  [P in keyof T]: Option<T[P]>;
};

export declare type OrderedSomeTuple<T extends OptionTuple<T>> = {
  [P in keyof T]: Some<T[P]>;
};
export declare type OrderedNoneTuple<T extends OptionTuple<T>> = {
  [P in keyof T]: None;
};

// export declare type OrderedOptionTuple<T extends any> =
//   | OrderedSomeTuple<T>
//   | OrderedNoneTuple<T>;
