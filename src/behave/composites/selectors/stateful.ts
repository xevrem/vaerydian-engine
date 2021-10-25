import { Behavior, BehaviorCode } from "../../behavior";

export class StatefulSelector extends Behavior {
  behaviors: Array<Behavior>;
  lastBehavior = 0;

  constructor(...behaviors: Array<Behavior>){
    super();
    this.behaviors = behaviors;
  }

  behave(): BehaviorCode {
    for(; this.lastBehavior < this.behaviors.length; this.lastBehavior++){
      const result = this.behaviors[this.lastBehavior].behave();
      switch(result){
        case BehaviorCode.Failure:
          continue;
        case BehaviorCode.Success:
          this.lastBehavior = 0;
          this.returnCode = result;
          return this.returnCode;
        case BehaviorCode.Running:
          this.returnCode = result;
          return this.returnCode;
        default:
          continue;
      }
    }

    this.lastBehavior = 0;
    this.returnCode = BehaviorCode.Failure;
    return this.returnCode;
  }
}
