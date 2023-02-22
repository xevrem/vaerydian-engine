import { Assets, Container, Point, Sprite, Texture } from 'pixi.js';
import {
  CameraFocus,
  Controllable,
  Heading,
  Layers,
  Position,
  Renderable,
  Rotation,
  Velocity,
} from '../components';
import { EcsInstance } from 'ecsf';
import { LayerType } from 'utils/constants';
import { Vector2 } from 'ecsf/vector';

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
        v.vector = new Point(0, 0);
        v.rate = 30;
        return v;
      })
      .addWith(() => {
        const r = new Rotation();
        r.amount = 0;
        r.rate = 200;
        return r;
      })
      .addWith(() => {
        const h = new Heading();
        h.vector = new Point(0, -1);
        return h;
      })
      .addWith(() => {
        const playerContainer = new Container();
        const texture = Assets.get<Texture>('playerShip');
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
