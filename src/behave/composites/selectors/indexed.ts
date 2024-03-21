import { Behavior, BehaviorCode } from "src/behave/behavior";

export class IndexedSelector extends Behavior {
  index: () => number;
  behaviors: Array<Behavior>;
  constructor(index: () => number, ...behaviors: Array<Behavior>){
    super();
    this.index = index;
    this.behaviors = behaviors;
  }

  behave(): BehaviorCode{
    this.returnCode = this.behaviors[this.index()].behave();
    return this.returnCode;
  }
}
