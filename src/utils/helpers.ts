import { OptionTuple, OrderedOptionTuple, OrderedSomeTuple } from 'types';

export function is_some<T>(val: Option<T>): val is Some<T> {
  if (
    val ||
    typeof val === 'number' ||
    (typeof val === 'boolean' && val === false)
  )
    return true;
  return false;
}

export function is_none<T>(val: Option<T>): val is None {
  if (is_some(val)) return false;
  return true;
}

export function is_ok<T, E extends Error>(val: Result<T, E>): val is Ok<T> {
  if (val instanceof Error) return false;
  return true;
}

export function is_err<T, E extends Error>(val: Result<T, E>): val is Err<E> {
  if (val instanceof Error) return true;
  return false;
}

export function all_some<T, O extends OptionTuple<T> = OptionTuple<T>>(
  val: OrderedOptionTuple<T, O>
): val is OrderedSomeTuple<T, O> {
  if (val.some(v => is_none(v))) return false;
  return true;
}
