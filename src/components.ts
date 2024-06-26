import { Component, ComponentTypes } from 'ecsf';
// import { LineRange, QuadTree, IRange } from 'fqtree';
import { Container, Graphics, Sprite, Transform as PTransform } from 'pixi.js';
import { Vector2 } from 'evjkit';
import { Executor } from 'behavey';
import { Animation } from './utils/animation';

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

export class Spatial extends Component {
  x!: number;
  y!: number;
  get id() {
    return this.owner;
  }
}

export class Qtree extends Component {}

export class Resource<T> extends Component {
  value!: T
}

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
