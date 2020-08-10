import { Component } from './ecsf';
import { LayerType } from 'utils/constants';
import { LineRange, QuadTree, Range} from 'utils/quadtree';

export class Animatable extends Component {
  animation: object
  constructor(animation?: object){
    super();
    this.animation = animation;
  }
}

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

export class Heading extends Component {
  vector: PIXI.Point;
  constructor(vector?: PIXI.Point){
    super();
    this.vector = vector;
  }
}

export class Layer extends Component {
  layer: LayerType;
  constructor(layer?: LayerType) {
    super();
    this.layer = layer;
  }
}

export class QtSpatial extends Component {
  point: PIXI.Point;
  parents: Array<QuadTree>;
  range: Range;
  line: LineRange;

  constructor(point?: PIXI.Point, range?: Range, line?: LineRange) {
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
  container: PIXI.DisplayObject;
  offset: PIXI.Point;
  pivot: PIXI.Point;

  constructor(container?: PIXI.DisplayObject, offset?: PIXI.Point, anchor?: PIXI.Point) {
    super();
    this.container = container;
    this.offset = offset;
    this.pivot = anchor;
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
