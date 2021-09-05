import { Behavior, BehaviorCode} from '../behavior';

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
