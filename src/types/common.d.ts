export declare type ValueOf<T, K = keyof T> = K extends keyof T ? T[K] : never;
export declare type InstanceOf<T> = T extends new () => infer R ? R : unknown;
export declare type InstanceKey<T extends abstract new (...args: any) => any> =
  keyof InstanceType<T>;
export declare type InstanceValue<
  T extends abstract new (...args: any) => any,
> = InstanceType<T>[InstanceKey<T>];
