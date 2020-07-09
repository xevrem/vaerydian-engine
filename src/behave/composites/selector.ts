import { Behavior, BehaviorCode } from '../behavior';

export class Selector extends Behavior {
  behaviors: Array<Behavior>;
  constructor(...behaviors: Array<Behavior>) {
    super();
    this.behaviors = behaviors;
  }

  behave(): BehaviorCode {
    for (let i = 0; i < this.behaviors.length; i++) {
      const result = this.behaviors[i].behave();
      if (result != BehaviorCode.Failure) {
        this.returnCode = result;
        break;
      }
    }
    return this.returnCode;
  }
}
