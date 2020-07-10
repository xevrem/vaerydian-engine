import { Behavior, BehaviorCode } from "behave/behavior";

export class StatefulSequence extends Behavior {
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
          this.lastBehavior = 0;
          this.returnCode = result;
          return this.returnCode;
        case BehaviorCode.Success:
          continue;
        case BehaviorCode.Running:
          this.returnCode = result;
          return this.returnCode;
        default:
          this.returnCode = BehaviorCode.Running;
          return this.returnCode;
      }
    }

    this.lastBehavior = 0;
    this.returnCode = BehaviorCode.Success;
    return this.returnCode;
  }
}
