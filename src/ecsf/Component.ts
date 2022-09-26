export class Component {
  owner = -1;

  static type = -1;
  get type(): number {
    const inst = this.constructor as typeof Component;
    return inst.type;
  }
  set type(value: number) {
    const inst = this.constructor as typeof Component;
    inst.type = value;
  }
}
