import { utils } from 'pixi.js';

const clamp = (a, min, max) => Math.max(Math.min(a, max), min);

import { csClip } from 'csclip';

/**
 * a more efficient calculation if all you need is to compare relative distances.
 * @param {Point} a - Parameter description.
 * @param {Point} b - Parameter description.
 * @returns {Number} Return description.
 */
export const distanceSq = (a, b) => {
  return (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
};

// export class Point {
//   type = 0;
//   constructor(x, y, data) {
//     this.x = x;
//     this.y = y;
//     this.data = data;
//     this.parent = null;
//   }
// }

// export class QtRange {
//   type = 1;
//   constructor(range, data) {
//     this.bounds = range;
//     this.data = data;
//     this.parents = [];
//   }
// }

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

  contains(point) {
    return (
      point.x >= this.left &&
      point.x <= this.right &&
      point.y >= this.top &&
      point.y <= this.bottom
    );
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

  contains(point) {
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
  // contains(point) {
  //   const dSq = (this.x - point.x) ** 2 + (this.y - point.y) ** 2;
  //   return dSq <= this.r2;
  // }

  // intersects(bounds) {
  //   // Find the closest point to the circle within the rectangle
  //   const closestX = clamp(this.x, bounds.left, bounds.right);
  //   const closestY = clamp(this.y, bounds.top, bounds.bottom);

  //   // Calculate the distance between the circle's center and this closest point
  //   const distanceX = this.x - closestX;
  //   const distanceY = this.y - closestY;

  //   // If the distance is less than the circle's radius, an intersection occurs
  //   const distanceSquared = distanceX * distanceX + distanceY * distanceY;
  //   return distanceSquared < this.r2;
  // }
}

export class LineRange {
  constructor(from, to) {
    this.from = from;
    this.to = to;
  }

  intersects(bounds) {
    // console.log('lr:i::before', this, bounds);
    const resp = csClip(this, bounds);
    // console.log('lr:i::after', resp);
    return resp;
  }
}


let nextId = 1;

export class QuadTree {
  id = 0;
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
    this.id = nextId++;
    this.boundary = boundary;
    this.capacity = capacity;
    this.root = root ?? this;
  }

  subdivide = () => {
    const { x, y, w, h } = this.boundary.bounds;
    const ne = new RectangleRange(x + w / 2, y - h / 2, w / 2, h / 2);
    const nw = new RectangleRange(x - w / 2, y - h / 2, w / 2, h / 2);
    const se = new RectangleRange(x + w / 2, y + h / 2, w / 2, h / 2);
    const sw = new RectangleRange(x - w / 2, y + h / 2, w / 2, h / 2);
    this.ne = new QuadTree(ne, this.capacity, this.root);
    this.nw = new QuadTree(nw, this.capacity, this.root);
    this.se = new QuadTree(se, this.capacity, this.root);
    this.sw = new QuadTree(sw, this.capacity, this.root);
  };

  insert = spatial => {
    // console.log('inserting', spatial.owner)
    return spatial.point
      ? this._insertPoints([spatial])
      : spatial.range
      ? this._insertRanges([spatial])
      : this._insertLines([spatial]);
  };

  insertMany = spatials => {
    const [points, ranges, lines] = spatials.reduce(
      ([points, ranges, lines], spatial) =>
        spatial.point
          ? [[...points, spatial], ranges, lines]
          : spatial.range
          ? [points, [...ranges, spatial], lines]
          : [points, ranges, [...lines, spatial]],
      [[], [], []]
    );
    this._insertPoints(points);
    this._insertRanges(ranges);
    this._insertLines(lines);
  };

  _insertPoints = spatials => {
    let [insertable, rejected] = spatials.reduce(
      ([insertable, rejected], spatial) => {
        if (!this.boundary.contains(spatial.point))
          return [insertable, [...rejected, spatial]];

        if (this.points.length < this.capacity && !this.divided) {
          this.points.push(spatial);
          spatial.parents = [this];
          return [insertable, rejected];
        } else {
          if (!this.divided) {
            this.subdivide();
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
  };

  _insertRanges = spatials => {
    // console.log(this.id, 'inserting...')
    let [insertable, rejected] = spatials.reduce(
      ([insertable, rejected], spatial) => {
        if (!this.boundary.intersects(spatial.range)) {
          // console.log(this.id, 'cannot fit', range)
          return [insertable, [...rejected, spatial]];
        }

        if (this.ranges.length < this.capacity && !this.divided) {
          // console.log(this.id, 'can fit', range.bounds, this.boundary);
          this.ranges.push(spatial);
          spatial.parents.push(this);
          return [[...insertable, spatial], rejected];
        } else {
          if (!this.divided) {
            this.subdivide();
            this.divided = true;
            insertable = [...insertable, ...this.ranges];
            this.ranges = [];
          }
          // the range belongs here, but cant fit on this tier
          return [[...insertable, spatial], rejected];
        }
      },
      [[], []]
    );

    if (!this.divided) {
      // ranges return everything unlike points
      return [...insertable, ...rejected];
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
      return [...rejected, ...remaining];
    }
  };

  _insertLines = spatials => {
    // console.log(this.id, 'inserting line...')
    let [insertable, rejected] = spatials.reduce(
      ([insertable, rejected], spatial) => {
        if (!spatial.line.intersects(this.boundary)) {
          // console.log(this.id, 'cannot fit', spatial)
          return [insertable, [...rejected, spatial]];
        }

        // console.log('should fit...')

        if (this.lines.length < this.capacity && !this.divided) {
          // console.log(this.id, 'can fit', spatial.line, this.boundary);
          this.lines.push(spatial);
          spatial.parents.push(this);
          return [[...insertable, spatial], rejected];
        } else {
          if (!this.divided) {
            this.subdivide();
            this.divided = true;
            insertable = [...insertable, ...this.lines];
            this.lines = [];
          }
          // the line belongs here, but cant fit on this tier
          return [[...insertable, spatial], rejected];
        }
      },
      [[], []]
    );

    // console.log('after fit test')

    if (!this.divided) {
      // lines like ranges return everything
      return [...insertable, ...rejected];
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
      return [...rejected, ...remaining];
    }
  };

  query = (range, found = new Set()) => {
    if (!range.intersects(this.boundary)) return found;

    this.points.forEach(p => range.contains(p.point) && found.add(p));
    this.ranges.forEach(r => range.intersects(r.range) && found.add(r));
    this.lines.forEach(l => l.line.intersects(range) && found.add(l));

    if (this.divided) {
      this.nw.query(range, found);
      this.ne.query(range, found);
      this.sw.query(range, found);
      this.se.query(range, found);
    }

    return found;
  };

  remove = spatial => {
    return spatial.point
      ? this._removePoint(spatial)
      : spatial.range
      ? this._removeRange(spatial)
      : this._removeLine(spatial);
  };

  _removePoint = spatial => {
    this.points = this.points.filter(p => p.owner !== spatial.owner);
  };

  _removeRange = spatial => {
    this.ranges = this.ranges.filter(r => r.owner !== spatial.owner);
  };

  _removeLine = spatial => {
    this.lines = this.lines.filter(l => l.owner !== spatial.owner);
  };

  update = spatial => {
    return spatial.point
      ? this._updatePoint(spatial)
      : spatial.range
      ? this._updateRange(spatial)
      : this._updateLine(spatial);
  };

  _updatePoint = spatial => {
    if (!spatial.parents[0].boundary.contains(spatial.point)) {
      spatial.parents[0].remove(spatial);
      spatial.parents = [];
      this.root.insert(spatial);
      return true;
    }
    return false;
  };

  _updateRange = spatial => {
    const invalid = spatial.parents.reduce((invalid, parent) => {
      return invalid || !parent.boundary.intersects(spatial.range);
    }, false);

    if (invalid) {
      spatial.parents.forEach(parent => {
        parent.remove(spatial);
      });
      spatial.parents = [];
      this.root.insert(spatial);
    }

    return invalid;
  };

  _updateLine = spatial => {
    const invalid = spatial.parents.reduce((invalid, parent) => {
      return invalid || !spatial.line.intersects(parent.boundary);
    }, false);

    if (invalid) {
      spatial.parents.forEach(parent => {
        parent.remove(spatial);
      });
      spatial.parents = [];
      this.root.insert(spatial);
    }

    return invalid;
  };

  show = (graphics, tier = 1) => {
    const { x, y, w, h } = this.boundary.bounds;
    let r = ((this.boundary.x / window.innerWidth) * 200.0 + 55) / 255.0;
    let g = (((tier * 32) % 127) + 127.0) / 255.0;
    let b = ((this.boundary.y / window.innerHeight) * 200.0 + 55) / 255.0;

    graphics
      .lineStyle({ width: 1.0, color: utils.rgb2hex([r, g, b]) })
      .drawRect(x - w, y - h, w * 2, h * 2);

    if (this.divided) {
      this.ne.show(graphics, tier + 1);
      this.nw.show(graphics, tier + 1);
      this.se.show(graphics, tier + 1);
      this.sw.show(graphics, tier + 1);
    }
  };
}
