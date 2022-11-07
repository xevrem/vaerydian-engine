import { Application } from 'pixi.js';
import { ScreenManager } from './manager';

export enum ScreenState {
  Activating,
  Deactivating,
  Active,
  Inactive,
}

export abstract class Screen {
  app: Application;
  screenManger!: ScreenManager;
  screenState: ScreenState;

  constructor(app: Application) {
    this.app = app;
    this.screenState = ScreenState.Inactive;
  }

  abstract initialize(): void;
  abstract load(): Promise<any>;
  abstract unload(): void;
  abstract update(_delta: number): void;
  abstract focusUpdate(_delta: number): void;
  abstract draw(_delta: number): void;
}
