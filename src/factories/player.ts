import { Assets, Container, Point, Sprite, Texture } from 'pixi.js';
import {
  CameraFocus,
  Controllable,
  Layers,
  Position,
  Renderable,
  Rotation,
  Velocity,
} from '../components';
import { EcsInstance } from 'ecsf';
import { LayerType } from 'utils/constants';

export class PlayerFactory {
  ecsInstance: EcsInstance;

  constructor(ecsInstance: EcsInstance) {
    this.ecsInstance = ecsInstance;
  }

  createPlayer(
    location: Point
  ): void {
    const player = this.ecsInstance.create();

    this.ecsInstance.tagManager.tagEntity('player', player);

    this.ecsInstance.addComponent(player, new Position(location));
    this.ecsInstance.addComponent(player, new Velocity(new Point(0, -1), 300));
    this.ecsInstance.addComponent(player, new Rotation(0, 200));
    const playerContainer = new Container();
    const texture = Assets.cache.get<Texture>('playerShip');
    const shipSprite = new Sprite(texture);
    playerContainer.addChild(shipSprite);
    this.ecsInstance.addComponent(
      player,
      new Renderable(playerContainer, new Point(0, 0), new Point(12, 12))
    );
    this.ecsInstance.addComponent(player, new Layers(LayerType.player));
    this.ecsInstance.addComponent(player, new Controllable());
    this.ecsInstance.addComponent(player, new CameraFocus());

    this.ecsInstance.resolve(player);
  }
}
