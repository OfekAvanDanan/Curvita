// Point.js - Point class and segment intersection for Sketch Curves React
// Restored and documented for clarity (2024)
// Author: [Your Name or Team]
//
// This file contains the Point class (for control points) and a helper for segment intersection.
// All methods and helpers are documented for maintainability.

/**
 * Point Class
 * 
 * Represents a point in 2D space with properties for drawing and interaction.
 * Used for defining control points in Bezier curves.
 * 
 * @class
 */
export class Point {
  /**
   * Creates a new Point instance
   * @param {Object} options - Configuration options
   * @param {number} options.x - X coordinate
   * @param {number} options.y - Y coordinate
   * @param {boolean} [options.isMidPoint=false] - Whether this is a mid-point
   * @param {boolean} [options.isSelected=false] - Whether this point is selected
   * @param {boolean} [options.isDragging=false] - Whether this point is being dragged
   */
  constructor({ x, y, isMidPoint = false, isSelected = false, isDragging = false }) {
    /** @type {number} */
    this.x = x;
    /** @type {number} */
    this.y = y;
    /** @type {boolean} */
    this.isMidPoint = isMidPoint;
    /** @type {boolean} */
    this.isSelected = isSelected;
    /** @type {boolean} */
    this.isDragging = isDragging;
  }

  /**
   * Checks if a point (x,y) is within the hit area of this point
   * @param {number} x - X coordinate to test
   * @param {number} y - Y coordinate to test
   * @returns {boolean} True if the point is within the hit area
   */
  hitTest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    return Math.sqrt(dx * dx + dy * dy) < 10;
  }

  /**
   * Draws the point on the canvas
   * @param {CanvasRenderingContext2D} context - The canvas context
   */
  draw(context) {
    context.beginPath();
    context.arc(this.x, this.y, 5, 0, Math.PI * 2);
    context.fillStyle = this.isSelected ? '#ff0000' : '#000000';
    context.fill();
    context.strokeStyle = '#ffffff';
    context.lineWidth = 2;
    context.stroke();
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