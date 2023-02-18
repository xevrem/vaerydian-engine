import { Component } from './ecsf';
import { LineRange, QuadTree, Range } from './utils/quadtree';
import { Container, DisplayObject } from '@pixi/display';
import { Point } from '@pixi/math';
import { Graphics } from '@pixi/graphics';

export class Animatable extends Component {
  animation!: object;
}

export class CameraData extends Component {
  view!: Container;
}

export class CameraFocus extends Component { }

export class Controllable extends Component { }

export class Position extends Component {
  point!: Point;
}

export class GraphicsRender extends Component {
  graphics!: Graphics;
}

export class Heading extends Component {
  vector!: Point;
}

export class Layers extends Component {
  layer!: number;
}

export class QtSpatial extends Component {
  point!: Point;
  parents!: Array<QuadTree>;
  range!: Range;
  line!: LineRange;
}

export class Qtree extends Component { }

export class Rotation extends Component {
  amount!: number;
  rate!: number;
}

export class Renderable extends Component {
  container!: DisplayObject;
  offset!: Point;
  pivot!: Point;
}

export class Starfield extends Component { }

export class Velocity extends Component {
  vector!: Point;
  rate!: number;
}
