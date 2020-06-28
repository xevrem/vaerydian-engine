// import { Point } from 'pixi.js';

export class Vector {
  static rotateVectorDegrees(
    vector: PIXI.Point,
    angleDegrees: number
  ): PIXI.Point {
    const angle: number = Vector.angleToRad(angleDegrees);

    return new PIXI.Point(
      vector.x * Math.cos(angle) - vector.y * Math.sin(angle),
      vector.x * Math.sin(angle) + vector.y * Math.cos(angle)
    );
  }

  static angleToRad(angleDegrees: number): number {
    return ((2.0 * Math.PI) / 360.0) * angleDegrees;
  }

  static add(a: PIXI.Point, b: PIXI.Point): PIXI.Point {
    return new PIXI.Point(a.x + b.x, a.y + b.y);
  }

  static sub(a: PIXI.Point, b: PIXI.Point): PIXI.Point {
    return new PIXI.Point(a.x - b.x, a.y - b.y);
  }

  static mult(a: PIXI.Point, b: PIXI.Point): PIXI.Point {
    return new PIXI.Point(a.x * b.x, a.y * b.y);
  }

  static div(a: PIXI.Point, b: PIXI.Point): PIXI.Point {
    return new PIXI.Point(a.x / b.x, a.y / b.y);
  }

  static multScalar(a: PIXI.Point, scalar: number): PIXI.Point {
    return new PIXI.Point(a.x * scalar, a.y * scalar);
  }

  static normalize(vec: PIXI.Point): PIXI.Point {
    const val: number = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if (val === 0) return new PIXI.Point(0, 0);
    return new PIXI.Point(vec.x / val, vec.y / val);
  }

  static normalizeMag(vec: PIXI.Point): NormTuple {
    const val: number = Math.sqrt(vec.x * vec.x + vec.y * vec.y);
    if (val === 0) return [new PIXI.Point(0, 0), 0];
    return [new PIXI.Point(vec.x / val, vec.y / val), val];
  }

  static distance(a: PIXI.Point, b: PIXI.Point): number {
    return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
  }
}

export type NormTuple = [PIXI.Point, number];
