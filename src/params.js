/**
 * Global Parameters and Settings
 * 
 * This file contains all the global parameters and settings used throughout the application.
 * It includes settings for the canvas, curve properties, and UI controls.
 */

/**
 * Canvas and application settings
 * @type {Object}
 */
export const settings = {
  /** Canvas dimensions [width, height] */
  dimensions: [800, 600],
  /** Background color of the canvas */
  backgroundColor: '#ffffff',
  /** Whether to animate the canvas */
  animate: true
};

/**
 * Global parameters for curve manipulation
 * @type {Object}
 */
export const PARAMS = {
  /** Current curve set being edited */
  currSet: 0,
  /** Whether edit mode is enabled */
  editMode: true,
  /** Current stroke color */
  currColor: '#000000',
  /** Current line width */
  currLineWidth: 2,
  /** Current line cap style */
  currLineCap: 'butt',
  /** Number of parallel lines */
  currNumOfPar: 0,
  /** Distance between parallel lines */
  currDisOfPar: 10,
  /** Array of curve sets */
  sets: [
    {
      name: 'Curve 0',
      curve: new Curve(),
      color: '#000000',
      lineWidth: 2,
      lineCap: 'butt'
    }
  ]
}; 