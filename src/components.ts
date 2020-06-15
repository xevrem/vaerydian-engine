import { Component } from './ecsf';
import { Point, Graphics, Sprite } from 'pixi.js';

export class Position extends Component {
  point: Point;
  constructor(point?: Point) {
    super();
    this.point = point;
  }
}

export class Velocity extends Component {
  vector: Point;
  constructor(vector?: Point) {
    super();
    this.vector = vector;
  }
}

export class Renderable extends Component {
  graphics: Graphics;
  constructor(graphics?: Graphics) {
    super();
    this.graphics = graphics;
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

export class Controllable extends Component {}
