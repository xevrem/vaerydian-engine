/*eslint no-extend-native: "off" */
import cloneDeep from 'lodash';

type AnyObject<T> = Object | Set<T> | Array<T> | Record<PropertyKey, T>;
type KeyValuePair<K,V> = [K, V];

export function xor(a: boolean, b: boolean): boolean {
  return (a || b) && !(a && b);
}

const setSymbol = Symbol('set');
const objSymbol = Symbol('object');

declare global {
  interface Set<T> {
    [setSymbol]: true;
    addAll(arr: T[]): Set<T>;
    concat(arr: T[]): Set<T>;
    map<V>(
      callback: (item: T, index: number, arr: readonly T[]) => V,
      thisArg?: any
    ): V[];
    reduce<V>(
      callback: (acc: V, item: T, index: number, arr: readonly T[]) => V,
      init: V
    ): V;
  }
  interface SetConstructor {
    isSet<T>(value: any | Set<T>): value is Set<T>;
  }
  interface Array<T> {
    /**
     * a mutative variant of `concat`
     */
    add(values: T[]): T[];
    /**
     * a mutative variant of `push`
     */
    addItem(value: T): T[];
    insert(values: T[], index: number): T[];
    findReplace(
      value: T,
      predicate: (value: T, index: number, obj: T[]) => unknown,
      thisArg?: any
    ): Option<T>;
    last(): T;
    remove(value: T): Option<T>;
    removeAt(index: number): Option<T>;
    replace(oldValue: T, newValue: T): Option<T>;
    replaceAt(value: T, index: number): Option<T>;
    take(num: number, startIndex?: number): T[];
  }
  interface Object {
    [objSymbol]: true;
  }
  interface ObjectConstructor {
    add<K extends PropertyKey, V>(
      obj: Record<K, V>,
      key: K,
      value: V
    ): Record<K, V>;
    clone<T>(obj: T): T;
    deepMerge<T extends AnyObject<T>>(a: T, b: T): Option<T>;
    forEach<K extends PropertyKey, V>(
      obj: Record<K, V>,
      callback: (
        item: KeyValuePair<K, V>,
        index: number,
        arr: readonly KeyValuePair<K, V>[]
      ) => void,
      thisArg?: any
    ): void;
    isObject(value: any | Object): value is Object;
    isRecord<K extends PropertyKey, V>(
      value: any | Record<K, V>
    ): value is Record<K, V>;
    map<T, K extends PropertyKey, V>(
      obj: Record<K, V>,
      callback: (
        item: KeyValuePair<K, V>,
        index: number,
        arr: readonly KeyValuePair<K, V>[],
        thisArg?: any
      ) => T
    ): T[];
    merge(a: Object, b: Object): Object;
    reduce<T, K extends PropertyKey, V>(
      obj: Record<K, V>,
      callback: (
        acc: T,
        item: KeyValuePair<K, V>,
        index: number,
        arr: readonly KeyValuePair<K, V>[]
      ) => T,
      init: T
    ): T;
  }
}

Set.prototype[setSymbol] = true;
Set.prototype.addAll = function <T>(arr: T[]): Set<T> {
  for (let i = 0; i < arr.length; i++) {
    this.add(arr[i]);
  }
  return this;
};
Set.prototype.concat = function <T>(arr: T[]): Set<T> {
  return new Set<T>(Array.from(this.values()).concat(arr));
};
Set.prototype.map = function <T, V>(
  callback: (item: T, index: number, arr: readonly T[]) => V,
  thisArg?: any
): V[] {
  return Array.from(this.values()).map(callback, thisArg);
};
Set.prototype.reduce = function <T, V>(
  callback: (acc: V, item: T, index: number, arr: readonly T[]) => V,
  init: V
): V {
  return Array.from(this.values()).reduce(callback, init);
};

Set.isSet = function <T>(value: any | Set<T>): value is Set<T> {
  if (Object.isObject(value) && setSymbol in value && value?.[setSymbol])
    return true;
  return false;
};

/**
 * a mutative variant of `concat`
 */
Array.prototype.add = function <T>(values: T[]): T[] {
  this.splice(this.length, 0, ...values);
  return this;
};

/**
 * a mutative variant of `push`
 */
Array.prototype.addItem = function <T>(value: T): T[] {
  this.splice(this.length, 0, value);
  return this;
};

Array.prototype.insert = function <T>(values: T[], index: number): T[] {
  const removedValues = this.splice(index, 0, ...values);
  return removedValues;
};

Array.prototype.last = function<T>(): T {
  return this.slice(-1)[0];
}

Array.prototype.removeAt = function <T>(index: number): Option<T> {
  const removedValues = this.splice(index, 1);
  return removedValues[0];
};

Array.prototype.remove = function <T>(value: T): Option<T> {
  const index = this.indexOf(value);
  if (index === -1) return null;
  const oldValue = this.removeAt(index);
  return oldValue;
};

Array.prototype.replaceAt = function <T>(value: T, index: number): Option<T> {
  const oldValues = this.splice(index, 1, value);
  return oldValues[0];
};

