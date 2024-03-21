import { Behavior, BehaviorCode } from "src/behave/behavior";

export class SucceederDecorator extends Behavior {
  behavior: Behavior;

  constructor( behavior: Behavior){
    super();
    this.behavior = behavior;
  }

  behave(): BehaviorCode {
    const result = this.behavior.behave();
    if(result == BehaviorCode.Failure){
      this.returnCode = BehaviorCode.Success;
      return this.returnCode;
    }
    this.returnCode = result;
    return this.returnCode;
  }
}


