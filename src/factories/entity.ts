import { EcsInstance, Entity } from '../ecsf';
import {
  Position,
  GraphicsRender,
  Velocity,
  CameraData,
  Layer,
  Starfield,
} from '../components';
import { LAYER } from '../utils/constants';

export class EntityFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createStar(location?: PIXI.Point): void {
    const graphic = this.ecsInstance.create();

    const position = new Position(
      location
        ? location
        : new PIXI.Point(
            (Math.random() * 2 - 1) * window.innerWidth,
            (Math.random() * 2 - 1) * window.innerHeight
          )
    );
    this.ecsInstance.addComponent(graphic, position);

    const renderable = new GraphicsRender(
      new PIXI.Graphics().beginFill(0xffffff).drawCircle(0, 0, 2).endFill()
    );
    this.ecsInstance.addComponent(graphic, renderable);
    this.ecsInstance.addComponent(graphic, new Layer(LAYER.starfield));
    this.ecsInstance.addComponent(graphic, new Starfield());

    this.ecsInstance.resolve(graphic);
  }

  createCamera(): void {
    const camera = this.ecsInstance.create();

    this.ecsInstance.tagManager.tagEntity('camera', camera);

    const position = new Position(
      new PIXI.Point(window.innerWidth / 2, window.innerHeight / 2)
    );
    this.ecsInstance.addComponent(camera, position);

    const velocity = new Velocity(new PIXI.Point(0, 0), 0);
    this.ecsInstance.addComponent(camera, velocity);

    const cameraContainer = new PIXI.Container();
    cameraContainer.pivot.set(window.innerWidth / 2, window.innerHeight / 2);
    cameraContainer.position.set(window.innerWidth / 2, window.innerHeight / 2);
    const cameraData = new CameraData(cameraContainer);
    this.ecsInstance.addComponent(camera, cameraData);

    this.ecsInstance.resolve(camera);
  }
}
