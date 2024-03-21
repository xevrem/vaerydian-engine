import { Behavior, BehaviorCode } from "src/behave/behavior";

export class RepeaterDecorator extends Behavior {
  behavior: Behavior;

  constructor( behavior: Behavior){
    super();
    this.behavior = behavior;
    this.returnCode = BehaviorCode.Running
  }

  behave(): BehaviorCode {
    this.behavior.behave();
    return this.returnCode;
  }
}


