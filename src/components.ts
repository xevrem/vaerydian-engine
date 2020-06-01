import { Component } from "ecsf";
import { Point, Graphics } from 'pixi.js';

export class Position extends Component {
  point: Point;
  constructor(point: Point = null) {
    super();
    this.point = point;
  }
}

export class Velocity extends Component {
  vector: Point;
  constructor(vector: Point = null) {
    super();
    this.vector = vector;
  }
}

export class Renderable extends Component {
  graphics: Graphics;
  constructor(graphics: Graphics = null) {
    super();
    this.graphics = graphics;
  }
}
