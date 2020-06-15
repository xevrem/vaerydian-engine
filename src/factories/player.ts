import { EcsInstance } from '../ecsf';
import { Point, Sprite, LoaderResource } from 'pixi.js';
import { Position, Velocity, SpriteRender, Controllable } from '../components';

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
    this.ecsInstance.addComponent(player, new Velocity(new Point(0,0)));
    this.ecsInstance.addComponent(
      player,
      new SpriteRender(
        new Sprite(resources['playerIdle'].texture),
        new Point(96/2, 128-32),
      )
    );
    this.ecsInstance.addComponent(player, new Controllable());

    this.ecsInstance.resolve(player);
  }
}
