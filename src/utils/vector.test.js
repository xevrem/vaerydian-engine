import { Vector2 } from './vector';
import { Point } from 'pixi.js';

describe('Vector2', () => {
  it('should instantiate without crashing', () => {
    expect(() => new Vector2()).not.toThrow();
    const vec = new Vector2(1, 2);
    expect(vec.x).toEqual(1);
    expect(vec.y).toEqual(2);
  });
  it('should be able to build from points', () => {
    const vec = Vector2.fromPoint(new Point(1, 2));
    expect(vec.x).toEqual(1);
    expect(vec.y).toEqual(2);
  });
  it('should return a point', () => {
    const point = new Point(1, 2);
    const vec = Vector2.fromPoint(point);
    const newPt = vec.toPoint();
    expect(newPt.x).toEqual(point.x);
    expect(newPt.y).toEqual(point.y);
  });

  it('should rotate by degrees', () => {
    let res = new Vector2(1, 0).rotateDeg(90);
    // do text compares since computational floating point error
    expect(Number(res.x).toFixed(5)).toEqual(Number(0).toFixed(5));
    expect(res.y).toEqual(1);
    res = new Vector2(1, 0).rotateDeg(45);
    expect(Number(res.x).toFixed(5)).toEqual(
      Number(Math.sqrt(2) / 2).toFixed(5)
    );
    expect(Number(res.y).toFixed(5)).toEqual(
      Number(Math.sqrt(2) / 2).toFixed(5)
    );
  });

  it('should rotate by radians', () => {
    let res = new Vector2(1, 0).rotate(Math.PI / 2);
    // do text compares since computational floating point error
    expect(Number(res.x).toFixed(5)).toEqual(Number(0).toFixed(5));
    expect(res.y).toEqual(1);
    res = new Vector2(1, 0).rotate(Math.PI / 4);
    expect(Number(res.x).toFixed(5)).toEqual(
      Number(Math.sqrt(2) / 2).toFixed(5)
    );
    expect(Number(res.y).toFixed(5)).toEqual(
      Number(Math.sqrt(2) / 2).toFixed(5)
    );
  });

  it('should add two vectors', () => {
    const a = new Vector2(1, -1);
    const b = new Vector2(2, -2);
    const res = a.add(b);
    expect(res.x).toEqual(3);
    expect(res.y).toEqual(-3);
  });

  it('should subtract two vectors', () => {
    const a = new Vector2(1, -1);
    const b = new Vector2(2, -2);
    const res = a.sub(b);
    expect(res.x).toEqual(-1);
    expect(res.y).toEqual(1);
  });

  it('should multiply two vectors', () => {
    const a = new Vector2(2, -3);
    const b = new Vector2(3, -5);
    const res = a.mult(b);
    expect(res.x).toEqual(6);
    expect(res.y).toEqual(15);
  });

  it('should divide two vectors', () => {
    const a = new Vector2(2, -3);
    const b = new Vector2(3, -5);
    const res = a.div(b);
    expect(res.x).toEqual(2 / 3);
    expect(res.y).toEqual(3 / 5);
  });

  it('should multiply by a scalar', () => {
    const res = new Vector2(2, -3).multScalar(5);
    expect(res.x).toEqual(10);
    expect(res.y).toEqual(-15);
  });

  it('should divide by a scalar', () => {
    const res = new Vector2(2, -3).divScalar(5);
    expect(res.x).toEqual(2 / 5);
    expect(res.y).toEqual(-3 / 5);
  });

  it('should return magnitude of a vector', () => {
    const res = new Vector2(15, 4).magnitude();
    const expected = Math.sqrt(15 * 15 + 4 * 4);
    expect(res).toEqual(expected);
  });

  it('should normalize a vector', () => {
    const res = new Vector2(15, 15).normalize();
    expect(Number(res.x).toFixed(5)).toEqual(
      Number(Math.sqrt(2) / 2).toFixed(5)
    );
    expect(Number(res.y).toFixed(5)).toEqual(
      Number(Math.sqrt(2) / 2).toFixed(5)
    );
  });

  it('should normalize a vector and return a magnitude', () => {
    const vec = new Vector2(15, 15);
    const res = vec.normalizeMag();
    expect(Number(res[0].x).toFixed(5)).toEqual(
      Number(Math.sqrt(2) / 2).toFixed(5)
    );
    expect(Number(res[0].y).toFixed(5)).toEqual(
      Number(Math.sqrt(2) / 2).toFixed(5)
    );
    expect(res[1]).toEqual(vec.magnitude());
  });

  it('should return zero vector for no magnitude for normalizeMag', () => {
    const [vec, mag] = new Vector2().normalizeMag();
    expect(vec.x).toEqual(0);
    expect(vec.y).toEqual(0);
    expect(mag).toEqual(0);
  });

  it('should compute distance to a vector', () => {
    const a = new Vector2(10, 5);
    const b = new Vector2(3, 7);
    expect(a.distanceTo(b)).toEqual(
      Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2)
    );
  });

  it('should compute relative distance to a vector', () => {
    const a = new Vector2(10, 5);
    const b = new Vector2(3, 7);
    expect(a.distanceToSq(b)).toEqual((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
  });

  it('should be able to chain computations', () => {
    const value = new Vector2(1, 2)
      .add(new Vector2(3, 4))
      .sub(new Vector2(5, 6))
      .mult(new Vector2(7, 8))
      .rotateDeg(45)
      .multScalar(15)
      .rotate(Math.PI)
      .div(new Vector2(2, 2))
      .rotateDeg(95)
      .divScalar(5)
      .normalize()
      .magnitude();
    expect(value).toEqual(1);
  });
});
