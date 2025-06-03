// Curve.js - Bezier curve and parallel logic for Sketch Curves React
// Restored and documented for clarity (2024)
// Author: [Your Name or Team]
//
// This file contains the Curve class, which manages Bezier curves, their parallels, and all related geometry.
// All methods and helpers are documented for maintainability.

const math = require('canvas-sketch-util/math');
const { Point } = require('./Point.js');

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
function getCurve(points, t) {
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
function ParallelCurveToLine(p0, p1, d) {
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
 * Curve class manages a set of control points, Bezier evaluation, parallels, and drawing.
 */
class Curve {
  /**
   * @param {{points: Point[]}} param0
   */
  constructor({ points }) {
    /** @type {Point[]} */
    this.points = points || [];
    /** @type {number} */
    this._parNum = 0; // Number of parallels
    /** @type {number} */
    this._parDis = 0; // Distance between parallels
    /** @type {Array<Array<{x:number, y:number}>>} */
    this._parallels = []; // Stores parallel curves
    /** @type {Array<{x:number, y:number}>} */
    this._midPoints = []; // Stores midpoints for guides
  }
  /** Get number of parallels */
  getParNum() { return this._parNum; }
  /** Set number of parallels */
  setParNum(n) { this._parNum = n; }
  /** Get distance between parallels */
  getParDis() { return this._parDis; }
  /** Set distance between parallels */
  setParDis(d) { this._parDis = d; }
  /**
   * Recompute midpoints between each pair of control points.
   * Used for drawing guides.
   */
  updateMidPoints() {
    this._midPoints = [];
    for (let i = 0; i < this.points.length - 1; i++) {
      const p0 = this.points[i];
      const p1 = this.points[i + 1];
      this._midPoints.push({
        x: (p0.x + p1.x) / 2,
        y: (p0.y + p1.y) / 2,
      });
    }
  }
  /**
   * Recompute all parallel curves based on current control points, number, and distance.
   * Call this after changing points, number, or distance.
   */
  updateParallels(force) {
    if (this._parNum < 2) return;
    this._parallels = [];
    for (let n = 1; n <= this._parNum; n++) {
      const d = (n - (this._parNum + 1) / 2) * this._parDis;
      let parallel = [];
      for (let i = 0; i < this.points.length - 1; i++) {
        const [p0, p1] = ParallelCurveToLine(this.points[i], this.points[i + 1], d);
        parallel.push(p0);
        if (i === this.points.length - 2) parallel.push(p1);
      }
      this._parallels.push(parallel);
    }
  }
  /**
   * Draw the main Bezier curve using De Casteljau's algorithm.
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} show
   * @param {string} color
   * @param {number} lineWidth
   * @param {CanvasLineCap} lineCap
   */
  drawCurve(ctx, show, color = '#000', lineWidth = 2, lineCap = 'butt') {
    if (!ctx || this.points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let t = 0; t <= 1.001; t += 0.01) {
      const p = getCurve(this.points, t);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }
  /**
   * Draw all parallel curves (if any).
   * @param {CanvasRenderingContext2D} ctx
   * @param {boolean} show
   * @param {string} color
   * @param {number} lineWidth
   * @param {CanvasLineCap} lineCap
   */
  drawParallels(ctx, show, color = '#888', lineWidth = 1, lineCap = 'butt') {
    if (!ctx || this._parallels.length === 0) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = lineCap;
    for (const parallel of this._parallels) {
      ctx.beginPath();
      ctx.moveTo(parallel[0].x, parallel[0].y);
      for (let t = 0; t <= 1.001; t += 0.01) {
        const p = getCurve(parallel, t);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
  /**
   * Draw dashed guide lines between control points.
   * @param {CanvasRenderingContext2D} ctx
   */
  drawGuides(ctx) {
    if (!ctx || this.points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 5;
    ctx.setLineDash([20, 5]);
    ctx.shadowColor = 'rgba(255, 255, 255, 0.73)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  /**
   * Draw all control points (red for normal, blue for mid).
   * @param {CanvasRenderingContext2D} ctx
   */
  drawAllPoints(ctx) {
    if (!ctx) return;
    ctx.save();
    for (const pt of this.points) {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 8, 0, Math.PI * 2);
      ctx.fillStyle = pt.type === 0 ? 'red' : 'blue';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.restore();
  }
}

module.exports = { Curve, ParallelCurveToLine, getCurve }; 