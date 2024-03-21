import { Behavior, BehaviorCode } from "src/behave/behavior";



export class PartialSelector extends Behavior {
  behaviors: Array<Behavior>;
  selection = 0;

  constructor(...behaviors: Array<Behavior>){
    super();
    this.behaviors = behaviors;
  }

  // Selects among the given behavior components (one evaluation per Behave call)
  // Performs an OR-Like behavior and will "fail-over" to each successive component until Success is reached or Failure is certain
  // -Returns Success if a behavior component returns Success
  // -Returns Running if a behavior component returns Failure or Running
  // -Returns Failure if all behavior components returned Failure or an error has occured
  behave(): BehaviorCode {
    while(this.selection < this.behaviors.length){
      const result = this.behaviors[this.selection].behave();
      switch(result){
        case BehaviorCode.Failure:
          this.selection++;
          this.returnCode = BehaviorCode.Running;
          return this.returnCode;
        case BehaviorCode.Success:
          this.selection = 0;
          this.returnCode = result;
          return this.returnCode;
        case BehaviorCode.Running:
          this.returnCode = result;
          return this.returnCode;
        default:
          this.selection++;
          this.returnCode = BehaviorCode.Failure;
          return this.returnCode;
      }
    }

    this.selection = 0;
    this.returnCode = BehaviorCode.Failure;
    return this.returnCode;
  }

}
