import { Point } from 'pixi.js';

/**
 * region code used for bitwise comparisons
 * @typedef {int} OutCode
 */
const INSIDE = 0; // 0000
const LEFT = 1; // 0001
const RIGHT = 2; // 0010
const BOTTOM = 4; // 0100
const TOP = 8; // 1000

/**
 * the algorithm divides a two-dimensional space into 9 regions and then
 * efficiently determines the lines and portions of lines that are visible
 * in the central region of interest (the viewport).
 * https://en.wikipedia.org/wiki/Cohen-Sutherland_algorithm
 * @param {Object} line - Parameter description.
 * @param {RectangleRange} bounds - a rectangular range.
 * @returns {boolean} true if the line segment clips the viewport false if not.
 */
export const csClip = (line, bounds) => {
  return CohenSutherlandLineClipAndDraw(line.from, line.to, bounds);
  // line.from.x,
  // line.from.y,
  // line.to.x,
  // line.to.y,
  // bounds.left,
  // bounds.right,
  // bounds.top,
  // bounds.bottom
  // );
};

/**
 * Compute the bit code for a point (x, y) using the clip rectangle
 * bounded diagonally by (xmin, ymin), and (xmax, ymax)
 * @param {Number} x - point x coordinate.
 * @param {Number} y - point y coordinate.
 * @param {Number} xmin - viewport xmin.
 * @param {Number} xmax - viewport xmax.
 * @param {Number} ymin - viewport ymin.
 * @param {Number} ymax - viewport ymax.
 * @returns {OutCode} appropriate OutCode for the point.
 */
const ComputeOutCode = (
  point,
  bounds
  // x, y, xmin, xmax, ymin, ymax
) => {
  let code;

  code = INSIDE; // initialised as being inside of [[clip window]]

  if (point.x < bounds.left)
    // to the left of clip window
    code |= LEFT;
  else if (point.x > bounds.right)
    // to the right of clip window
    code |= RIGHT;
  if (point.y > bounds.bottom)
    // below the clip window
    code |= BOTTOM;
  else if (point.y < bounds.top)
    // above the clip window
    code |= TOP;

  return code;
};

//
/**
 * Cohen–Sutherland clipping algorithm clips a line from
 * P0 = (x0, y0) to P1 = (x1, y1) against a rectangle with
 * diagonal from (xmin, ymin) to (xmax, ymax).
 * @param {Number} x0 - P0 x coordinate.
 * @param {Number} y0 - P0 y coordinate.
 * @param {Number} x1 - P1 x coordinate
 * @param {Number} y1 - P1 y coordinate.
 * @param {Number} xmin - viewport xmin.
 * @param {Number} xmax - viewport xmax.
 * @param {Number} ymin - viewport ymin.
 * @param {Number} ymax - viewport ymax.
 * @returns {Boolean} true if the line segment clips the viewport false if not.
 */
const CohenSutherlandLineClipAndDraw = (
  from,
  to,
  bounds
  // x0,
  // y0,
  // x1,
  // y1,
  // xmin,
  // xmax,
  // ymin,
  // ymax
): void =>  {
  // compute outcodes for P0, P1, and whatever point lies outside the clip rectangle
  let outcode0 = ComputeOutCode(from, bounds); //x0, y0, xmin, xmax, ymin, ymax);
  let outcode1 = ComputeOutCode(to, bounds); //x1, y1, xmin, xmax, ymin, ymax);
  let accept = false;

  const p0 = new Point(from.x, from.y);
  const p1 = new Point(to.x, to.y);

  while (true) {
    if (!(outcode0 | outcode1)) {
      // bitwise OR is 0: both points inside window; trivially accept and exit loop
      accept = true;
      break;
    } else if (outcode0 & outcode1) {
      // bitwise AND is not 0: both points share an outside zone (LEFT, RIGHT, TOP,
      // or BOTTOM), so both must be outside window; exit loop (accept is false)
      break;
    } else {
      // failed both tests, so calculate the line segment to clip
      // from an outside point to an intersection with clip edge
      let x, y;

      // At least one endpoint is outside the clip rectangle; pick it.
      let outcodeOut = outcode0 ? outcode0 : outcode1;

      // Now find the intersection point;
      // use formulas:
      //   slope = (y1 - y0) / (x1 - x0)
      //   x = x0 + (1 / slope) * (ym - y0), where ym is ymin or ymax
      //   y = y0 + slope * (xm - x0), where xm is xmin or xmax
      // No need to worry about divide-by-zero because, in each case, the
      // outcode bit being tested guarantees the denominator is non-zero
      if (outcodeOut & TOP) {
        // point is above the clip window
        // x = x0 + ((x1 - x0) * (ymax - y0)) / (y1 - y0);
        // y = ymax;
        x = p0.x + ((p1.x - p0.x) * (bounds.top - p0.y)) / (p1.y - p0.y);
        y = bounds.top;
      } else if (outcodeOut & BOTTOM) {
        // point is below the clip window
        // x = x0 + ((x1 - x0) * (ymin - y0)) / (y1 - y0);
        // y = ymin;
        x = p0.x + ((p1.x - p0.x) * (bounds.bottom - p0.y)) / (p1.y - p0.y);
        y = bounds.bottom;
      } else if (outcodeOut & RIGHT) {
        // point is to the right of clip window
        // y = y0 + ((y1 - y0) * (xmax - x0)) / (x1 - x0);
        // x = xmax;
        y = p0.y + ((p1.y - p0.y) * (bounds.right - p0.x)) / (p1.x - p0.x);
        x = bounds.right;
      } else if (outcodeOut & LEFT) {
        // point is to the left of clip window
        // y = y0 + ((y1 - y0) * (xmin - x0)) / (x1 - x0);
        // x = xmin;
        y = p0.y + ((p1.y - p0.y) * (bounds.left - p0.x)) / (p1.x - p0.x);
        x = bounds.left;
      }

      // Now we move outside point to intersection point to clip
      // and get ready for next pass.
      if (outcodeOut === outcode0) {
        // x0 = x;
        // y0 = y;
        // outcode0 = ComputeOutCode(x0, y0, xmin, xmax, ymin, ymax);
        p0.set(x, y);
        outcode0 = ComputeOutCode(p0, bounds);
      } else {
        // x1 = x;
        // y1 = y;
        // outcode1 = ComputeOutCode(x1, y1, xmin, xmax, ymin, ymax);
        p1.set(x, y);
        outcode1 = ComputeOutCode(p1, bounds);
      }
    }
  }
  if (accept) {
    // either the full or partial line is within the viewport
    return true;
  } else {
    // the line is outside the viewport
    return false;
  }
};
