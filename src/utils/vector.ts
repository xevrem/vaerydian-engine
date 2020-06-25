import { Point } from 'pixi.js';

export class Vector {
  static rotateVectorDegrees(vector: Point, angleDegrees: number): Point {
    const angle: number = Vector.angleToRad(angleDegrees);

    return new Point(
      vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
      vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
    );
  }

  static angleToRad(angleDegrees: number): number {
    return ((2.0 * Math.PI) / 360.0) * angleDegrees;
  }

  static add(a: Point, b: Point): Point {
    return new Point(a.x + b.x, a.y + b.y);
  }

  static sub(a: Point, b: Point): Point {
    return new Point(a.x - b.x, a.y - b.y);
  }

  static mult(a: Point, b: Point): Point {
    return new Point(a.x * b.x, a.y * b.y);
  }

  static div(a: Point, b: Point): Point {
    return new Point(a.x / b.x, a.y / b.y);
  }

  static multScalar(a: Point, scalar: number) {
    return new Point(a.x * scalar, a.y * scalar);
  }

  static normalize(vec: Point) {
    const val: number = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if (val === 0) return new Point(0, 0);
    return new Point(vec.x / val, vec.y / val);
  }

  static normalizeMag(vec: Point) {
    const val: number = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if (val === 0) return [new Point(0, 0), 0];
    return [new Point(vec.x / val, vec.y / val), val];
  }
}
