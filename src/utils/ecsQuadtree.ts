import { Graphics } from 'pixi.js';
import { qtClip } from 'utils/csclip';
import clamp from 'lodash/clamp';
import { Spatial } from 'modules/model/components/common';
import { HEX_COLOR } from './constants';
import { PointLike, Vector2 } from './vector';

export declare interface IRange {
  x: number;
  y: number;
  w: number;
  h: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  containsPoint(point: PointLike): boolean;
  intersects(range: IRange): boolean;
}

export declare type RectBounds = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export declare type CircleBounds = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
};

export declare type LineBounds = {
  x: number;
  y: number;
  w: number;
  h: number;
  from: PointLike;
  to: PointLike;
};

export class RectangleRange {
  x: number;
  y: number;
  w: number;
  h: number;

  /**
   * Represents a Rectangular Range.
   * @param x - x-coordinate of rectangle's center.
   * @param y - y-coordinate of rectangle's center.
   * @param w - half-width of the rectangle.
   * @param h - half-height of the rectangle.
   */
  constructor(x: number, y: number, w: number, h: number) {
    this.x = x;
    this.y = y;
    this.w = Math.abs(w);
    this.h = Math.abs(h);
  }

  get left() {
    return this.x - this.w;
  }

  get right() {
    return this.x + this.w;
  }

  get top() {
    return this.y - this.h;
  }

  get bottom() {
    return this.y + this.h;
  }

  get bounds(): RectBounds {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }

  /**
   * tests if a point is within this range.
   * @param  point - point to test.
   * @returns  true if within, false if without.
   */
  containsPoint(point: PointLike) {
    return (
      point.x >= this.left &&
      point.x <= this.right &&
      point.y >= this.top &&
      point.y <= this.bottom
    );
  }

  /**
   * tests if a range is within this range.
   * @param  range - range to test.
   * @returns  true if within, false if without.
   */
  containsRange(range: IRange) {
    return (
      range.left > this.left &&
      range.right < this.right &&
      range.top > this.top &&
      range.bottom < this.bottom
    );
  }

  /**
   * tests if a line is within this range.
   * @param  line - line to test.
   * @returns  true if within, false if without.
   */
  containsLine(line: LineRange) {
    return this.containsPoint(line.from) && this.containsPoint(line.to);
  }

  /**
   * tests if a shape is within or partially within this range.
   * @param  bounds - bounds to test.
   * @returns  true if intersection exists, otherwise false.
   */
  intersects(bounds: IRange) {
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
  w: number;
  h: number;
  /**
   * radius squared
   */
  r2: number;

  /**
   * represents a circular area range.
   * @param  x - x-coordiante of circle center.
   * @param  y - y-coordinate of circle center
   * @param  r - radius of circle.
   */
  constructor(x: number, y: number, r: number) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.r2 = r * r;
    this.w = r;
    this.h = r;
  }

  get left() {
    return this.x - this.r;
  }

  get right() {
    return this.x + this.r;
  }

  get top() {
    return this.y - this.r;
  }

  get bottom() {
    return this.y + this.r;
  }

  get bounds(): CircleBounds {
    return {
      x: this.x,
      y: this.y,
      w: this.r,
      h: this.r,
      r: this.r,
    };
  }

  /**
   * tests if a point is within this range.
   * @param  point - point to test.
   * @returns  true if within, false if without.
   */
  containsPoint(point: PointLike) {
    const distSq = Vector2.fromPoint(this).distanceToSq(
      Vector2.fromPoint(point)
    );
    return distSq < this.r2;
  }

  /**
   * tests if a shape is within or partially within this range.
   * @param  bounds - bounds to test.
   * @returns  true if intersection exists, otherwise false.
   */
  intersects(bounds: IRange) {
    // Find the closest point to the circle within the rectangle
    const minX = clamp(this.x, bounds.left, bounds.right);
    const minY = clamp(this.y, bounds.top, bounds.bottom);
    const distSq = Vector2.fromPoint(this).distanceToSq(
      new Vector2(minX, minY)
    );
    return distSq < this.r2;
  }
}

export class LineRange {
  from: PointLike;
  to: PointLike;

  /**
   * represents a line area range.
   * @param  from - starting point of line
   * @param  to - ending point of line
   */
  constructor(from: PointLike, to: PointLike) {
    this.from = from;
    this.to = to;
  }

  get left() {
    if (this.from.x < this.to.x) return this.from.x;
    else return this.to.x;
  }

  get right() {
    if (this.from.x > this.to.x) return this.from.x;
    else return this.to.x;
  }

