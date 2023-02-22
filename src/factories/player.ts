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

  createPlayer(location: Point): void {
    this.ecsInstance
      .create()
      .addWith(() => {
        const p = new Position();
        p.point = location;
        return p;
      })
      .addWith(() => {
        const v = new Velocity();
        v.vector = new Point(0, -1);
        v.rate = 300;
        return v;
      })
      .addWith(() => {
        const r = new Rotation();
        r.amount = 0;
        r.rate = 200;
        return r;
      })
      .addWith(() => {
        const playerContainer = new Container();
        const texture = Assets.cache.get<Texture>('playerShip');
        const shipSprite = new Sprite(texture);
        playerContainer.addChild(shipSprite);
        const r = new Renderable();
        r.container = playerContainer;
        r.offset = new Point(0, 0);
        r.pivot = new Point(12, 12);
        return r;
      })
      .addWith(() => {
        const l = new Layers();
        l.layer = LayerType.player;
        return l;
      })
      .add(new Controllable())
      .add(new CameraFocus())
      .tag('player')
      .build();
  }
}
