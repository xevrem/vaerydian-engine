import { EcsInstance } from '../ecsf';
import { Point, Sprite, LoaderResource } from 'pixi.js';
import { CameraFocus, Position, Velocity, SpriteRender, Controllable, Rotation } from '../components';

export class PlayerFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createPlayer(
    resources: Partial<Record<string, LoaderResource>>,
    location: Point
  ): void {
    let player = this.ecsInstance.create();

    this.ecsInstance.addComponent(player, new Position(location));
    this.ecsInstance.addComponent(player, new Velocity(new Point(0,-1), 0, 100));
    this.ecsInstance.addComponent(player, new Rotation(0,100));
    this.ecsInstance.addComponent(
      player,
      new SpriteRender(
        new Sprite(resources['playerShip'].texture),
        new Point(49, 37),
        new Point(0.5, 0.5)
      )
    );
    this.ecsInstance.addComponent(player, new Controllable());
    this.ecsInstance.addComponent(player, new CameraFocus());

    this.ecsInstance.resolve(player);
  }
}
