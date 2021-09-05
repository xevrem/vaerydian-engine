export class Bag<T> {
  private _data: Array<T | undefined> = [];
  private _length = 0;
  private _count = 0;

  constructor(capacity = 16) {
    this._data = new Array(capacity);
    this._length = 0;
  }

  /**
   * total number indicies the bag contains
   */
  get capacity(): number {
    return this._data.length;
  }

  /**
   * are there any populated indexes in this bag
   */
  get isEmpty(): boolean {
    return this._length === 0;
  }

  /**
   * the furthest populated index in this bag
   */
  get length(): number {
    return this._length;
  }

  /**
   * the current count of non-undefined data elements
   */
  get count(): number {
    return this._count;
  }

  /**
   * the base data structure of the bag
   */
  get data(): Array<T | undefined> {
    return this._data;
  }

  /**
   * return the last modified index
   */
  get last(): T | undefined {
    return this._data[this._length - 1];
  }

  /**
   * perform a functional `forEach` operation on this bag
   * @param args args the standard `forEach` arguments
   * @param [context] the optional context to use
   */
  forEach(
    args: (
      item: T | undefined,
      index: number,
      array: Array<T | undefined>
    ) => void,
    context?: Bag<T>
  ): void {
    return this._data.forEach(args, context);
  }

  /**
   * perform a functional `map` operation on this bag
   * @param args args the standard `map` arguments
   * @param [context] the optional context to use
   * @returns the results of the `map` operation
   */
  map(
    args: (
      item: T | undefined,
      index: number,
      array?: Array<T | undefined>
    ) => T | undefined,
    context?: Bag<T>
  ): Array<T | undefined> {
    return this._data.map(args, context);
  }

  /**
   * perform a functional `filter` operation on this bag
   * @param args args the standard `filter` arguments
   * @param [context] the optional context to use
   * @returns the results of the `filter` operation
   */
  filter(
    args: (
      item: T | undefined,
      index: number,
      array: Array<T | undefined>
    ) => boolean,
    context?: Bag<T>
  ): Array<T | undefined> {
    return this._data.filter(args, context);
  }

  /**
   * perform a functional `reduce` operation on this bag
   * @param args args the standard `reduce` arguments
   * @param [context] the optional context to use
   * @returns the results of the `reduce` operation
   */
  reduce(
    args: (
      acc: unknown,
      item: T | undefined,
      index: number,
      array: Array<T | undefined>
    ) => unknown,
    init: unknown
  ): unknown {
    return this._data.reduce(args, init);
  }

  /**
   * perform a functional `slice` operation on this bag
   * @param args args the standard `slice` arguments
   * @param [context] the optional context to use
   * @returns the results of the `slice` operation
   */
  slice(start?: number, end?: number): Array<T | undefined> {
    return this._data.slice(start, end);
  }

  /**
   * gets the item at the specified index
   * @param index the index of the item to retrieve
   * @returns the item if found otherwise `undefined`
   */
  get(index: number): T | undefined {
    return this._data[index];
  }

  /**
   * sets the index to the given value. grows the bag if index exceeds capacity.
   * @param index the index to set
   * @param value the value to set
   * @returns a copy of the value if successfully inserted, otherwise `undefined`
   */
  set(index: number, value: T | undefined): T | undefined {
    if (index < 0) {
      return undefined;
    }
    if (index >= this._data.length) {
      this.grow(index * 2);
    } else if (index >= this._length) {
      this._length = index + 1;
    }
    if (!this._data[index] && value) this._count += 1;
    if (this._data[index] && !value) this._count -= 1;
    this._data[index] = value;
    return value;
  }

  /**
   * adds the given element to the end of the bags contents
   * @param element the element to add
   */
  add(element: T | undefined): void {
    if (this._length >= this._data.length) {
      this.grow();
    }
    this._data[this._length] = element;
    this._length++;
    this._count += 1;
  }

  /**
   * adds the given bag to this one
   * @param bag the bad to add
   */
  addBag(bag: Bag<T>): void {
    for (let i = 0; bag.length > i; i++) {
      this.add(bag.get(i));
    }
  }

  /**
   * clears the contents of the bag
   */
  clear(): void {
    this._data = new Array(this._data.length);
    this._length = 0;
    this._count = 0;
  }

  /**
   * checks if the bag contains the given element
   * @param element the element to check
   * @param [compare] the optional comparator function to use
   * @returns `true` if found, `false` if not
   */
  contains(element: T, compare = (a: T, b: T | undefined) => a === b): boolean {
    for (let i = this._length; i--; ) {
      if (compare(element, this._data[i])) return true;
    }
    return false;
  }

  /**
   * check if an element exists within the bag via strict equals
   * @param element the element to check
   * @param fromIndex the optional starting index
   * @returns `true` if found, `false` if not
   */
  includes(element: T, fromIndex = 0): boolean {
    return this._data.includes(element, fromIndex);
  }

  /**
   * removes the specified element from the bag
   * @param element the element to remove
   * @returns the element removed or `undefined` if no element was found
   */
  remove(element: T): T | undefined {
    const index = this._data.indexOf(element);
    return this.removeAt(index);
  }

  /**
   * removes the element at the specified index
   * @param index the index for the element to remove
   * @returns the removed element or `undefined` if it was empty or out of bounds
   */
  removeAt(index: number): T | undefined {
    if (index < this._data.length && index >= 0) {
      const item = this._data[index];
      if (item) this._count -= 1;
      this._length--;
      if (this._length < 0) this._length = 0;
      this._data[index] = this._data[this._length];
      this._data[this._length] = undefined;
      return item;
    } else {
      return undefined;
    }
  }

  /**
   * remove the element in the last filled position
   * @returns the element if found or `undefined` if not
   */
  removeLast(): T | undefined {
    this._length--;
    if (this._length < 0) this._length = 0;
    const item = this._data[this._length];
    if (item) this._count -= 1;
    this._data[this._length] = undefined;
    return item;
  }

  /**
   * grow the bag to the specified size, so long as it is larger.
   * @param size the size to grow the bag
   */
  grow(size: number = 2 * this._data.length + 1): void {
    if (size <= this._data.length) return;
    this._data = this._data.concat(new Array(size - this._data.length));
  }
}
