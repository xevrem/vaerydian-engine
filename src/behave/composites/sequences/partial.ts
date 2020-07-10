import { Behavior, BehaviorCode } from "behave/behavior";


export class PartialSequence extends Behavior {
  behaviors: Array<Behavior>;
  sequence = 0;

  constructor(...behaviors: Array<Behavior>){
    super();
    this.behaviors = behaviors;
  }

  // Performs the given behavior components sequentially (one evaluation per Behave call)
  // Performs an AND-Like behavior and will perform each successive component
  // -Returns Success if all behavior components return Success
  // -Returns Running if an individual behavior component returns Success or Running
  // -Returns Failure if a behavior components returns Failure or an error is encountered
  behave(): BehaviorCode{
    while(this.sequence < this.behaviors.length){
      switch(this.behaviors[this.sequence].behave()){
        case BehaviorCode.Failure:
          this.sequence = 0;
          this.returnCode = BehaviorCode.Failure;
          return this.returnCode;
        case BehaviorCode.Success:
          this.sequence++;
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

    this.sequence = 0;
    this.returnCode = BehaviorCode.Success;
    return this.returnCode;
  }
}
