import { EcsInstance } from '../ecsf';
import {
  CameraFocus,
  Position,
  Velocity,
  Renderable,
  Controllable,
  Rotation,
  Layers,
} from '../components';
import { LayerType } from '../utils/constants';
import { Point } from '@pixi/math';
import { LoaderResource } from '@pixi/loaders';
import { Container } from '@pixi/display';
import { Sprite } from '@pixi/sprite';


export class PlayerFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createPlayer(
    resources: Partial<Record<string,LoaderResource>>,
    location: Point
  ): void {
    const player = this.ecsInstance.create();

    this.ecsInstance.tagManager.tagEntity('player', player);

    this.ecsInstance.addComponent(player, new Position(location));
    this.ecsInstance.addComponent(
      player,
      new Velocity(new Point(0, -1), 300)
    );
    this.ecsInstance.addComponent(player, new Rotation(0, 200));
    const playerContainer = new Container();
    const shipSprite = new Sprite(resources['playerShip'].texture);
    playerContainer.addChild(shipSprite);
    this.ecsInstance.addComponent(
      player,
      new Renderable(
        playerContainer,
        new Point(0, 0),
        new Point(12, 12)
      )
    );
    this.ecsInstance.addComponent(player, new Layers(LayerType.player));
    this.ecsInstance.addComponent(player, new Controllable());
    this.ecsInstance.addComponent(player, new CameraFocus());

    this.ecsInstance.resolve(player);
  }
}
