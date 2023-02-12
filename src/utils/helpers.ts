
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
