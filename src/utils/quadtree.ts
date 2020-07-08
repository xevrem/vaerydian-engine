import { QtLine, QtPoint, QtRange } from '../components';

const clamp = (a, min, max) => Math.max(Math.min(a, max), min);


type Bounds = {
  x: number;
  y: number;
  w: number;
  h: number;
}


export class RectangleRange {
  x: number;
  y: number;
  w: number;
  h: number;

  constructor(
    x: number,
    y: number,
    w: number,
    h: number
  ){
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  get left(): number {
    return this.x - this.w;
  }

  get right(): number {
    return this.x + this.w;
  }

  get top(): number {
    return this.y - this.h;
  }

  get bottom(): number {
    return this.y + this.h;
  }

  get bounds(): Bounds {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }

  containsPoint(point: QtPoint): boolean {
    return (
      point.x >= this.left &&
      point.x <= this.right &&
      point.y >= this.top &&
      point.y <= this.bottom
    );
  }

  containsRange(range: RectangleRange): boolean {
    return (
      range.left > this.left &&
      range.right < this.right &&
      range.top > this.top &&
      range.bottom < this.bottom
    );
  }

  containsLine(line: LineRange): boolean {
    return this.containsPoint(line.from) && this.containsPoint(line.to);
  }

  intersects(bounds: RectangleRange ): boolean {
    return !(
      bounds.left > this.right ||
      bounds.right < this.left ||
      bounds.top > this.bottom ||
      bounds.bottom < this.top
    );
  }
}


export class CircleRange {
  x: number;
  y: number;
  r: number;
  r2: number;

  constructor(
    x: number,
    y: number,
    r: number
  ) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.r2 = r * r;
  }

  get left(): number {
    return this.x - this.r;
  }

  get right(): number {
    return this.x + this.r;
  }

  get top(): number {
    return this.y - this.r;
  }

  get bottom(): number {
    return this.y + this.r;
  }

  get bounds(): Bounds {
    return {
      x: this.x,
      y: this.y,
      w: this.r,
      h: this.r,
    };
  }

  containsPoint(point: PIXI.Point): boolean {
    const distSq = distanceSq(this, point);
    return distSq < this.r2;
  }

  intersects(bounds: RectangleRange): boolean {
    // Find the closest point to the circle within the rectangle
    const minX = clamp(this.x, bounds.left, bounds.right);
    const minY = clamp(this.y, bounds.top, bounds.bottom);
    const distSq = distanceSq(this, { x: minX, y: minY });
    return distSq < this.r2;
  }
}

export class LineRange {
  from: PIXI.Point
  to: PIXI.Point

  constructor(from: PIXI.Point, to: PIXI.Point) {
    this.from = from;
    this.to = to;
  }

  intersects(bounds: RectangleRange): boolean {
    // console.log('lr:i::before', this, bounds);
    const resp = qtClip(this, bounds);
    // console.log('lr:i::after', resp);
    return resp;
  }
}
