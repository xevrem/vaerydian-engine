import { Component } from 'ecsf';
import { LineRange, QuadTree, Range } from 'utils/quadtree';
import { Container, DisplayObject, Graphics } from 'pixi.js';
import { Vector2 } from 'utils/vector';

export class Animatable extends Component {
  animation!: object;
}

export class CameraData extends Component {
  view!: Container;
}

export class CameraFocus extends Component {}

export class Controllable extends Component {}

export class Player extends Component {}

export class Position extends Component {
  point!: Vector2;
}

export class GraphicsRender extends Component {
  graphics!: Graphics;
}

export class Heading extends Component {
  vector!: Vector2;
}

export class Layers extends Component {
  layer!: number;
}

export class QtSpatial extends Component {
  point!: Vector2;
  parents!: Array<QuadTree>;
  range!: Range;
  line!: LineRange;
}

export class Qtree extends Component {}

export class Rotation extends Component {
  amount!: number;
  offset!: number;
  rate!: number;
}

export class Renderable extends Component {
  container!: DisplayObject;
  offset!: Vector2;
  pivot!: Vector2;
}

export class Starfield extends Component {}

export class Velocity extends Component {
  vector!: Vector2;
  rate!: number;
}
