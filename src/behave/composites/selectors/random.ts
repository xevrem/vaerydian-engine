import { Behavior, BehaviorCode } from "behave/behavior";


/**
 * randomly select one of the passed behaviors
 */
export class RandomSelector extends Behavior {
  behaviors: Array<Behavior>;

  constructor(...behaviors: Array<Behavior>){
    super();
    this.behaviors = behaviors;
  }

  behave(): BehaviorCode {
    const randIndex = Math.floor(Math.random() * this.behaviors.length);
    const result = this.behaviors[randIndex].behave();
    this.returnCode = result
    return this.returnCode;
  }
}
