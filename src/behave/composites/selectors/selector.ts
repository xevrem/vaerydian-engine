import { Behavior, BehaviorCode } from '../behavior';

export class Selector extends Behavior {
  behaviors: Array<Behavior>;
  constructor(...behaviors: Array<Behavior>) {
    super();
    this.behaviors = behaviors;
  }

  /**
   * return failure on all failure
   * return running on first running
   * return success on first success
   */
  behave(): BehaviorCode {
    for (let i = 0; i < this.behaviors.length; i++) {
      const result = this.behaviors[i].behave();
      switch(result){
        case BehaviorCode.Failure:
          continue;
        case BehaviorCode.Success:
          this.returnCode = result;
          return this.returnCode;
        case BehaviorCode.Running:
          this.returnCode = result;
          return this.returnCode;
        default:
          continue;
      }
    }
    this.returnCode = BehaviorCode.Failure;
    return this.returnCode;
  }
}
