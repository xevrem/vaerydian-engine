import { EcsInstance } from '../ecsf';
import {
  CameraFocus,
  Position,
  Velocity,
  SpriteRender,
  Controllable,
  Rotation,
  Layer,
} from '../components';
import { LayerType } from '../utils/constants';

export class PlayerFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createPlayer(
    resources: Partial<Record<string, PIXI.LoaderResource>>,
    location: PIXI.Point
  ): void {
    const player = this.ecsInstance.create();

    this.ecsInstance.tagManager.tagEntity('player', player);

    this.ecsInstance.addComponent(player, new Position(location));
    this.ecsInstance.addComponent(
      player,
      new Velocity(new PIXI.Point(0, -1), 300)
    );
    this.ecsInstance.addComponent(player, new Rotation(0, 200));
    this.ecsInstance.addComponent(
      player,
      new SpriteRender(
        new PIXI.Sprite(resources['playerShip'].texture),
        new PIXI.Point(8, 8),
        new PIXI.Point(0.5, 0.5)
      )
    );
    this.ecsInstance.addComponent(player, new Layer(LayerType.player));
    this.ecsInstance.addComponent(player, new Controllable());
    this.ecsInstance.addComponent(player, new CameraFocus());

    this.ecsInstance.resolve(player);
  }
}
