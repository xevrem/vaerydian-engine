import { Group, Layer } from '@pixi/layers';
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
  layers: Record<string, Layer>;
  groups: Record<string, Group>;
  screenManger!: ScreenManager;
  screenState: ScreenState;

  constructor(app: Application, layers: Record<string, Layer>, groups: Record<string, Group>) {
    this.app = app;
    this.layers = layers;
    this.groups = groups;
    this.screenState = ScreenState.Inactive;
  }

  abstract initialize(): void;
  abstract load(): Promise<any>;
  abstract unload(): void;
  abstract update(_delta: number): void;
  abstract focusUpdate(_delta: number): void;
  abstract draw(_delta: number): void;
}
