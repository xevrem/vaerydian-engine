import { Component, ComponentTypes } from 'ecsf';
// import { LineRange, QuadTree, Range } from 'utils/quadtree';
import { Container, Graphics, Sprite, Transform as PTransform } from 'pixi.js';
import { Vector2 } from 'utils/vector';
import { Animation } from 'utils/animation';
import { Executor } from 'behavey';

export class Animatable<C extends ComponentTypes> extends Component {
  value!: Animation<C>;
}

export class Behavior<
  Meta extends any = void,
  EType extends any = any,
> extends Component {
  value!: Executor<Meta, EType>;
}

export class CameraFocus extends Component {}

export class Controllable extends Component {}

export class Image extends Component {
  asset!: Sprite;
}

export class Player extends Component {}

export class Position extends Component {
  value!: Vector2;
}

export class GraphicsRender extends Component {
  graphics!: Graphics;
}

export class Heading extends Component {
  value!: Vector2;
}

export class Layers extends Component {
  value!: number;
}

// export class QtSpatial extends Component {
//   point!: Vector2;
//   parents!: Array<QuadTree>;
//   range!: Range;
//   line!: LineRange;
// }

export class Qtree extends Component {}

export class Rotation extends Component {
  value!: number;
  offset!: number;
  rate!: number;
}

export class Scene extends Component {
  asset!: Container;
  offset!: Vector2;
  pivot!: Vector2;
}

export class Starfield extends Component {}

export class Transform extends Component {
  value!: PTransform;
}

export class Velocity extends Component {
  vector!: Vector2;
  rate!: number;
}
