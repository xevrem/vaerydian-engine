import { Component } from './ecsf';
import { Point, Graphics, Sprite } from 'pixi.js';

export class CameraFocus extends Component {}

export class Controllable extends Component {}

export class Position extends Component {
  point: Point;
  constructor(point?: Point) {
    super();
    this.point = point;
  }
}

export class Renderable extends Component {
  graphics: Graphics;
  constructor(graphics?: Graphics) {
    super();
    this.graphics = graphics;
  }
}

export class Rotation extends Component {
  amount: number;
  rate: number;
  constructor(rotation?: number, rate?: number) {
    super();
    this.amount = rotation;
    this.rate = rate;
  }
}

export class SpriteRender extends Component {
  sprite: Sprite;
  offset: Point;
  anchor: Point;

  constructor(sprite?: Sprite, offset?: Point, anchor?: Point) {
    super();
    this.sprite = sprite;
    this.offset = offset;
    this.anchor = anchor;
  }
}

export class Velocity extends Component {
  vector: Point;
  magnitude: number;
  rate: number;
  constructor(vector?: Point, magnitude?: number, rate?: number) {
    super();
    this.vector = vector;
    this.magnitude = magnitude;
    this.rate = rate;
  }
}
