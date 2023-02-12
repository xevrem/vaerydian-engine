import { Entity, EntitySystem, ComponentMapper } from '../ecsf';
import { Position, Velocity, CameraData } from '../components';
import { Application } from '@pixi/app';

export class CameraSystem extends EntitySystem {
  cameraDataMap!: ComponentMapper;
  positionMap!: ComponentMapper;
  velocityMap!: ComponentMapper;
  camera!: Entity;
  app: Application;
  constructor(app: Application) {
    super();
    this.app = app;
  }

  initialize() {
    console.log('camera system initializing...');
    this.cameraDataMap = new ComponentMapper(
      new CameraData(),
      this.ecsInstance
    );
    this.positionMap = new ComponentMapper(new Position(), this.ecsInstance);
    this.velocityMap = new ComponentMapper(new Velocity(), this.ecsInstance);
  }

  preLoadContent() {
    this.camera = this.ecsInstance.tagManager.getEntityByTag('camera');
    const cameraData = this.cameraDataMap.get(this.camera) as CameraData;

    this.app.stage.addChild(cameraData.view);
  }

  end() {
    this.camera = this.ecsInstance.tagManager.getEntityByTag('camera');
    const cameraData = this.cameraDataMap.get(this.camera) as CameraData;
    this.app.renderer.render(this.app.stage, {
      transform: cameraData.view.localTransform,
    });
  }

  process(cameraFocus: Entity, _delta: number) {
    const focusPosition = this.positionMap.get(cameraFocus) as Position;
    const cameraPosition = this.positionMap.get(this.camera) as Position;
    // cameraPosition.point.set(focusPosition.point.x, focusPosition.point.y);

    this.camera = this.ecsInstance.tagManager.getEntityByTag('camera');
    const cameraData = this.cameraDataMap.get(this.camera) as CameraData;
    cameraData.view.pivot.set(focusPosition.point.x, focusPosition.point.y);
  }
}
