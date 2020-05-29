import { Component } from "ecsf";
import { Point, Graphics } from 'pixi.js';

export class Position extends Component {
  point: Point;
}

export class Velocity extends Component {
  vector: Point;
}

export class Renderable extends Component {
  graphics: Graphics;
}
