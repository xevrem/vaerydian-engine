export const ComponentSymbol = Symbol('Component');

export class Component {
  static type = -1;
  owner = -1;

  /**
   * this allows us to interogate a type to see if it is a component type
   * @returns whether type is a type of Component
   */
  static get [ComponentSymbol](): boolean {
    return true;
  }

  /**
   * this allows us to interogate an object to see if it is a component
   * @returns whether an object is a Component
   */
  get [ComponentSymbol](): boolean {
    return true;
  }

  /**
   * get the registerd type of this component
   */
  get type(): number {
    const inst = this.constructor as typeof Component;
    return inst.type;
  }
  /**
   * set the type number for all components of this type
   */
  set type(value: number) {
    const inst = this.constructor as typeof Component;
    inst.type = value;
  }
}

/**
 * confirms whether the given object is a Component Type or Component Instance
 */
export function isComponent<T extends typeof Component | Component>(
  object: T
): object is T {
  if (object[ComponentSymbol]) {
    return true;
  } else {
    return false;
  }
}

/**
 * confirms whether the given component is of the stated component type
 */
export function isComponentOfType<T extends typeof Component | Component>(
  object: Component | typeof Component,
  type: T
): object is T {
  if (object.type === type.type) {
    return true;
  } else {
    return false;
  }
}

type ProtoComp<C> = C & {
  name: string;
  type: number;
  [ComponentSymbol]: true;
};

export function protoComp<C>(name: string, data: C): ProtoComp<C> {
  return {
    ...data,
    name,
    type: -1,
    [ComponentSymbol]: true as const,
  };
}


const foo = protoComp('Foo', { foo: 1, baz: 'bar'});

export type Foo = typeof foo;
