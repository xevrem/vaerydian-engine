import { ComponentOptionTuple, ComponentTuple } from 'ecsf/EcsInstance';
import { is_none } from './constants';

export const is_some = <T>(val: Option<T>): val is Some<T> => {
  if (val === undefined || val === null) return false;
  return true;
};

export const is_None = <T>(val: Option<T>): val is None => {
  if (val === undefined || val === null) return true;
  return false;
};

export const is_ok = <T, E extends Error>(val: Result<T, E>): val is Ok<T> => {
  if (val instanceof Error) return false;
  return true;
};

export const is_err = <T, E extends Error>(
  val: Result<T, E>
): val is Err<E> => {
  if (val instanceof Error) return true;
  return false;
};

export const all_some = (
  val: (ComponentTuple | ComponentOptionTuple)
): val is ComponentTuple => {
  if (val.some(v => is_none(v))) return false;
  return true;
};
