// Point.js - Point class and segment intersection for Sketch Curves React
// Restored and documented for clarity (2024)
// Author: [Your Name or Team]
//
// This file contains the Point class (for control points) and a helper for segment intersection.
// All methods and helpers are documented for maintainability.

/**
 * Point class represents a control point on a curve.
 * type: 0 = normal, 1 = mid, etc.
 */
export class Point {
  /**
   * @param {{x:number, y:number, type?:number}} param0
   */
  constructor({ x, y, type = 0 }) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
    /** @type {number} */
    this.type = type; // 0: normal, 1: mid, etc.
    /** @type {boolean} */
    this.isDragging = false;
    /** @type {boolean} */
    this.isSelected = false;
  }
  /**
   * Hit test: returns true if (x, y) is within the hit area of this point.
   * The hit area is proportional to the line width for better touch interaction.
   * @param {number} x
   * @param {number} y
   * @param {number} lineWidth - The current line width of the curve
   * @returns {boolean}
   */
  hitTest(x, y, lineWidth = 5) {
    const hitRadius = Math.max(20, lineWidth * 2); // Minimum 20px radius, or 2x line width
    const dx = this.x - x;
    const dy = this.y - y;
    return (dx * dx + dy * dy) <= hitRadius * hitRadius;
  }
}

/**
 * Returns true if line segments p1-p2 and q1-q2 intersect.
 * Uses the "ccw" (counter-clockwise) test.
 * @param {{x:number, y:number}} p1
 * @param {{x:number, y:number}} p2
 * @param {{x:number, y:number}} q1
 * @param {{x:number, y:number}} q2
 * @returns {boolean}
 */
export function doSegmentsIntersect(p1, p2, q1, q2) {
  function ccw(a, b, c) {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  }
  return (
    ccw(p1, q1, q2) !== ccw(p2, q1, q2) &&
    ccw(p1, p2, q1) !== ccw(p1, p2, q2)
  );
} 