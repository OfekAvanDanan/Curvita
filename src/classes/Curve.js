// curveStyle.js - Bezier curve and parallel logic for Sketch Curves React
// Restored and documented for clarity (2024)
// Author: [Your Name or Team]
//
// This file contains the Curve class, which manages Bezier curves, their parallels, and all related geometry.
// All methods and helpers are documented for maintainability.

import { GUIDE_LINE_STYLE, POINT_STYLE } from '../curveStyle.js';

/**
 * Linear interpolation between a and b by t
 */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * De Casteljau's algorithm for Bezier curves of any degree.
 * Returns the point at parameter t (0..1) for the given control points.
 * @param {Array<{x:number, y:number}>} points
 * @param {number} t
 * @returns {{x:number, y:number}}
 */
export function getCurve(points, t) {
  let pts = points.map((p) => ({ x: p.x, y: p.y }));
  while (pts.length > 1) {
    let next = [];
    for (let i = 0; i < pts.length - 1; i++) {
      next.push({
        x: lerp(pts[i].x, pts[i + 1].x, t),
        y: lerp(pts[i].y, pts[i + 1].y, t),
      });
    }
    pts = next;
  }
  return pts[0];
}

/**
 * Returns a line parallel to p0-p1 at distance d.
 * Used for constructing parallel curves.
 * @param {{x:number, y:number}} p0
 * @param {{x:number, y:number}} p1
 * @param {number} d
 * @returns {[{x:number, y:number}, {x:number, y:number}]}
 */
export function ParallelCurveToLine(p0, p1, d) {
  const dx = p1.x - p0.x;
  const dy = p1.y - p0.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len === 0) return [{ x: p0.x, y: p0.y }, { x: p1.x, y: p1.y }];
  const nx = -dy / len;
  const ny = dx / len;
  return [
    { x: p0.x + nx * d, y: p0.y + ny * d },
    { x: p1.x + nx * d, y: p1.y + ny * d },
  ];
}

/**
 * Curve Class
 * 
 * Represents a Bezier curve with support for parallel lines and control points.
 * Provides methods for drawing, updating, and manipulating the curve.
 * 
 * @class
 */
export class Curve {
  /**
   * Creates a new Curve instance
   * @param {Point[]} points - Array of control points defining the curve
   */
  constructor(points = []) {
    /** @type {Point[]} */
    this.points = points;
    /** @type {Point[]} */
    this.midPoints = [];
    /** @type {Point[]} */
    this.parallels = [];
    /** @type {number} */
    this.numOfPar = 0;
    /** @type {number} */
    this.disOfPar = 0;
  }

  /**
   * Updates the mid-points between control points
   */
  updateMidPoints() {
    this.midPoints = [];
    for (let i = 0; i < this.points.length - 1; i++) {
      const p1 = this.points[i];
      const p2 = this.points[i + 1];
      const midX = (p1.x + p2.x) / 2;
      const midY = (p1.y + p2.y) / 2;
      this.midPoints.push(new Point({ x: midX, y: midY, isMidPoint: true }));
    }
  }

  /**
   * Gets the number of parallel lines
   * @returns {number} Number of parallel lines
   */
  getParNum() {
    return this.numOfPar;
  }

  /**
   * Sets the number of parallel lines
   * @param {number} num - Number of parallel lines
   */
  setParNum(num) {
    this.numOfPar = num;
    this.updateParallels();
  }

  /**
   * Gets the distance between parallel lines
   * @returns {number} Distance between parallel lines
   */
  getParDis() {
    return this.disOfPar;
  }

  /**
   * Sets the distance between parallel lines
   * @param {number} dis - Distance between parallel lines
   */
  setParDis(dis) {
    this.disOfPar = dis;
    this.updateParallels();
  }

  /**
   * Updates the parallel lines based on current settings
   * @param {boolean} [force=false] - Force update even if no changes
   */
  updateParallels(force = false) {
    if (!force && this.numOfPar === 0) return;

    this.parallels = [];
    const steps = 100;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const p = getCurve(this.points, t);
      const tangent = getCurveTangent(this.points, t);
      const normal = { x: -tangent.y, y: tangent.x };
      const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y);
      normal.x /= length;
      normal.y /= length;

