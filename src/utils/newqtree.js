import { distanceSq } from 'utils/utils';
import { qtClip } from 'utils/csclip';
import { SHAPE } from 'utils/constants';
import clamp from 'lodash/clamp';


export class Spatial {
  constructor({ data, point, range, line }) {
    this.data = data;
    this.parents = [];
    this.point = point;
    this.range = range;
    this.line = line;
  }
}

export class RectangleRange {
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
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

  get bounds() {
    return {
      x: this.x,
      y: this.y,
      w: this.w,
      h: this.h,
    };
  }

  containsPoint(point) {
    return (
      point.x >= this.left &&
      point.x <= this.right &&
      point.y >= this.top &&
      point.y <= this.bottom
    );
  }

  containsRange(range) {
    return (
      range.left > this.left &&
      range.right < this.right &&
      range.top > this.top &&
      range.bottom < this.bottom
    );
  }

  containsLine(line) {
    return this.containsPoint(line.from) && this.containsPoint(line.to);
  }

  intersects(bounds) {
    return !(
      bounds.left > this.right ||
      bounds.right < this.left ||
      bounds.top > this.bottom ||
      bounds.bottom < this.top
    );
  }
}

export class CircleRange {
  constructor(x, y, r) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.r2 = r * r;
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

  get bounds() {
    return {
      x: this.x,
      y: this.y,
      w: this.r,
      h: this.r,
      r: this.r,
    };
  }

  containsPoint(point) {
    const distSq = distanceSq(this, point);
    return distSq < this.r2;
  }

  intersects(bounds) {
    // Find the closest point to the circle within the rectangle
    const minX = clamp(this.x, bounds.left, bounds.right);
    const minY = clamp(this.y, bounds.top, bounds.bottom);
    const distSq = distanceSq(this, { x: minX, y: minY });
    return distSq < this.r2;
  }
}

export class LineRange {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  intersects(bounds) {
    // console.log('lr:i::before', this, bounds);
    const resp = qtClip(this, bounds);
    // console.log('lr:i::after', resp);
    return resp;
  }
}

/**
 * A Quadtree for spatial searching.
 * @param {RectangleRange} boundary - this QuadTree's bounds
 * @param {Number} capacity - how many points this quadtree can hold
 * @param {QuadTree} root - QuadTree's root Instance (only used for subdivisions)
 */
export class QuadTree {
  boundary = null;
  capacity = 4;
  points = [];
  ranges = [];
  lines = [];
  divided = false;
  root = null;
  ne = null;
  nw = null;
  se = null;
  sw = null;

