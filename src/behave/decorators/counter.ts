import { Behavior, BehaviorCode } from "behave/behavior";


export class CounterDecorator extends Behavior {
  behavior: Behavior;
  counter = 0;
  maxCount: number;

  constructor(maxCount: number, behavior: Behavior){
    super();
    this.maxCount = maxCount;
    this.behavior = behavior;
  }

  behave(): BehaviorCode {
    if(this.counter < this.maxCount){
      this.counter++;
      this.returnCode = BehaviorCode.Running;
      return this.returnCode;
    }else{
      this.counter = 0;
      this.returnCode = this.behavior.behave();
      return this.returnCode;
    }
  }
}
