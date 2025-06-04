import { Point } from './classes/Point.js';
import { Curve } from './classes/Curve.js';

// Raw default data structure (similar to JSON)
const defaultCurveData = [
  {
    "name": "Curve 0",
    "curve": {
      "points": [
        { "x": 790.1711001357479, "y": 940.7443606850937, "type": 0, "isDragging": true, "isSelected": true },
        { "x": 60.47904572105248, "y": 246.80605377927967, "type": 0, "isDragging": false, "isSelected": false },
        { "x": 523.2798428790111, "y": 23.34510296623632, "type": 0, "isDragging": false, "isSelected": false },
        { "x": 1012.5804811830286, "y": 239.2346705946914, "type": 0, "isDragging": false, "isSelected": false },
        { "x": 279.10273517603906, "y": 942.6372064812408, "type": 0, "isDragging": false, "isSelected": false }
      ],
      "_parNum": 8,
      "_parDis": 26.5,
      "_parallels": [], // parallels and midPoints are calculated by the Curve class
      "_midPoints": []
    },
    "color": "#000000",
    "lineWidth": 14.672710000000002,
    "lineCap": "butt",
    "pairsOdd": [],
    "pairDouble": []
  }
];

// Default parameters for the application
export const PARAMS = {
  editMode: true,
  sets: defaultCurveData.map(setData => {
    const points = setData.curve.points.map(p => new Point({ x: p.x, y: p.y, type: p.type, isDragging: p.isDragging, isSelected: p.isSelected }));
    const curve = new Curve({ points: points });
    // Set parallel parameters after creating the curve instance
    curve.setParNum(setData.curve._parNum);
    curve.setParDis(setData.curve._parDis);

    return {
      name: setData.name,
      curve: curve,
      color: setData.color,
      lineWidth: setData.lineWidth,
      lineCap: setData.lineCap,
      pairsOdd: setData.pairsOdd,
      pairDouble: setData.pairDouble,
    };
  }),
  currColor: '#000000',
  currLineWidth: 5,
  currLineCap: 'butt',
  currSet: 0,
  currNumOfPar: 0,
  currDisOfPar: 0,
};

// Application settings
export const settings = {
  dimensions: [1080, 1080],
  animate: PARAMS.editMode,
  backgroundColor: '#ffffff'
}; 