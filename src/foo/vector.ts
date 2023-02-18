import { clamp } from 'lodash';
import { Point } from 'pixi.js';
import { FeatureFlags } from './features';

export declare interface PointLike {
  x: number;
  y: number;
}

export declare type NormTuple = [vec: Vector2, mag: number];

export declare type PointTuple = [x: number, y: number];

export declare interface WidthHeightLike {
  width: number;
  height: number;
}

export const DEG_TO_RAD = Math.PI / 180.0;
export const RAD_TO_DEG = 180.0 / Math.PI;

/**
 * convery degrees to radians.
 * @param  angleDegrees - angle.
 * @returns  angle in radians.
 */
export const degreesToRadians = (angleDegrees: number): number =>
  DEG_TO_RAD * angleDegrees;

/**
 * convert radians to degrees.
 * @param  angleRadians - angle.
 * @returns  angle in degrees.
 */
export const radiansToDegrees = (angleRadians: number): number =>
  RAD_TO_DEG * angleRadians;

export class Vector2 {
  x = 0;
  y = 0;

  /**
   * create a Vector2.
   * @param  x - x coordinate.
   * @param  y - y coordinate.
   */
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  equals(b: Vector2): boolean {
    return this.x === b.x && this.y === b.y;
  }

  /**
   * create a Vector2 from a point.
   * @param  point - a point.
   * @returns  the vector created from the point.
   */
  static fromPoint(point: PointLike): Vector2 {
    return new Vector2(point.x, point.y);
  }

  /**
   * create a Vector2 from a mouse event.
   * @param event - a mouse event
   * @returns  the vector created from the event.
   */
  static fromEvent(event: MouseEvent): Vector2 {
    return new Vector2(event.clientX, event.clientY);
  }

  /**
   * create Vector2 from a tuple
   * @param  tup - a tuple.
   * @returns  the vector created from the tuple.
   */
  static fromTuple(tup: PointTuple): Vector2 {
    return new Vector2(tup[0], tup[1]);
  }

  /**
   * create Vector2 - from a width-height `Object`
   * @param wh - an `Object` with `width` and `height` properties.
   * @returns - the vector created from the `Object`.
   */
  static fromWH(wh: WidthHeightLike): Vector2 {
    return new Vector2(wh.width, wh.height);
  }

  /**
   * returns a zero-vector
   * @returns  the zero vector
   */
  static get zero(): Vector2 {
    return new Vector2();
  }

