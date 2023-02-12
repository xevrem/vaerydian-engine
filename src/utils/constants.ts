export enum KeyType {
  A = 'a',
  D = 'd',
  S = 's',
  W = 'w',
  SPACE = ' ',
}

export const LayerType = {
  sprites : 0,
  starfield : 5,
  player : 10,
}

export const STARS = [
  'star1',
  'star2',
  'star3',
  'star4',
  'star5',
  'star6',
  'star7',
]

type Some<T> = T;

type None = void | null | undefined | never;

type Option<T> = Some<T> | None;

type Ok<T> = T;

type Err<E extends Error = Error> = E;

type Result<T, E extends Error = Error> = Ok<T> | Err<E>;

const some_or_none = <T>(val: T): Option<T> => {
  return val ? val : null;
}

const ok_or_err = (arr: number[], index:number): Result<number> => {
  if (index < 0 || index > arr.length) {
    return new Error('bad index')
  } else{
    return arr[index];
  }
}

let foo = some_or_none(1234);
