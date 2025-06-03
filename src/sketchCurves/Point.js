/**
 * Represents a point in 2D space, used for curve control and drawing.
 * @class
 */
export class Point {
  /**
   * Create a new Point.
   * @param {Object} options
   * @param {number} options.x - The x-coordinate.
   * @param {number} options.y - The y-coordinate.
   * @param {number} [options.type=0] - The type of point (0=main, 1=midpoint).
   * @param {boolean} [options.control=false] - Is this a control point?
   */
  constructor({ x, y, type = 0, control = false }) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.control = control;
    this.isDragging = false; // Used for drag interaction
  }

  /**
   * Draw the point on a canvas context.
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    context.save();
    context.translate(this.x, this.y);
    context.fillStyle = this.type === 1 ? 'grey' : 'black';
    const size = this.type === 1 ? 8 : 10;
    context.beginPath();
    context.arc(0, 0, size, 0, Math.PI * 2);
    context.closePath();
    context.fill();
    context.restore();
  }

  /**
   * Test if a given (x, y) is within the hit area of this point.
   * @param {number} x
   * @param {number} y
   * @returns {boolean} True if hit, false otherwise.
   */
  hitTest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const dd = Math.sqrt(dx * dx + dy * dy);
    return dd < 20;
  }
}

/**
 * Check if two line segments intersect.
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} q1
 * @param {Point} q2
 * @returns {boolean}
 */
export function doSegmentsIntersect(p1, p2, q1, q2) {
  const v1 = [p2.x - p1.x, p2.y - p1.y];
  const v2 = [q2.x - q1.x, q2.y - q1.y];
  const det = v1[0] * v2[1] - v1[1] * v2[0];
  if (det === 0) return false;
  const t1 = ((q1.x - p1.x) * v2[1] - (q1.y - p1.y) * v2[0]) / det;
  const t2 = ((q1.x - p1.x) * v1[1] - (q1.y - p1.y) * v1[0]) / det;
  return t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1;
} 