  /**
   * returns a 1,1 identity-vector
   * @returns  the identity vector
   */
  static get identity(): Vector2 {
    return new Vector2(1, 1);
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * update the internal values
   * @param  x the x value
   * @param  y the y value
   */
  set(x: number, y = x): void {
    this.x = x;
    this.y = y;
  }

  setVec(a: Vector2): void {
    this.x = a.x;
    this.y = a.y;
  }

  /**
   * return a PIXI point based on this Vector.
   * @returns a Pixi point.
   */
  toPoint(): Point {
    return new Point(this.x, this.y);
  }

  /**
   * return a point object based on this Vector.
   * @returns  an object point.
   */
  toObject(): PointLike {
    return {
      x: this.x,
      y: this.y,
    };
  }

  /**
   * returns a tuple array based on this Vector.
   * @returns a point tuple
   */
  toTuple(): PointTuple {
    return [this.x, this.y];
  }

  /**
   * returns a new `Vector2` with the values clamped between `min` and `max`
   * @returns a clamped `Vector2`
   */
  clamp(min: number, max: number): Vector2 {
    return new Vector2(clamp(this.x, min, max), clamp(this.y, min, max));
  }

  /**
   * return a vector based on this rotated by radians.
   * @param  angle - angle to rotate by.
   * @returns  the rotated vector.
   */
  rotate(angle: number): Vector2 {
    const ms = this.multScalar(Math.sin(angle));
    const mc = this.multScalar(Math.cos(angle));
    return new Vector2(mc.x - ms.y, ms.x + mc.y);
  }

  /**
   * return a vector based on this rotated by degrees.
   * @param  angleDegrees - angle.
   * @returns  the rotated vector.
   */
  rotateDeg(angleDegrees: number): Vector2 {
    const angle = degreesToRadians(angleDegrees);
    return this.rotate(angle);
  }

  /**
   * add this vector to another.
   * @param  b - vector to add.
   * @returns  the new vector.
   */
  add(b: PointLike): Vector2 {
    return new Vector2(this.x + b.x, this.y + b.y);
  }

  addTuple([x, y]: PointTuple): Vector2 {
    return new Vector2(this.x + x, this.y + y);
  }

  /**
   * add a scalar to this vector
   * @param  b - scalar to add
   * @returns  the new vector
   */
  addScalar(b: number): Vector2 {
    return new Vector2(this.x + b, this.y + b);
  }

  /**
   * subtract another vector from this one.
   * @param  b - vector to subtract.
   * @returns  the new vector.
   */
  sub(b: PointLike): Vector2 {
    return new Vector2(this.x - b.x, this.y - b.y);
  }

  /**
   * subtract a scalar to this vector
   * @param  b - scalar to subtract
   * @returns  the new vector
   */
  subScalar(b: number): Vector2 {
    return new Vector2(this.x - b, this.y - b);
  }

  /**
   * multiply another vector to this one.
   * @param  b - vector to multiply.
   * @returns  the new vector.
   */
  mult(b: PointLike): Vector2 {
    return new Vector2(this.x * b.x, this.y * b.y);
  }

  /**
   * divide this vector by another vector.
   * @param  b - vector to divide.
   * @returns the new vector.
   */
  div(b: PointLike): Vector2 {
    return new Vector2(this.x / b.x, this.y / b.y);
  }

  divWH(b: WidthHeightLike): Vector2 {
    return new Vector2(this.x / b.width, this.y / b.height);
  }

  /**
   * returns a Vector2 multiplied by the scalar.
   * @param  scalar - scalar to multiply.
   * @returns  the new vector.
   */
  multScalar(scalar: number): Vector2 {
    return new Vector2(this.x * scalar, this.y * scalar);
  }

  /**
   * returns a Vector2 divided by the scalar.
   * @param  scalar - scalar to divide.
   * @returns  the new vector.
   */
  divScalar(scalar: number): Vector2 {
    return new Vector2(this.x / scalar, this.y / scalar);
  }

  /**
   * returns magnitude of vector.
   * @returns  vector's magnitude.
   */
  magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * returns a normalized version of this vector.
   * @returns  the new vector
   */
  normalize(): Vector2 {
    return this.normalizeMag()[0];
  }

  /**
   * same as normalize, but returns a tuple that includes the magnitude.
   * @returns  the normalized vector and magnitude
   */
  normalizeMag(): NormTuple {
    const mag = this.magnitude();
    if (mag === 0) return [new Vector2(), 0];
    return [this.divScalar(mag), mag];
  }

  /**
   * distance to another vector.
   * @param  b - vector to measure to.
   * @returns  distance to vector.
   */
  distanceTo(b: Vector2): number {
    return Math.sqrt(this.distanceToSq(b));
  }

  /**
   * the dot product of this vector with b.
   * @param  b - other vector for dot product.
   * @returns  the dot-product
   */
  dot(b: PointLike): number {
    return this.x * b.x + this.y * b.y;
  }

  /**
   * a more efficient calculation if all you need is to compare relative distances.
   * @param  b - vector to measure to.
   * @returns  relative distance to vector.
   */
  distanceToSq(b: Vector2): number {
    const bsub = b.sub(this);
    const bsubSq = bsub.mult(bsub);
    return bsubSq.x + bsubSq.y;
  }

  /**
   * distance from this point to the line defined by a to b
   * @param a - p1 of line
   * @param b - p2 of line
   * @returns the distance from the point at this vector to the line
   */
  distanceToLine(a: Vector2, b: Vector2): number {
    const numer = Math.abs(
      (b.x - a.x) * (a.y - this.y) - (a.x - this.x) * (b.y - a.y)
    );
    const denom = b.distanceTo(a);

    return numer / denom;
  }

  /**
   * return a vector that points from this one towards b
   * @param  b
   * @returns a vector
   */
  towards(b: Vector2): Vector2 {
    return b.sub(this);
  }

  /**
   * returns the angle of this vector. Useful in combination with towards()
   */
  angle(): number {
    return Math.atan2(this.y, this.x);
  }

  /**
   * projects this vector onto b
   * @param  b - Parameter description.
   * @return  - the projected vector
   */
  project(b: Vector2): Vector2 {
    return b.multScalar(this.dot(b) / b.dot(b));
  }

  /**
   * the scalar projection of this vector onto b
   * @param  b
   * @returns
   */
  projectScalar(b: Vector2): number {
    return this.dot(b) / b.magnitude();
  }
}

declare global {
  interface Window {
    Vector2: typeof Vector2;
  }
}

if (FeatureFlags.DEBUG_TOOLS) {
  window.Vector2 = Vector2;
}
