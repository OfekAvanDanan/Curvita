// curveStyle.js - Centralized style/theme for Sketch Curves React
// All UX and style properties for points, guides, curves, etc.

const fillStyle = 'rgba(255, 255, 255, 0.8)';
const radius = 16;

const shadowColor = 'rgba(0,0,0,0.18)';
const shadowBlur = 8;

const strokes = 'rgba(0, 0, 0, 0.5)';
const lineWidth = 0.5;


export const GUIDE_LINE_STYLE = {
  strokeStyle: strokes,
  lineWidth: lineWidth,
  lineDash: [20, 5],
  shadowColor: shadowColor,
  shadowBlur: shadowBlur,
};

export const POINT_STYLE = {
  normal: {
    fillStyle: fillStyle,
    radius: radius,
    strokeStyle: strokes,
    lineWidth: lineWidth,
    backgroundBlur: {
      enabled: true,
      blurRadius: 10, 
    },
  },
};

export const CURVE_STYLE = {
  // Add curve-specific styles if needed
};

export const PARALLEL_STYLE = {
  // Add parallel-specific styles if needed
}; 