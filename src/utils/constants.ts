import { ValueOf } from "../types";

export const KEYS = {
  A: 'a',
  D: 'd',
  S: 's',
  W: 'w',
  SPACE: ' ',
} as const;

export type KeyType = ValueOf<typeof KEYS>;

export const LayerType = {
  sprites: 0,
  starfield: 5,
  player: 10,
} as const;

export const STARS = [
  'star1',
  'star2',
  'star3',
  'star4',
  'star5',
  'star6',
  'star7',
] as const;