      for (let j = 0; j < this.numOfPar; j++) {
        const offset = (j + 1) * this.disOfPar;
        const parallelPoint = new Point({
          x: p.x + normal.x * offset,
          y: p.y + normal.y * offset,
          isMidPoint: true
        });
        this.parallels.push(parallelPoint);
      }
    }
  }

  /**
   * Draws the curve on the canvas
   * @param {CanvasRenderingContext2D} context - The canvas context
   * @param {boolean} showGuides - Whether to show guide lines
   * @param {string} color - Color of the curve
   * @param {number} lineWidth - Width of the curve
   * @param {string} lineCap - Style of line caps
   */
  drawCurve(context, showGuides, color, lineWidth, lineCap) {
    if (this.points.length < 2) return;

    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const p = getCurve(this.points, t);
      context.lineTo(p.x, p.y);
    }

    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = lineCap;
    context.stroke();

    if (showGuides) {
      this.drawGuides(context);
    }
  }

  /**
   * Draws the parallel lines on the canvas
   * @param {CanvasRenderingContext2D} context - The canvas context
   * @param {boolean} showGuides - Whether to show guide lines
   * @param {string} color - Color of the parallel lines
   * @param {number} lineWidth - Width of the parallel lines
   * @param {string} lineCap - Style of line caps
   */
  drawParallels(context, showGuides, color, lineWidth, lineCap) {
    if (this.numOfPar === 0) return;

    const pointsPerLine = Math.floor(this.parallels.length / this.numOfPar);
    for (let i = 0; i < this.numOfPar; i++) {
      const startIdx = i * pointsPerLine;
      const endIdx = (i + 1) * pointsPerLine;

      context.beginPath();
      context.moveTo(this.parallels[startIdx].x, this.parallels[startIdx].y);

      for (let j = startIdx + 1; j < endIdx; j++) {
        context.lineTo(this.parallels[j].x, this.parallels[j].y);
      }

      context.strokeStyle = color;
      context.lineWidth = lineWidth;
      context.lineCap = lineCap;
      context.stroke();
    }

    if (showGuides) {
      this.drawGuides(context);
    }
  }

  /**
   * Draws guide lines and points on the canvas
   * @param {CanvasRenderingContext2D} context - The canvas context
   */
  drawGuides(context) {
    // Draw lines between points
    context.beginPath();
    context.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      context.lineTo(this.points[i].x, this.points[i].y);
    }
    context.strokeStyle = '#cccccc';
    context.lineWidth = 1;
    context.setLineDash([5, 5]);
    context.stroke();
    context.setLineDash([]);

    // Draw all points
    this.drawAllPoints(context);
  }

  /**
   * Draws all points (control points and mid-points) on the canvas
   * @param {CanvasRenderingContext2D} context - The canvas context
   */
  drawAllPoints(context) {
    [...this.points, ...this.midPoints].forEach(point => {
      point.draw(context);
    });
  }
}

/**
 * Calculates a point on a Bezier curve at parameter t
 * @param {Point[]} points - Control points of the curve
 * @param {number} t - Parameter value (0 to 1)
 * @returns {Point} Point on the curve
 */
export function getCurve(points, t) {
  if (points.length === 0) return new Point({ x: 0, y: 0 });
  if (points.length === 1) return points[0];

  const newPoints = [];
  for (let i = 0; i < points.length - 1; i++) {
    const x = (1 - t) * points[i].x + t * points[i + 1].x;
    const y = (1 - t) * points[i].y + t * points[i + 1].y;
    newPoints.push(new Point({ x, y }));
  }

  return getCurve(newPoints, t);
}

/**
 * Calculates the tangent vector at a point on the curve
 * @param {Point[]} points - Control points of the curve
 * @param {number} t - Parameter value (0 to 1)
 * @returns {{x: number, y: number}} Tangent vector
 */
export function getCurveTangent(points, t) {
  if (points.length < 2) return { x: 0, y: 0 };

  const newPoints = [];
  for (let i = 0; i < points.length - 1; i++) {
    const x = points[i + 1].x - points[i].x;
    const y = points[i + 1].y - points[i].y;
    newPoints.push({ x, y });
  }

  return getCurve(newPoints, t);
} 