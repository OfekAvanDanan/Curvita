// Full Point class and doSegmentsIntersect restored from original app
class Point {
  constructor({ x, y, type = 0 }) {
    this.x = x;
    this.y = y;
    this.type = type; // 0: normal, 1: mid, etc.
    this.isDragging = false;
  }
  hitTest(x, y) {
    // Hit test for a point (radius 10)
    return (Math.abs(this.x - x) < 10 && Math.abs(this.y - y) < 10);
  }
}

function doSegmentsIntersect(p1, p2, q1, q2) {
  // Returns true if line segments p1-p2 and q1-q2 intersect
  function ccw(a, b, c) {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  }
  return (
    ccw(p1, q1, q2) !== ccw(p2, q1, q2) &&
    ccw(p1, p2, q1) !== ccw(p1, p2, q2)
  );
}

module.exports = { Point, doSegmentsIntersect }; 