  constructor(boundary, capacity = 4, root = null) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.root = root ?? this;
  }

  destroy() {
    this.points = null;
    this.boundary = null;
    this.root = null;
    this.ne && this.ne.destroy();
    this.nw && this.nw.destroy();
    this.se && this.se.destroy();
    this.sw && this.sw.destroy();
  }

  reset(bounds = this.boundary) {
    // store bounds temporarily in case they need to be persisted
    const tempBounds = bounds;
    this._reset();
    this.root = this;
    this.boundary = tempBounds;
  }

  _reset() {
    this.points = [];
    this.ranges = [];
    this.lines = [];
    this.divided = false;
    this.boundary = null;
    this.root = null;
    this.ne && this.ne._reset();
    this.nw && this.nw._reset();
    this.se && this.se._reset();
    this.sw && this.sw._reset();
    this.ne = null;
    this.nw = null;
    this.se = null;
    this.sw = null;
  }

  subdivide(from) {
    // console.log('subdividing...', from);
    const { x, y, w, h } = this.boundary.bounds;
    const ne = new RectangleRange(x + w / 2, y - h / 2, w / 2, h / 2);
    const nw = new RectangleRange(x - w / 2, y - h / 2, w / 2, h / 2);
    const se = new RectangleRange(x + w / 2, y + h / 2, w / 2, h / 2);
    const sw = new RectangleRange(x - w / 2, y + h / 2, w / 2, h / 2);
    this.ne = new QuadTree(ne, this.capacity, this.root);
    this.nw = new QuadTree(nw, this.capacity, this.root);
    this.se = new QuadTree(se, this.capacity, this.root);
    this.sw = new QuadTree(sw, this.capacity, this.root);
  }

  isInserted(spatial) {
    let inserted = false;
    this.point
      ? this.points.forEach(
          (point) => (inserted = inserted || point.data.id === spatial.data.id)
        )
      : this.range
      ? this.ranges.forEach(
          (range) => (inserted = inserted || range.data.id === spatial.data.id)
        )
      : this.lines.forEach(
          (line) => (inserted = inserted || line.data.id === spatial.data.id)
        );
    // console.log('qt:ii::', spatial.data.id, inserted);
    return inserted;
  }

  insert(spatial) {
    // console.log('inserting', spatial.owner)
    return spatial.point
      ? this._insertPoints([spatial])
      : spatial.range
      ? this._insertRanges([spatial])
      : this._insertLines([spatial]);
  }

  insertMany(spatials) {
    const [points, ranges, lines] = spatials.reduce(
      ([points, ranges, lines], spatial) =>
        spatial.point
          ? [points.concat(spatial), ranges, lines]
          : spatial.range
          ? [points, ranges.concat(spatial), lines]
          : [points, ranges, lines.concat(spatial)],
      [[], [], []]
    );
    // console.log('qt:im::', spatials);
    this._insertPoints(points);
    this._insertRanges(ranges);
    this._insertLines(lines);
  }

  _insertPoints(spatials) {
    let [insertable, rejected] = spatials.reduce(
      ([insertable, rejected], spatial) => {
        if (!this.boundary.containsPoint(spatial.point))
          return [insertable, [...rejected, spatial]];

        if (this.points.length < this.capacity && !this.divided) {
          this.points.push(spatial);
          spatial.parents = [this];
          return [insertable, rejected];
        } else {
          if (!this.divided) {
            this.subdivide('points');
            this.divided = true;
            insertable = [...insertable, ...this.points];
            this.points = [];
          }
          // the point belongs here, but cant fit on this tier
          return [[...insertable, spatial], rejected];
        }
      },
      [[], []]
    );

    if (!this.divided) {
      // we should have already inserted all nodes just return the rejected
      // !!insertable.length && console.log('WHAT?!');
      return rejected;
    } else {
      // place them in rejected and pass to children
      let remaining = !!insertable.length
        ? this.ne._insertPoints(insertable)
        : [];
      remaining = !!remaining.length
        ? this.nw._insertPoints(remaining)
        : remaining;
      remaining = !!remaining.length
        ? this.se._insertPoints(remaining)
        : remaining;
      remaining = !!remaining.length
        ? this.sw._insertPoints(remaining)
        : remaining;
      // return anything that couldn't fit
      return [...rejected, ...remaining];
    }
  }

  _insertRanges(spatials) {
    // console.log(this.id, 'inserting...')
    let [insertable, rejected] = spatials.reduce(
      ([insertable, rejected], spatial) => {
        if (!this.boundary.intersects(spatial.range)) {
          // console.log(this.id, 'cannot fit', range)
          return [insertable, rejected.concat(spatial)];
        }

        // we want to use points over lines as points are the main
        // detector of subdivision
        if (this.points.length < this.capacity && !this.divided) {
          // console.log(this.id, 'can fit', range.bounds, this.boundary);
          this.ranges.push(spatial);
          spatial.parents.push(this);
          return [insertable.concat(spatial), rejected];
        } else {
          if (!this.divided) {
            this.subdivide('range');
            this.divided = true;
            insertable = insertable.concat(this.ranges);
            this.ranges = [];
          }
          // the range belongs here, but cant fit on this tier
          return [insertable.concat(spatial), rejected];
        }
      },
      [[], []]
    );

    if (!this.divided) {
      // ranges return everything unlike points
      return insertable.concat(rejected);
    } else {
      // place them in rejected and pass to children
      let remaining = !!insertable.length
        ? this.ne._insertRanges(insertable)
        : [];
      remaining = !!remaining.length
        ? this.nw._insertRanges(remaining)
        : remaining;
      remaining = !!remaining.length
        ? this.se._insertRanges(remaining)
        : remaining;
      remaining = !!remaining.length
        ? this.sw._insertRanges(remaining)
        : remaining;
      // return anything that couldn't fit
      return rejected.concat(remaining);
    }
  }

  _insertLines(spatials) {
    // console.log(this.id, 'inserting line...')
    let [insertable, rejected] = spatials.reduce(
      ([insertable, rejected], spatial) => {
        //
        if (!spatial.line.intersects(this.boundary)) {
          // console.log(this.id, 'cannot fit', spatial)
          return [insertable, rejected.concat(spatial)];
        }

        // we want to use points over lines as points are the main
        // detector of subdivision
        if (this.points.length < this.capacity && !this.divided) {
          // console.log(this.id, 'can fit', spatial.line, this.boundary);
          this.lines.push(spatial);
          spatial.parents.push(this);
          return [insertable.concat(spatial), rejected];
        } else {
          if (!this.divided) {
            this.subdivide('line');
            this.divided = true;
            insertable = insertable.concat(this.lines);
            this.lines = [];
          }
          // the line belongs here, but cant fit on this tier
          return [insertable.concat(spatial), rejected];
        }
      },
      [[], []]
    );

    // console.log('after fit test')

    if (!this.divided) {
      // lines like ranges return everything
      return insertable.concat(rejected);
    } else {
      // place them in rejected and pass to children
      let remaining = !!insertable.length
        ? this.ne._insertLines(insertable)
        : [];
      remaining = !!remaining.length
        ? this.nw._insertLines(remaining)
        : remaining;
      remaining = !!remaining.length
        ? this.se._insertLines(remaining)
        : remaining;
      remaining = !!remaining.length
        ? this.sw._insertLines(remaining)
        : remaining;
      // return anything that couldn't fit
      return rejected.concat(remaining);
    }
  }

  contains(spatial) {
    return spatial.point
      ? this.boundary.containsPoint(spatial.point)
      : spatial.range
      ? this.boundary.containsRange(spatial.range)
      : this.boundary.containsLine(spatial.line);
  }

  query(range, found = new Set()) {
    if (!range.intersects(this.boundary)) return found;

    this.points.forEach((p) => range.containsPoint(p.point) && found.add(p));
    this.ranges.forEach((r) => r.range.intersects(range) && found.add(r));
    this.lines.forEach((l) => l.line.intersects(range) && found.add(l));

    if (this.divided) {
      this.nw.query(range, found);
      this.ne.query(range, found);
      this.sw.query(range, found);
      this.se.query(range, found);
    }

    return found;
  }

  remove(spatial) {
    return spatial.point
      ? this._removePoint(spatial)
      : spatial.range
      ? this._removeRange(spatial)
      : this._removeLine(spatial);
  }

  _removePoint(spatial) {
    this.points = this.points.filter((p) => p.data.id !== spatial.data.id);
  }

  _removeRange(spatial) {
    this.ranges = this.ranges.filter((r) => r.data.id !== spatial.data.id);
  }

  _removeLine(spatial) {
    this.lines = this.lines.filter((l) => l.data.id !== spatial.data.id);
  }

  removeByIds(removedIds) {
    this.points = this.points.filter((p) => !removedIds.includes(p.data.id));
    this.ranges = this.ranges.filter((r) => !removedIds.includes(r.data.id));
    this.lines = this.lines.filter((l) => !removedIds.includes(l.data.id));
    this.ne && this.ne.removeByIds(removedIds);
    this.nw && this.nw.removeByIds(removedIds);
    this.se && this.se.removeByIds(removedIds);
    this.sw && this.sw.removeByIds(removedIds);
  }

  removeMany(spatials) {
    console.log('qt:rm');
    spatials.forEach((spatial) => {
      spatial.parents.forEach((parent) => {
        parent.remove(spatial);
      });
      spatial.parents = [];
    });
  }

  update(spatial) {
    return spatial.point
      ? this._updatePoint(spatial)
      : spatial.range
      ? this._updateRange(spatial)
      : this._updateLine(spatial);
  }

  _updatePoint(spatial) {
    if (!spatial.parents[0].boundary.contains(spatial.point)) {
      spatial.parents[0].remove(spatial);
      spatial.parents = [];
      this.root.insert(spatial);
      return true;
    }
    return false;
  }

  _updateRange(spatial) {
    const invalid = spatial.parents.reduce((invalid, parent) => {
      return invalid || !parent.boundary.intersects(spatial.range);
    }, false);

    if (invalid) {
      spatial.parents.forEach((parent) => {
        parent.remove(spatial);
      });
      spatial.parents = [];
      this.root.insert(spatial);
    }

    return invalid;
  }

  _updateLine(spatial) {
    const invalid = spatial.parents.reduce((invalid, parent) => {
      return invalid || !spatial.line.intersects(parent.boundary);
    }, false);

    if (invalid) {
      spatial.parents.forEach((parent) => {
        parent.remove(spatial);
      });
      spatial.parents = [];
      this.root.insert(spatial);
    }

    return invalid;
  }

  getAllPoints(points = new Set()) {
    this.points.forEach((point) => points.add(point));
    points = (this.ne && this.ne.getAllPoints(points)) ?? points;
    points = (this.nw && this.nw.getAllPoints(points)) ?? points;
    points = (this.se && this.se.getAllPoints(points)) ?? points;
    points = (this.sw && this.sw.getAllPoints(points)) ?? points;
    return points;
  }

  getAllRanges(ranges = new Set()) {
    this.ranges.forEach((range) => ranges.add(range));
    ranges = (this.ne && this.ne.getAllRanges(ranges)) ?? ranges;
    ranges = (this.nw && this.nw.getAllRanges(ranges)) ?? ranges;
    ranges = (this.se && this.se.getAllRanges(ranges)) ?? ranges;
    ranges = (this.sw && this.sw.getAllRanges(ranges)) ?? ranges;
    return ranges;
  }

  getAllLines(lines = new Set()) {
    this.lines.forEach((line) => lines.add(line));
    lines = (this.ne && this.ne.getAllLines(lines)) ?? lines;
    lines = (this.nw && this.nw.getAllLines(lines)) ?? lines;
    lines = (this.se && this.se.getAllLines(lines)) ?? lines;
    lines = (this.sw && this.sw.getAllLines(lines)) ?? lines;
    return lines;
  }

  getAllSpatials(spatials = new Set()) {
    this.points.forEach((point) => spatials.add(point));
    this.ranges.forEach((range) => spatials.add(range));
    this.lines.forEach((line) => spatials.add(line));

    spatials = (this.ne && this.ne.getAllSpatials(spatials)) ?? spatials;
    spatials = (this.nw && this.nw.getAllSpatials(spatials)) ?? spatials;
    spatials = (this.se && this.se.getAllSpatials(spatials)) ?? spatials;
    spatials = (this.sw && this.sw.getAllSpatials(spatials)) ?? spatials;
    return spatials;
  }

  reinsertAll(newBounds, spatials = this.getAllSpatials()) {
    // clear structure, update bounds, and insert all the exising or
    // provided spatials
    this.reset();
    this.boundary = newBounds;
    this.insertMany(Array.from(spatials));
  }

  show(graphics) {
    // console.log('qt:s', this.boundary);
    graphics
      .clear()
      .lineStyle({ width: 10, color: 0x2d2d2d })
      .drawRect(
        this.boundary.x - this.boundary.w,
        this.boundary.y - this.boundary.h,
        this.boundary.w * 2,
        this.boundary.h * 2
      );
  }
}
