import { Component } from './ecsf';
import { LineRange, QuadTree, Range } from './utils/quadtree';
import { Container, DisplayObject } from '@pixi/display';
import { Point } from '@pixi/math';
import { Graphics } from '@pixi/graphics';
import { LayerType } from './utils/constants';

export class Animatable extends Component {
  animation: object;
  constructor(animation?: object) {
    super();
    this.animation = animation;
  }
}

export class CameraData extends Component {
  view: Container;
  constructor(view?: Container) {
    super();
    this.view = view;
  }
}

export class CameraFocus extends Component {}

export class Controllable extends Component {}

export class Position extends Component {
  point: Point;
  constructor(point?: Point) {
    super();
    this.point = point;
  }
}

export class GraphicsRender extends Component {
  graphics: Graphics;
  constructor(graphics?: Graphics) {
    super();
    this.graphics = graphics;
  }
}

export class Heading extends Component {
  vector: Point;
  constructor(vector?: Point) {
    super();
    this.vector = vector;
  }
}

export class Layers extends Component {
  layer: LayerType;
  constructor(layer?: LayerType) {
    super();
    this.layer = layer;
  }
}

export class QtSpatial extends Component {
  point: Point;
  parents: Array<QuadTree>;
  range: Range;
  line: LineRange;

  constructor(point?: Point, range?: Range, line?: LineRange) {
    super();
    this.parents = [];
    this.point = point;
    this.range = range;
    this.line = line;
  }
}

export class Qtree extends Component {}

export class Rotation extends Component {
  amount: number;
  rate: number;
  constructor(rotation?: number, rate?: number) {
    super();
    this.amount = rotation;
    this.rate = rate;
  }
}

export class Renderable extends Component {
  container: DisplayObject;
  offset: Point;
  pivot: Point;

  constructor(container?: DisplayObject, offset?: Point, anchor?: Point) {
    super();
    this.container = container;
    this.offset = offset;
    this.pivot = anchor;
  }
}

export class Starfield extends Component {}

export class Velocity extends Component {
  vector: Point;
  rate: number;
  constructor(vector?: Point, rate?: number) {
    super();
    this.vector = vector;
    this.rate = rate;
  }
}
