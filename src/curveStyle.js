/**
 * Curve Style Definitions
 * 
 * This file contains style definitions for different curve elements,
 * including the main curve, guide lines, and control points.
 */

const fillStyle = 'rgba(255, 255, 255, 0.5)';
const radius = 16;

const shadowColor = 'rgba(0,0,0,0.25)';
const shadowBlur = 5;

const strokes = 'rgba(0, 0, 0, 0.5)';
const lineWidth = 0.5;


/**
 * Style for guide lines
 * @type {Object}
 */
export const GUIDE_LINE_STYLE = {
  /** Stroke color of guide lines */
  strokeStyle: '#cccccc',
  /** Width of guide lines */
  lineWidth: 1,
  /** Dash pattern for guide lines */
  lineDash: [5, 5],
  /** Shadow color for guide lines */
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  /** Shadow blur radius for guide lines */
  shadowBlur: 5,
  /** Shadow X offset for guide lines */
  shadowOffsetX: 0,
  /** Shadow Y offset for guide lines */
  shadowOffsetY: 0
};

/**
 * Style for control points
 * @type {Object}
 */
export const POINT_STYLE = {
  /** Style for normal control points */
  normal: {
    /** Fill color of normal points */
    fillStyle: '#000000',
    /** Stroke color of normal points */
    strokeStyle: '#ffffff',
    /** Width of normal points */
    lineWidth: 2,
    /** Radius of normal points */
    radius: 5
  },
  /** Style for mid-points */
  mid: {
    /** Fill color of mid-points */
    fillStyle: '#666666',
    /** Stroke color of mid-points */
    strokeStyle: '#ffffff',
    /** Width of mid-points */
    lineWidth: 2,
    /** Radius of mid-points */
    radius: 4
  },
  /** Style for selected points */
  selected: {
    /** Fill color of selected points */
    fillStyle: '#ff0000',
    /** Stroke color of selected points */
    strokeStyle: '#ffffff',
    /** Width of selected points */
    lineWidth: 2,
    /** Radius of selected points */
    radius: 6
  }
};

/**
 * Style for the selected curve when in edit mode
 * @type {Object}
 */
export const SELECTED_LINE_CURVE = {
  /** Stroke color of the selected curve */
  strokeStyle: '#ff0000',
  /** Width of the selected curve */
  lineWidth: 2,
  /** Line cap style of the selected curve */
  lineCap: 'round',
  /** Shadow color for the selected curve */
  shadowColor: 'rgba(255, 0, 0, 0.5)',
  /** Shadow blur radius for the selected curve */
  shadowBlur: 10
};

export const CURVE_STYLE = {
  // Add curve-specific styles if needed
};

export const PARALLEL_STYLE = {
  // Add parallel-specific styles if needed
}; 