Array.prototype.replace = function <T>(oldValue: T, newValue: T): Option<T> {
  const index = this.indexOf(oldValue);
  if (index === -1) return null;
  return this.replaceAt(newValue, index);
};

Array.prototype.findReplace = function <T>(
  value: T,
  predicate: (value: T, index: number, obj: T[]) => unknown,
  thisArg?: any
): Option<T> {
  const index = this.findIndex(predicate, thisArg);
  if (index === -1) return null;
  return this.replaceAt(value, index);
};

Array.prototype.take = function <T>(num: number, startIndex = 0): T[] {
  return this.slice(startIndex, num);
};

Object.prototype[objSymbol] = true;

// create a fall-back in case structuredClone is not defined (i.e., it should be)
const _cloneFunc = window.structuredClone ? window.structuredClone : cloneDeep;

Object.add = function <K extends PropertyKey, V>(
  obj: Record<K, V>,
  key: K,
  value: V
): Record<K, V> {
  obj[key] = value;
  return obj;
};

Object.clone = function <T>(obj: T): T {
  return _cloneFunc(obj);
};

Object.isObject = function (value: any | Object): value is Object {
  if (value instanceof Object && objSymbol in value && value[objSymbol])
    return true;
  return false;
};

Object.merge = function (objA: Object, objB: Object): Object {
  Object.assign(objA, objB);
  return objA;
};

Object.isRecord = <K extends PropertyKey, V>(
  value: any | Record<K, V>
): value is Record<K, V> => {
  if (Object.isObject(value) && Object.keys(value).length) return true;
  return false;
};

Object.deepMerge = function <T extends AnyObject<T>>(
  objA: T,
  objB: T
): Option<T> {
  if (objA !== undefined) {
    if (Array.isArray(objB)) {
      if (Array.isArray(objA)) {
        return objA.concat(objB) as T;
      } else {
        return objB;
      }
    } else if (Set.isSet(objB)) {
      if (Set.isSet(objA)) {
        objB.forEach((value) => Set.isSet(objA) && objA.add(value as T));
        return objA;
      } else {
        return objB;
      }
    } else if (Object.isRecord(objB)) {
      if (Object.isRecord(objA)) {
        const state = Object.keys(objA).reduce(
          (state, key) => {
            if (key in state) {
              if (key in objA) {
                state[key] = this.deepMerge(objA[key] as T, state[key] as T);
              } else {
                return state;
              }
            } else {
              state[key] = objA[key];
            }
            return state;
            // use a shallow-clone for speed
          },
          { ...objB }
        );
        return { ...objA, ...state };
      } else {
        return objB;
      }
    } else if (typeof objB === 'string') {
      return objB;
    } else if (typeof objB === 'number') {
      return objB;
    } else {
      if (objB !== undefined) {
        return objB;
      } else {
        return objA;
      }
    }
  } else if (objB !== undefined) {
    return objB;
  } else {
    return undefined;
  }
};

Object.reduce = function <T, K extends PropertyKey, V>(
  obj: Record<K, V>,
  callback: (
    acc: T,
    item: KeyValuePair<K, V>,
    index: number,
    arr: readonly KeyValuePair<K, V>[]
  ) => T,
  init: T
): T {
  return (Object.entries(obj) as KeyValuePair<K, V>[]).reduce<T>(
    callback,
    init
  );
};

Object.forEach = function <K extends PropertyKey, V>(
  obj: Record<K, V>,
  callback: (
    item: KeyValuePair<K, V>,
    index: number,
    arr: readonly KeyValuePair<K, V>[]
  ) => void,
  thisArg?: any
): void {
  (Object.entries(obj) as KeyValuePair<K, V>[]).forEach(callback, thisArg);
};

Object.map = function <T, K extends PropertyKey, V>(
  obj: Record<K, V>,
  callback: (
    item: KeyValuePair<K, V>,
    index: number,
    arr: KeyValuePair<K, V>[],
    thisArg?: any
  ) => T
): T[] {
  return (Object.entries<V>(obj) as KeyValuePair<K, V>[]).map<T>(callback);
};

/**
 * check if a given static or class method is a polyfill extension
 */
export function isExtension(symbol: any): boolean {
  switch (symbol) {
    case Set.isSet:
    case Set.prototype.addAll:
    case Set.prototype.concat:
    case Set.prototype.map:
    case Set.prototype.reduce:
    case Array.prototype.add:
    case Array.prototype.addItem:
    case Array.prototype.findReplace:
    case Array.prototype.insert:
    case Array.prototype.remove:
    case Array.prototype.removeAt:
    case Array.prototype.replace:
    case Array.prototype.replaceAt:
    case Array.prototype.take:
    case Object.clone:
    case Object.deepMerge:
    case Object.forEach:
    case Object.isObject:
    case Object.isRecord:
    case Object.map:
    case Object.merge:
    case Object.reduce:
      return true;
    default:
      return false;
  }
}
