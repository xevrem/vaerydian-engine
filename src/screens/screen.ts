// import { Group, Layer } from '@pixi/layers';
import { EcsInstance } from 'ecsf';
import { Application, IRenderLayer } from 'pixi.js';
import { ScreenManager } from './manager';

export enum ScreenState {
  Activating,
  Deactivating,
  Active,
  Inactive,
}

export abstract class Screen {
  ecs!: EcsInstance;
  app: Application;
  // layers: Record<string, Layer>;
  layers: Map<number, IRenderLayer>;
  screenManger!: ScreenManager;
  screenState: ScreenState;
  id: number = -1;

  constructor(app: Application, layers: Map<number, IRenderLayer>) {
    this.app = app;
    // this.layers = layers;
    this.layers = layers;
    this.screenState = ScreenState.Inactive;
  }


  abstract initialize(): void;
  abstract load(): Promise<any>;
  abstract unload(): void;
  abstract update(_delta: number): void;
  abstract focusUpdate(_delta: number): void;
  abstract draw(_delta: number): void;
}
