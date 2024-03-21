import { Behavior, BehaviorCode } from "src/behave/behavior";

export class InverterDecorator extends Behavior {
  behavior: Behavior;

  constructor(behavior: Behavior) {
    super();
    this.behavior = behavior;
  }

  behave(): BehaviorCode {
    const result = this.behavior.behave();
    switch (result) {
      case BehaviorCode.Failure:
        this.returnCode = BehaviorCode.Success;
        return this.returnCode;
      case BehaviorCode.Success:
        this.returnCode = BehaviorCode.Running;
        return this.returnCode;
      case BehaviorCode.Running:
        this.returnCode = BehaviorCode.Running;
        return this.returnCode;
      default:
        this.returnCode = BehaviorCode.Running;
        return this.returnCode;
    }
  }
}
