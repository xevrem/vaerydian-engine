export enum BehaviorReturnCode {
  Failure,
  Running,
  Success,
}


export abstract class BehaviorComponent {
  protected returnCode: BehaviorReturnCode;
  public abstract behave(): BehaviorReturnCode;
}

export class Behavior {
  _root: BehaviorComponent;
  _lastVisited: BehaviorComponent;
  returnCode: BehaviorReturnCode;

  constructor(root: BehaviorComponent) {
    this._root = root;
  }

  behave(): BehaviorReturnCode {
    try {
      switch (this._root.behave()) {
        case BehaviorReturnCode.Failure:
          this.returnCode = BehaviorReturnCode.Failure;
          break;
        case BehaviorReturnCode.Success:
          this.returnCode = BehaviorReturnCode.Success;
          break;
        case BehaviorReturnCode.Running:
          this.returnCode = BehaviorReturnCode.Running;
          break;
        default:
          this.returnCode = BehaviorReturnCode.Running;
          break;
      }
      return this.returnCode;
    } catch (error) {
      console.error('b:b::error', error);
      this.returnCode = BehaviorReturnCode.Failure;
      return this.returnCode;
    }
  }
}
