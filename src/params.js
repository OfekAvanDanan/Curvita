import { Point } from './classes/Point.js';
import { Curve } from './classes/Curve.js';

// Default parameters for the application
export const PARAMS = {
  editMode: true,
  sets: [
    {
      name: 'Curve 0',
      curve: new Curve({
        points: [
          new Point({ x: 20, y: 20 }),
          new Point({ x: 540, y: 540 }),
          new Point({ x: 900, y: 540 }),
        ],
      }),
      color: '#000000',
      lineWidth: 5,
      lineCap: 'butt',
      pairsOdd: [],
      pairDouble: [],
    },
    {
      name: 'Curve 1',
      curve: new Curve({
        points: [
          new Point({ x: 50, y: 80 }),
          new Point({ x: 600, y: 400 }),
          new Point({ x: 300, y: 800 }),
        ],
      }),
      color: '#000000',
      lineWidth: 5,
      lineCap: 'butt',
      pairsOdd: [],
      pairDouble: [],
    },
  ],
  currColor: '#000000',
  currLineWidth: 5,
  currLineCap: 'butt',
  currSet: 0,
  currNumOfPar: 0,
  currDisOfPar: 0,
};

// Application settings
export const settings = {
  dimensions: [900, 900],
  animate: PARAMS.editMode,
  backgroundColor: '#ffffff'
}; 