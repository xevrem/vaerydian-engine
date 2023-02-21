export declare type ValueOf<T, K = keyof T> = K extends keyof T ? T[K] : never;
export declare type InstanceOf<T> = T extends new () => infer R ? R : undefined;

export declare type OrderedTuple<T extends unknown[]> = {
  [P in keyof T]: T[P]; // extends new () => infer U ? U : undefined;
};

export declare type OptionTypes<T> = Option<T>[];
export declare type OptionTuple<T> = [...OptionTypes<T>];
export declare type SomeTuple<T> = [...Some<T>[]];
export declare type NoneTuple = [...None[]];

export declare type OrderedOptionTuple<T> = {
  [P in keyof T]: T[P] extends Option<T[P]> ? Option<T[P]> : unknown;
};

export declare type OrderedSomeTuple<T> = {
  [P in keyof T]: T[P] extends Some<T[P]> ? Some<T[P]> : Option<T>;
};
export declare type OrderedNoneTuple<T> = {
  [P in keyof T]: T[P] extends None ? None : Option<T[P]>;
};

// export declare type OrderedOptionTuple<T extends any> =
//   | OrderedSomeTuple<T>
//   | OrderedNoneTuple<T>;
