import { Behavior, BehaviorCode } from "src/behave/behavior";


export class RandomDecorator extends Behavior {
  behavior: Behavior;
  randFunc: () => number;
  probability: number;
  constructor(probability: number, randFunc: () => number, behavior: Behavior){
    super();
    this.probability = probability;
    this.randFunc = randFunc;
    this.behavior = behavior;
  }

  behave(): BehaviorCode {
    if(this.randFunc() <= this.probability){
      this.returnCode = this.behavior.behave();
      return this.returnCode;
    }else{
      this.returnCode = BehaviorCode.Running;
      return this.returnCode;
    }
  }
}
