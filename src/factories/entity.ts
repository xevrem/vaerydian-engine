import { EcsInstance } from 'ecsf';
import {
  Position,
  Velocity,
  CameraData,
  Layers,
  Starfield,
  Renderable,
  Rotation,
} from 'components';
import { LayerType, STARS } from 'utils/constants';
import { Assets, Container, Point, Sprite, Texture } from 'pixi.js';
import { Group } from '@pixi/layers';

export class EntityFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createStar(group: Group, location?: Point): void {
    const graphic = this.ecsInstance.create();

    const position = new Position(
      location
        ? location
        : new Point(
            (Math.random() * 2 - 1) * window.innerWidth,
            (Math.random() * 2 - 1) * window.innerHeight
          )
    );
    this.ecsInstance.addComponent(graphic, position);
    const spriteName = STARS[Math.floor(Math.random() * STARS.length)];
    const starContainer = new Container();
    const texture = Assets.cache.get<Texture>(spriteName);
    const starSprite = new Sprite(texture);
    starContainer.addChild(starSprite);
    const renderable = new Renderable(
      starContainer,
      new Point(4, 4),
      new Point(2, 2)
    );
    this.ecsInstance.addComponent(
      graphic,
      new Rotation(Math.random() * 180, 0)
    );
    this.ecsInstance.addComponent(graphic, renderable);
    this.ecsInstance.addComponent(graphic, new Layers(LayerType.starfield));
    this.ecsInstance.addComponent(graphic, new Starfield());

    this.ecsInstance.resolve(graphic);
  }

  createCamera(): void {
    const camera = this.ecsInstance.create();

    this.ecsInstance.tagManager.tagEntity('camera', camera);

    const position = new Position(
      new Point(window.innerWidth / 2, window.innerHeight / 2)
    );
    this.ecsInstance.addComponent(camera, position);

    const velocity = new Velocity(new Point(0, 0), 0);
    this.ecsInstance.addComponent(camera, velocity);

    const cameraContainer = new Container();
    cameraContainer.pivot.set(window.innerWidth / 2, window.innerHeight / 2);
    cameraContainer.position.set(window.innerWidth / 2, window.innerHeight / 2);
    cameraContainer.scale.set(1280 / 640, 720 / 360);
    const cameraData = new CameraData(cameraContainer);
    this.ecsInstance.addComponent(camera, cameraData);

    this.ecsInstance.resolve(camera);
  }
}
