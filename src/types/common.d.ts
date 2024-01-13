export declare type ValueOf<T, K = keyof T> = K extends keyof T ? T[K] : never;
export declare type InstanceOf<T> = T extends new () => infer R ? R : undefined;
export declare type InstanceKey<T> = keyof InstanceOf<T>;
export declare type InstanceValue<T> = InstanceOf<T>[InstanceKey<T>];
