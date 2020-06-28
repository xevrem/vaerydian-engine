import { Component } from './ecsf';
import { LAYER } from 'utils/constants';
// import { Point, Graphics, Sprite, Container } from 'pixi.js';

export class CameraData extends Component {
  view: PIXI.Container;
  constructor(view?: PIXI.Container) {
    super();
    this.view = view;
  }
}

export class CameraFocus extends Component {}

export class Controllable extends Component {}

export class Position extends Component {
  point: PIXI.Point;
  constructor(point?: PIXI.Point) {
    super();
    this.point = point;
  }
}

export class GraphicsRender extends Component {
  graphics: PIXI.Graphics;
  constructor(graphics?: PIXI.Graphics) {
    super();
    this.graphics = graphics;
  }
}

export class Layer extends Component {
  layer: LAYER;
  constructor(layer?: LAYER){
    super();
    this.layer = layer;
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
  sprite: PIXI.Sprite;
  offset: PIXI.Point;
  anchor: PIXI.Point;

  constructor(sprite?: PIXI.Sprite, offset?: PIXI.Point, anchor?: PIXI.Point) {
    super();
    this.sprite = sprite;
    this.offset = offset;
    this.anchor = anchor;
  }
}

export class Starfield extends Component {}

export class Velocity extends Component {
  vector: PIXI.Point;
  rate: number;
  constructor(vector?: PIXI.Point, rate?: number) {
    super();
    this.vector = vector;
    this.rate = rate;
  }
}
