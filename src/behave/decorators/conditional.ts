import { Behavior, BehaviorCode } from 'behave/behavior';

export class Conditional extends Behavior {
  test: () => boolean;
  constructor(test: () => boolean) {
    super();
    this.test = test;
  }

  behave(): BehaviorCode {
    switch (this.test()) {
      case true:
        this.returnCode = BehaviorCode.Success;
        break;
      case false:
        this.returnCode = BehaviorCode.Failure;
        break;
      default:
        this.returnCode = BehaviorCode.Failure;
        break;
    }
    return this.returnCode;
  }
}
