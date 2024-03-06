// export enum BehaviorCode {
//   Failure,
//   Running,
//   Success,
// }

// export abstract class Behavior {
//   protected returnCode!: BehaviorCode;
//   public abstract behave(): BehaviorCode;
// }

// export class Action extends Behavior {
//   behave: () => BehaviorCode;
//   constructor(action: () => BehaviorCode) {
//     super();
//     this.behave = action;
//   }
// }
