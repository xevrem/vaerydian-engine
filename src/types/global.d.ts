
declare module 'url:*' {
  export default string;
}

declare module "*.png" {
   const value: any;
   export = value;
}

declare type Some<T> = T;

declare type None = void | null | undefined | never;

declare type Option<T> = Some<T> | None;

declare type Ok<T> = T;

declare type Err<E extends Error = Error> = E;

declare type Result<T, E extends Error = Error> = Ok<T> | Err<E>;

type ValueOf<T, K = keyof T> = K extends keyof T ? T[K] : never;
