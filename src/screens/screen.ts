import { ScreenManager } from './manager';

export enum ScreenState {
  Activating,
  Deactivating,
  Active,
  Inactive,
}

export class Screen {
  screenManger: ScreenManager;
  screenState: ScreenState;

  constructor() {
    this.screenState = ScreenState.Inactive;
  }

  initialize(): void {}
  async load(): Promise<any> {}
  unload(): void {}
  update(_delta: number): void {}
  focusUpdate(_delta: number): void {}
  draw(_delta: number): void {}
}
