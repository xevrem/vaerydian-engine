import { Behavior, BehaviorCode } from '../behavior';

export class TimerDecorator extends Behavior {
  behavior: Behavior;
  elapsedTime = 0.0;
  elapsedTimeFunc: () => number;
  waitTime: number;

  constructor(
    elapsedTimeFunc: () => number,
    waitTime: number,
    behavior: Behavior,
  ) {
    super();
    this.elapsedTimeFunc = elapsedTimeFunc;
    this.waitTime = waitTime;
    this.behavior = behavior;
  }

  behave(): BehaviorCode {
    this.elapsedTime += this.elapsedTimeFunc();
    if (this.elapsedTime >= this.waitTime) {
      this.elapsedTime = 0;
      this.returnCode = this.behavior.behave();
      return this.returnCode;
    } else {
      this.returnCode = BehaviorCode.Running;
      return this.returnCode;
    }
  }
}
