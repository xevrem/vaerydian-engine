import { Behavior, BehaviorCode } from '../behavior';

export class Sequence extends Behavior {
  behaviors: Array<Behavior>;
  constructor(...behaviors: Array<Behavior>) {
    super();
    this.behaviors = behaviors;
  }

  /**
   * return failure on first failure
   * return running on any running
   * return success on all success
   */
  behave(): BehaviorCode {
    let running = false;
    for (let i = 0; i < this.behaviors.length; i++) {
      const result = this.behaviors[i].behave();
      if (result == BehaviorCode.Failure) {
        this.returnCode = result;
        return this.returnCode;
      } else if (result == BehaviorCode.Running) {
        running = true;
      }
    }
    this.returnCode = running ? BehaviorCode.Running : BehaviorCode.Success;
    return this.returnCode;
  }
}
