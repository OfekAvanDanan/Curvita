import { Point } from './Point';

/**
 * Class representing a curve made of points, with support for parallel curves.
 */
export class Curve {
  /**
   * Create a new Curve.
   * @param {Object} options
   * @param {Point[]} options.points - The control points of the curve.
   */
  constructor({ points }) {
    this.points = points;
    this.midPoints = getMidPoints(this.points);
    this.parNum = 0;
    this.parDis = 0;
    this.parsOdd = [];
    this.parsDouble = [];
    this.initPars();
  }

  drawPoints(context) {
    context.save();
    this.points.forEach((point) => point.draw(context));
    context.restore();
  }

  initPars() {
    const parPoints1 = ParallelCurveToLine(this.points, 0);
    const parMid1 = getMidPoints(parPoints1);
    const parPoints2 = ParallelCurveToLine(this.points, 0);
    const parMid2 = getMidPoints(parPoints2);
    this.parsDouble = [
      { points: parPoints1, mid: parMid1 },
      { points: parPoints2, mid: parMid2 },
    ];
    this.parsOdd = [{ points: this.points, mid: this.midpoints }];
  }

  drawMidPoints(context) {
    context.save();
    this.midPoints.forEach((point) => point.draw(context));
    context.restore();
  }

  drawAllPoints(context) {
    this.drawMidPoints(context);
    this.drawPoints(context);
  }

  drawGuides(context) {
    if (this.points.length >= 2) {
      context.save();
      context.beginPath();
      context.moveTo(this.points[0].x, this.points[0].y);
      for (let i = 1; i < this.points.length; i++) {
        context.lineTo(this.points[i].x, this.points[i].y);
      }
      context.strokeStyle = '#999';
      context.lineWidth = 5;
      context.lineCap = 'round';
      context.stroke();
      context.restore();
    }
  }

  drawCurve(context, full = true, strokeStyle = 'black', lineWidth = 4, lineCap = 'butt') {
    getCurve(context, this.points, this.midPoints, full);
    context.lineCap = lineCap;
    context.lineWidth = lineWidth;
    context.strokeStyle = strokeStyle;
    context.stroke();
    context.restore();
  }

  drawParallels(context, full = true, color = 'black', lineWidth = 4, lineCap = 'butt') {
    const pars = this.parsNum % 2 === 0 ? this.parsDouble : this.parsOdd;
    for (let j = 0; j < pars.length; j++) {
      getCurve(context, pars[j].points, pars[j].midPoints, full);
      context.lineCap = lineCap;
      context.lineWidth = lineWidth;
      context.strokeStyle = color;
      context.stroke();
      context.restore();
    }
  }

  updateParallels(initPars = false, dis = this.parDis) {
    if (initPars) this.initPars();
    const num = this.parNum;
    if (this.parNum >= 2) {
      this.ChangeParallels(num, dis);
      const pars = this.parsNum % 2 === 0 ? this.parsDouble : this.parsOdd;
      pars.forEach((pars) => {
        pars.midPoints = getMidPoints(pars.points, pars.midPoints);
      });
    }
  }

  ChangeParallels(num = this.parsNum, dis = this.parDis) {
    if (dis !== this.parDis || num <= 3) this.initPars();
    let currPars = num % 2 === 0 ? this.parsDouble : this.parsOdd;
    if (num > currPars.length) {
      for (let i = currPars.length; i < num; i = i + 2) {
        const first = currPars[0];
        const firstPoints = ParallelCurveToLine(first.points, dis);
        const firstMid = getMidPoints(firstPoints);
        currPars.unshift({ points: firstPoints, mid: firstMid });
        const last = currPars[currPars.length - 1];
        const lastPoints = ParallelCurveToLine(last.points, -dis);
        const lastMid = getMidPoints(lastPoints);
        currPars.push({ points: lastPoints, mid: lastMid });
      }
    } else {
      const delta = currPars.length - num;
      if (num <= 3) currPars = currPars.slice(delta, currPars.length - delta);
    }
    if (num % 2 === 0) {
      this.parsDouble = currPars;
    } else {
      this.parsOdd = currPars;
    }
    this.parsNum = num;
    this.parDis = dis;
  }

  updateMidPoints() {
    this.midPoints = getMidPoints(this.points, this.midpoints);
  }

  setParNum(x) {
    this.ChangeParallels(x, this.dis);
    this.updateParallels();
    this.parNum = x;
  }

  setParDis(x) {
    this.ChangeParallels(this.parNum, x);
    this.updateParallels();
    this.parDis = x;
  }

  getParNum() {
    return this.parNum;
  }

  getParDis() {
    return this.parDis;
  }

  getPars() {
    return this.parNum % 2 ? this.parsDouble : this.parsOdd;
  }
}

/**
 * Draw a curve using quadratic segments and midpoints.
 */
export function getCurve(context, points = [], midPoints = [], full = true) {
  context.save();
  context.beginPath();
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    if (i === 0 && full === true) context.moveTo(curr.x, curr.y);
    else if (i === points.length - 2 && full === true) context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
    else {
      let mid;
      if (i <= midPoints.length) {
        mid = midPoints[i];
      } else {
        mid = next;
      }
      if (i === 0 && full === false) context.moveTo(mid.x, mid.y);
      else context.quadraticCurveTo(curr.x, curr.y, mid.x, mid.y);
    }
  }
}

/**
 * Get the angle between two points, offset by 90 degrees.
 */
export function getAngle(p1, p2) {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x) + Math.PI * 0.5;
}

/**
 * Compute midpoints between each pair of points.
 */
export function getMidPoints(points, midPoints = []) {
  if (points.length >= 2) {
    for (let i = 0; i < points.length - 1; i++) {
      const curr = points[i];
      const next = points[i + 1];
      const mx = curr.x + (next.x - curr.x) * 0.5;
      const my = curr.y + (next.y - curr.y) * 0.5;
      const mid = new Point({ x: mx, y: my, type: 1 });
      midPoints.push(mid);
    }
  }
  return midPoints;
}

/**
 * Generate a parallel curve offset from the original by a given distance.
 */
export function ParallelCurveToLine(points, distance) {
  const newPoints = [];
  for (let i = 0; i <= points.length - 1; i++) {
    const prev = i !== 0 ? points[i - 1] : points[0];
    const next = i !== points.length - 1 ? points[i + 1] : points[i];
    const curr = points[i];
    const ang1 = getAngle(prev, curr);
    const ang2 = getAngle(curr, next);
    const midAngle = ang1 + (ang2 - ang1) / 2;
    const angX = Math.cos(midAngle);
    const angY = Math.sin(midAngle);
    const x = curr.x + angX * distance;
    const y = curr.y + angY * distance;
    newPoints.push(new Point({ x: x, y: y }));
  }
  return newPoints;
} 