  get top() {
    if (this.from.y < this.to.y) return this.from.y;
    else return this.to.y;
  }

  get bottom() {
    if (this.from.y > this.to.y) return this.from.y;
    else return this.to.y;
  }

  get bounds(): LineBounds {
    const left = this.left;
    const right = this.right;
    const top = this.top;
    const bottom = this.bottom;
    return {
      x: left,
      y: top,
      w: right - left,
      h: bottom - top,
      from: this.from,
      to: this.to,
    };
  }

  /**
   * tests if a shape is within or partially within this range.
   * @param  bounds - bounds to test.
   * @returns  true if intersection exists, otherwise false.
   */
  intersects(bounds: IRange) {
    const resp = qtClip(this, bounds);
    return resp;
  }
}

export class ECSQuadTree {
  id = -1;
  boundary!: RectangleRange;
  capacity = 4;
  points: Record<number, Spatial> = {};
  ranges: Record<number, Spatial> = {};
  lines: Record<number, Spatial> = {};
  divided = false;
  maxDepth!: number;
  root!: ECSQuadTree | null;
  ne!: ECSQuadTree | null;
  nw!: ECSQuadTree | null;
  se!: ECSQuadTree | null;
  sw!: ECSQuadTree | null;
  nextId = 0;

  /**
   * A Quadtree for spatial partitioning and searching.
   * @param boundary - this QuadTree's bounds
   * @param capacity - how many points this quadtree can hold
   * @param root - QuadTree's root Instance (only used for subdivisions)
   */
  constructor(
    boundary: RectangleRange,
    capacity = 4,
    maxDepth = 10,
    root?: ECSQuadTree | undefined | null
  ) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.root = root ?? this;
    this.id = this.root.nextId++;
    this.maxDepth = maxDepth;
  }

  /**
   * detroys this quadtree and its children (if any).
   */
  destroy(): void {
    this.points = {};
    this.root = null;
    if (this.divided) {
      this.ne && this.ne.destroy();
      this.nw && this.nw.destroy();
      this.se && this.se.destroy();
      this.sw && this.sw.destroy();
    }
    this.ne = null;
    this.nw = null;
    this.se = null;
    this.sw = null;
    this.divided = false;
  }

  /**
   * resets the quadtree and optionally sets new bounds.
   * @param boundary - this QuadTree's bounds
   */
  reset(bounds: RectangleRange = this.boundary): void {
    // store bounds temporarily so they can be persisted
    const tempBounds = bounds;
    this._reset();
    this.root = this;
    this.boundary = tempBounds;
  }

  /**
   * resets all the internal data for this tree and its children.
   */
  _reset(): void {
    this.points = {};
    this.ranges = {};
    this.lines = {};
    this.root = null;
    if (this.divided) {
      this.ne && this.ne._reset();
      this.nw && this.nw._reset();
      this.se && this.se._reset();
      this.sw && this.sw._reset();
    }
    this.ne = null;
    this.nw = null;
    this.se = null;
    this.sw = null;
    this.divided = false;
  }

  showQuadTreeBoundary(graphic: Graphics): void {
    if (this.divided) {
      this.ne && this.ne.showQuadTreeBoundary(graphic);
      this.nw && this.nw.showQuadTreeBoundary(graphic);
      this.se && this.se.showQuadTreeBoundary(graphic);
      this.sw && this.sw.showQuadTreeBoundary(graphic);
    } else {
      graphic.lineStyle({ width: 4, color: HEX_COLOR.QUAD_TREE_BOUNDARY });
      graphic.drawRect(
        this.boundary.x - this.boundary.w,
        this.boundary.y - this.boundary.h,
        this.boundary.w * 2,
        this.boundary.h * 2
      );
    }
  }

  /**
   * subdivide this tree into 4 new quadrants.
   */
  subdivide(): void {
    const { x, y, w, h } = this.boundary.bounds;
    const hw = Math.ceil(w / 2),
      hh = Math.ceil(h / 2);

    const ne = new RectangleRange(x + hw, y - hh, hw, hh);
    const nw = new RectangleRange(x - hw, y - hh, hw, hh);
    const se = new RectangleRange(x + hw, y + hh, hw, hh);
    const sw = new RectangleRange(x - hw, y + hh, hw, hh);
    // we insert things this way so that the points will cause the
    // appropriate number of subdivisions, that way ranges and lines
    // will be inserted most efficiently. We don't do this separation
    // in insertMany as it would have too large of a performance
    // penalty
    this.ne = new ECSQuadTree(ne, this.capacity, this.maxDepth - 1, this.root);
    this.ne.insertMany(this.getPoints());
    this.ne.insertMany(this.getRanges());
    this.ne.insertMany(this.getLines());
    this.nw = new ECSQuadTree(nw, this.capacity, this.maxDepth - 1, this.root);
    this.nw.insertMany(this.getPoints());
    this.nw.insertMany(this.getRanges());
    this.nw.insertMany(this.getLines());
    this.se = new ECSQuadTree(se, this.capacity, this.maxDepth - 1, this.root);
    this.se.insertMany(this.getPoints());
    this.se.insertMany(this.getRanges());
    this.se.insertMany(this.getLines());
    this.sw = new ECSQuadTree(sw, this.capacity, this.maxDepth - 1, this.root);
    this.sw.insertMany(this.getPoints());
    this.sw.insertMany(this.getRanges());
    this.sw.insertMany(this.getLines());
    // clear this node's internal data as we only want it
    // to exist on the leaves
    this.points = {};
    this.ranges = {};
    this.lines = {};
    // now we've successfully divided
    this.divided = true;
  }

  /**
   * insert a spatial into this tree.
   * @param spatial - spatial to insert.
   */
  insert(spatial: Spatial): void {
    if (!this.intersects(spatial)) return;
    if (this.divided) {
      this.ne && this.ne.insert(spatial);
      this.nw && this.nw.insert(spatial);
      this.se && this.se.insert(spatial);
      this.sw && this.sw.insert(spatial);
    } else {
      // insert and divide based on type of spatial
      if (spatial.point) {
        this.points[spatial.owner] = spatial;
        // if we've exceeded capacity, subdivide
        if (Object.keys(this.points).length > this.capacity && this.maxDepth) {
          this.subdivide();
        } else {
          spatial.parents = [this];
        }
      } else if (spatial.range) {
        spatial.parents.push(this);
        this.ranges[spatial.owner] = spatial;
      } else {
        spatial.parents.push(this);
        this.lines[spatial.owner] = spatial;
      }
    }
  }

  /**
   * insert all the provided spatials.
   * @param spatials - spatials to insert.
   */
  insertMany(spatials: Set<Spatial> | Array<Spatial>): void {
    spatials.forEach((spatial: Spatial) => this.insert(spatial));
  }

  /**
   * tests if this quadtree's boundary completely contains the spatial.
   * @param spatial - spatial to test.
   * @returns true if contained within the bounds, else false.
   */
  contains(spatial: Spatial): boolean {
    if (spatial.point) {
      return this.boundary.containsPoint(spatial.point);
    } else if (spatial.range) {
      return this.boundary.containsRange(spatial.range);
    } else {
      return spatial.line.reduce(
        (a: boolean, l) => a || this.boundary.containsLine(l),
        false
      );
    }
  }

  /**
   * tests if this quadtree's boundary intersects with the spatial.
   * @param spatial - spatial to test.
   * @returns true if intersects, else false.
   */
  intersects(spatial: Spatial): boolean {
    if (spatial.point) {
      return this.boundary.containsPoint(spatial.point);
    } else if (spatial.range) {
      return this.boundary.intersects(spatial.range);
    } else {
      return spatial.line.reduce(
        (a: boolean, l) => a || l.intersects(this.boundary),
        false
      );
    }
  }

  /**
   * query insertain spatial using provided range.
   * @param range - range for query
   * @param found - set to fill [default: empty Set].
   * @returns query results as a set
   */
  query(range: IRange, found: Set<Spatial> = new Set()): Set<Spatial> {
    if (!range.intersects(this.boundary)) return found;
    if (this.divided) {
      this.ne && this.ne.query(range, found);
      this.nw && this.nw.query(range, found);
      this.se && this.se.query(range, found);
      this.sw && this.sw.query(range, found);
    } else {
      this.getPoints().forEach(
        (p) => range.containsPoint(p.point) && found.add(p)
      );
      this.getRanges().forEach(
        (r) => r.range.intersects(range) && found.add(r)
      );
      this.getLines().forEach(
        (l) =>
          l.line.reduce((a, l) => a || l.intersects(range), false) &&
          found.add(l)
      );
    }
    return found;
  }

  /**
   * remove the given spatial from the quadtree.
   * @param spatial - spatial to remove.
   */
  remove(spatial: Spatial): void {
    if (this.divided) {
      this.ne && this.ne.remove(spatial);
      this.nw && this.nw.remove(spatial);
      this.se && this.se.remove(spatial);
      this.sw && this.sw.remove(spatial);
    } else {
      if (spatial.point) {
        this._removePoint(spatial);
      } else if (spatial.range) {
        this._removeRange(spatial);
      } else {
        this._removeLine(spatial);
      }
    }
  }

  /**
   * remove a point spatial.
   * @param spatial - spatial to remove.
   */
  _removePoint(spatial: Spatial): void {
    delete this.points[spatial.owner];
  }

  /**
   * remove a range spatial.
   * @param spatial - spatial to remove.
   */
  _removeRange(spatial: Spatial): void {
    delete this.ranges[spatial.owner];
  }

  /**
   * remove a line spatial.
   * @param spatial - spatial to remove.
   */
  _removeLine(spatial: Spatial): void {
    delete this.lines[spatial.owner];
  }

  /**
   * remove a spatial by id.
   * @param id - id of spatial to remove.
   */
  removeById(id: number): void {
    if (this.divided) {
      this.ne && this.ne.removeById(id);
      this.nw && this.nw.removeById(id);
      this.se && this.se.removeById(id);
      this.sw && this.sw.removeById(id);
    } else {
      delete this.points[id];
      delete this.ranges[id];
      delete this.lines[id];
    }
  }

  /**
   * remove all spatials with the provided IDs.
   * @param removedIds - array of uuids to remove.
   */
  removeByIds(removedIds: Array<number>): void {
    if (this.divided) {
      this.ne && this.ne.removeByIds(removedIds);
      this.nw && this.nw.removeByIds(removedIds);
      this.se && this.se.removeByIds(removedIds);
      this.sw && this.sw.removeByIds(removedIds);
    } else {
      removedIds.forEach((id) => {
        delete this.points[id];
        delete this.ranges[id];
        delete this.lines[id];
      });
    }
  }

  /**
   * remove many spatials from the quadtree.
   * @param spatials - spatials to remove.
   */
  removeMany(spatials: Set<Spatial> | Array<Spatial>): void {
    spatials.forEach((spatial: Spatial) => {
      spatial.parents.forEach((parent) => {
        parent.remove(spatial);
      });
      spatial.parents = [];
    });
  }

  /**
   * updates a spatial within the quadtree.
   * @param spatial - spatial to update.
   */
  update(spatial: Spatial): void {
    if (spatial.point) {
      this._updatePoint(spatial);
    } else if (spatial.range) {
      this._updateRange(spatial);
    } else {
      this._updateLine(spatial);
    }
  }

  /**
   * update a spatial point.
   * @param spatial - spatial point to update.
   */
  _updatePoint(spatial: Spatial): void {
    // if no parents, then we only need to insert
    if (!spatial.parents.length) {
      this.root && this.root.insert(spatial);
      return;
    }
    // if parents is null|undefined, or has a bad boundary, or is not
    // contained within this boundary, then
    // - remove the point from its parent
    // - clear parents
    // - reinsert range from root
    const invalid = spatial.parents.reduce((invalid, parent) => {
      invalid =
        invalid ||
        !parent ||
        !parent.boundary ||
        !parent.boundary.containsPoint(spatial.point);
      if (invalid) {
        delete parent.points[spatial.owner];
      } else {
        parent.points[spatial.owner] = spatial;
      }
      return invalid;
    }, false);

    if (invalid) {
      spatial.parents = [];
      this.root && this.root.insert(spatial);
    }
  }

  /**
   * update a spatial range.
   * @param spatial - spatial range to update.
   */
  _updateRange(spatial: Spatial): void {
    // if no parents, then we only need to insert
    if (!spatial.parents.length) {
      this.root && this.root.insert(spatial);
      return;
    }

    // if parents is null|undefined, or has a bad boundary, or is not
    // contained within this boundary, then
    // - remove the rangefrom its parent
    // - clear parents
    // - reinsert range from root
    const invalid = spatial.parents.reduce((invalid, parent) => {
      invalid =
        invalid ||
        !parent ||
        !parent.boundary ||
        !parent.boundary.intersects(spatial.range);
      if (invalid) {
        delete parent.ranges[spatial.owner];
      } else {
        parent.ranges[spatial.owner] = spatial;
      }
      return invalid;
    }, false);

    if (invalid) {
      spatial.parents = [];
      this.root && this.root.insert(spatial);
    }
  }

  /**
   * update a spatial line.
   * @param spatial - spatial line to update.
   */
  _updateLine(spatial: Spatial): void {
    // if no parents, then we only need to insert
    if (!spatial.parents.length) {
      this.root && this.root.insert(spatial);
      return;
    }
    // if parents is null|undefined, or has a bad boundary, or is not
    // contained within this boundary, then
    // - remove the rangefrom its parent
    // - clear parents
    // - reinsert line from root
    const invalid = spatial.parents.reduce((invalid, parent) => {
      invalid =
        invalid ||
        !parent ||
        !parent.boundary ||
        !spatial.line.reduce(
          (a, l) => a || l.intersects(parent.boundary),
          false
        );
      if (invalid) {
        delete parent.lines[spatial.owner];
      } else {
        parent.lines[spatial.owner] = spatial;
      }
      return invalid;
    }, false);

    if (invalid) {
      spatial.parents = [];
      this.root && this.root.insert(spatial);
    }
  }

  /**
   * returns all points within the tree.
   * @param points - optional starting set [default: empty Set].
   * @returns All contained points within the tree.
   */
  getAllPoints(points: Set<Spatial> = new Set()): Set<Spatial> {
    if (this.divided) {
      points = (this.ne && this.ne.getAllPoints(points)) ?? points;
      points = (this.nw && this.nw.getAllPoints(points)) ?? points;
      points = (this.se && this.se.getAllPoints(points)) ?? points;
      points = (this.sw && this.sw.getAllPoints(points)) ?? points;
    } else {
      this.getPoints().forEach((point) => points.add(point));
    }
    return points;
  }

  /**
   * returns all ranges within the tree.
   * @param ranges- optional starting set [default: empty Set].
   * @returns All contained ranges within the tree.
   */
  getAllRanges(ranges: Set<Spatial> = new Set()): Set<Spatial> {
    if (this.divided) {
      ranges = (this.ne && this.ne.getAllRanges(ranges)) ?? ranges;
      ranges = (this.nw && this.nw.getAllRanges(ranges)) ?? ranges;
      ranges = (this.se && this.se.getAllRanges(ranges)) ?? ranges;
      ranges = (this.sw && this.sw.getAllRanges(ranges)) ?? ranges;
    } else {
      this.getRanges().forEach((range) => ranges.add(range));
    }
    return ranges;
  }

  /**
   * returns all lines within the tree.
   * @param lines - optional starting set [default: empty Set].
   * @returns All contained lines within the tree.
   */
  getAllLines(lines: Set<Spatial> = new Set()): Set<Spatial> {
    if (this.divided) {
      lines = (this.ne && this.ne.getAllLines(lines)) ?? lines;
      lines = (this.nw && this.nw.getAllLines(lines)) ?? lines;
      lines = (this.se && this.se.getAllLines(lines)) ?? lines;
      lines = (this.sw && this.sw.getAllLines(lines)) ?? lines;
    } else {
      this.getLines().forEach((line) => lines.add(line));
    }
    return lines;
  }

  /**
   * returns all spatials within the tree.
   * @param spatials - optional starting set [default: empty Set].
   * @returns All contained spatials within the tree.
   */
  getAllSpatials(spatials: Set<Spatial> = new Set()): Set<Spatial> {
    if (this.divided) {
      spatials = (this.ne && this.ne.getAllSpatials(spatials)) ?? spatials;
      spatials = (this.nw && this.nw.getAllSpatials(spatials)) ?? spatials;
      spatials = (this.se && this.se.getAllSpatials(spatials)) ?? spatials;
      spatials = (this.sw && this.sw.getAllSpatials(spatials)) ?? spatials;
    } else {
      this.getPoints().forEach((point) => spatials.add(point));
      this.getRanges().forEach((range) => spatials.add(range));
      this.getLines().forEach((line) => spatials.add(line));
    }
    return spatials;
  }

  getPoints(): Array<Spatial> {
    return Object.values(this.points);
  }

  getRanges(): Array<Spatial> {
    return Object.values(this.ranges);
  }

  getLines(): Array<Spatial> {
    return Object.values(this.lines);
  }

  /**
   * update the bounds of the current quadtree
   * @param newBounds - the bounds for the quadtree.
   * @param spatials - optional spatials to insert [default: all previously inserted spatials]
   */
  updateBounds(
    newBounds: RectangleRange,
    spatials: Set<Spatial> = this.getAllSpatials()
  ): void {
    // clear structure, update bounds, and insert all the exising or
    // provided spatials while also clearing their parents
    this.reset(newBounds);
    spatials.forEach((spatial) => {
      spatial.parents = [];
      this.insert(spatial);
    });
  }
}
