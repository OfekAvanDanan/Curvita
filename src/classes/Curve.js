// Full Curve class and helpers restored from original app
const math = require('canvas-sketch-util/math');
const { Point } = require('./Point.js');

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function getCurve(points, t) {
  // De Casteljau's algorithm for Bezier curves
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

function ParallelCurveToLine(p0, p1, d) {
  // Returns a line parallel to p0-p1 at distance d
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

class Curve {
  constructor({ points }) {
    this.points = points || [];
    this._parNum = 0;
    this._parDis = 0;
    this._parallels = [];
    this._midPoints = [];
  }
  getParNum() { return this._parNum; }
  setParNum(n) { this._parNum = n; }
  getParDis() { return this._parDis; }
  setParDis(d) { this._parDis = d; }
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
  drawGuides(ctx) {
    if (!ctx || this.points.length < 2) return;
    ctx.save();
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
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