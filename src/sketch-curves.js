// Revitalized version of the original file, updated to use Tweakpane v4 APIs.
// All comments are in English, and math/text formatting remains left-aligned.

const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
// Note: we no longer need to import { forEach } from 'mathjs' here because it wasn't used.
const { Pane } = require('tweakpane');
const EssentialsPlugin = require('@tweakpane/plugin-essentials');
const { Point, doSegmentsIntersect } = require('./classes/Point.js');
const { Curve, ParallelCurveToLine, getCurve } = require('./classes/Curve.js');

//------------------------------------------------------------------------------
// PARAMETERS & INITIAL STATE
//------------------------------------------------------------------------------

const PARAMS = {
  editMode: true,
  sets: [
    {
      curve: new Curve({
        points: [
          new Point({ x: 0, y: 0 }),
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

//------------------------------------------------------------------------------
// CANVAS-SKETCH SETTINGS
//------------------------------------------------------------------------------

const settings = {
  dimensions: [1080, 1080],
  animate: PARAMS.editMode,
};

// We need to keep a reference to the <canvas> element for mouse coordinates:
let elCanvas;

//------------------------------------------------------------------------------
// MAIN SKETCH
//------------------------------------------------------------------------------

const sketch = ({ canvas }) => {
  // Attach mouse-event listeners to the canvas:
  canvas.addEventListener('mousedown', onMouseDown);
  elCanvas = canvas;

  return ({ context, width, height }) => {
    // Clear the canvas with a white background:
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    // Draw each curve (and its parallels if needed):
    for (let i = 0; i < PARAMS.sets.length; i++) {
      const set = PARAMS.sets[i];
      const curve = set.curve;

      // If this is not the current editable set OR if editMode is off OR if the
      // curve has parallels to draw, we draw normally (including parallels when count ≥2):
      if (i !== PARAMS.currSet || !PARAMS.editMode || curve.getParNum() >= 1) {
        if (curve.getParNum() <= 1) {
          curve.drawCurve(context, true, set.color, set.lineWidth, set.lineCap);
        } else {
          curve.drawParallels(context, true, set.color, set.lineWidth, set.lineCap);
        }
      }
    }

    // If we're in edit mode, highlight the current curve in white-thick stroke for visibility,
    // then draw it normally on top, plus its guide/helper handles and control points:
    if (PARAMS.editMode) {
      const set = PARAMS.sets[PARAMS.currSet];
      const curve = set.curve;

      context.save();
      // Draw a white thick outline behind the actual stroke so the curve "pops":
      curve.drawCurve(context, true, 'white', set.lineWidth * 3 + 10, set.lineCap);
      // Draw the actual curve:
      curve.drawCurve(context, true, set.color, set.lineWidth * 1.1, set.lineCap);
      // Draw guides (tangent lines, control polygon, etc.) and all control points:
      curve.drawGuides(context);
      curve.drawAllPoints(context);
      context.restore();
    }
  };
};

//------------------------------------------------------------------------------
// TWEAKPANE PANE CREATION & INTERACTIONS
//------------------------------------------------------------------------------

const createPane = () => {
  const pane = new Pane();
  // Register the Essentials plugin so we can use blades like fpsgraph, cubicbezier, etc. if desired:
  pane.registerPlugin(EssentialsPlugin);

  // --- Folder: Editor ---
  const f1 = pane.addFolder({
    title: 'Editor',
    expanded: true,
  });

  // Bind a boolean switch for editMode:
  f1.addBinding(PARAMS, 'editMode', { label: 'Edit Mode' }).on('change', (ev) => {
    // When editMode toggles, re-render and hide/show subfolder accordingly:
    settings.animate = PARAMS.editMode;
    f2.hidden = !PARAMS.editMode;
  });

  // Bind the index of the current curve (integer slider from 0 to sets.length - 1):
  f1.addInput(PARAMS, 'currSet', {
    label: 'Current Curve',
    min: 0,
    max: PARAMS.sets.length - 1,
    step: 1,
  }).on('change', (ev) => {
    // Update the title of the edit subfolder whenever currSet changes:
    f2.title = `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`;
    updateInputs(); // Sync inputs (color, lineWidth, etc.) with the newly selected curve
  });

  // --- Folder: Edit Mode (subfolder of Editor) ---
  const f2 = f1.addFolder({
    title: `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`,
    expanded: true,
  });

  // Color picker for stroke color:
  f2.addInput(PARAMS, 'currColor', { view: 'color', label: 'Stroke Color' }).on('change', () => {
    const set = PARAMS.sets[PARAMS.currSet];
    set.color = PARAMS.currColor;
  });

  // Slider for line width:
  f2.addInput(PARAMS, 'currLineWidth', {
    label: 'Line Width',
    min: 0.1,
    max: 200,
  }).on('change', () => {
    const set = PARAMS.sets[PARAMS.currSet];
    set.lineWidth = PARAMS.currLineWidth;
  });

  // Dropdown for line cap style:
  f2.addInput(PARAMS, 'currLineCap', {
    label: 'Line Cap',
    options: {
      butt: 'butt',
      round: 'round',
      square: 'square',
    },
  }).on('change', () => {
    const set = PARAMS.sets[PARAMS.currSet];
    set.lineCap = PARAMS.currLineCap;
  });

  // Integer slider: how many parallels to draw
  f2.addInput(PARAMS, 'currNumOfPar', {
    label: 'Num of Parallels',
    min: 0,
    max: 200,
    step: 1,
  }).on('change', () => {
    const set = PARAMS.sets[PARAMS.currSet];
    // Update the curve's parallel count
    set.curve.setParNum(PARAMS.currNumOfPar);
    // If the user increased to ≥2 parallels, recompute positions immediately:
    if (PARAMS.currNumOfPar >= 2) {
      set.curve.updateParallels(true);
    }
  });

  // Slider for the distance between parallels:
  f2.addInput(PARAMS, 'currDisOfPar', {
    label: 'Distance',
    min: 2,
    max: 100,
  }).on('change', () => {
    const set = PARAMS.sets[PARAMS.currSet];
    // Update the curve's parallel distance
    set.curve.setParDis(PARAMS.currDisOfPar);
  });

  // Button to delete the currently selected curve:
  const btnDelete = f2.addButton({ title: 'Delete this curve' });
  btnDelete.on('click', () => {
    // Remove the current set from PARAMS.sets
    PARAMS.sets.splice(PARAMS.currSet, 1);
    // Adjust currSet to the previous index, but not below 0:
    PARAMS.currSet = Math.max(0, PARAMS.currSet - 1);
    // If no curves remain, start a brand-new empty curve:
    if (PARAMS.sets.length === 0) {
      startNewCurve();
    }
    // Update the max of the currSet slider, and the subfolder title:
    pane.refresh(); // ensures sliders update their min/max
    f2.title = `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`;
    updateInputs();
  });

  // Button to add a new empty curve:
  const btnAdd = f1.addButton({ title: 'Add a new curve' });
  btnAdd.on('click', () => {
    startNewCurve();
    // Set currSet to the index of the new last curve:
    PARAMS.currSet = PARAMS.sets.length - 1;
    // Refresh the sliders and subfolder title:
    pane.refresh();
    f2.title = `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`;
    updateInputs();
  });

  // Initially hide the edit subfolder if editMode is false:
  f2.hidden = !PARAMS.editMode;

  // Helper function: whenever we switch curves or add/remove, sync the PARAMS.* values
  function updateInputs() {
    const set = PARAMS.sets[PARAMS.currSet];
    // Sync PARAMS.* with the actual curve properties:
    PARAMS.currColor = set.color;
    PARAMS.currLineWidth = set.lineWidth;
    PARAMS.currLineCap = set.lineCap;
    PARAMS.currNumOfPar = set.curve.getParNum();
    PARAMS.currDisOfPar = set.curve.getParDis();
    // Force pane to re-read updated PARAMS into UI:
    pane.refresh();
  }
};

//------------------------------------------------------------------------------
// START A BRAND-NEW EMPTY CURVE
//------------------------------------------------------------------------------

const startNewCurve = () => {
  // Remove any sets that accidentally have zero control points:
  PARAMS.sets = PARAMS.sets.filter((set) => set.curve.points.length > 0);
  // Create a fresh curve with no points:
  PARAMS.sets.push({
    curve: new Curve({ points: [] }),
    color: '#000000',
    lineWidth: 5,
    lineCap: 'butt',
    pairsOdd: [],
    pairDouble: [],
  });
};

//------------------------------------------------------------------------------
// MOUSE HANDLERS FOR CREATING & DRAGGING POINTS
//------------------------------------------------------------------------------

const onMouseDown = (e) => {
  if (!PARAMS.editMode) return;

  const curve = PARAMS.sets[PARAMS.currSet].curve;
  // Begin listening for move/up once user presses the mouse button:
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  // Convert DOM mouse coordinates into canvas coordinates:
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  let hit = false;
  // Check if we clicked on an existing control point:
  curve.points.forEach((point) => {
    point.isDragging = point.hitTest(x, y);
    if (!hit && point.isDragging && point.type === 0) {
      hit = true;
    }
  });

  // If we didn't hit any point, add a new one at (x, y):
  if (!hit) {
    curve.points.push(new Point({ x, y }));
    curve.updateMidPoints();
    // If the user has requested parallels ≥ 2, update them immediately:
    if (PARAMS.currNumOfPar >= 2) {
      curve.updateParallels(true);
    }
  }
};

const onMouseMove = (e) => {
  // Convert DOM coordinates to canvas coords on each move:
  const x = (e.offsetX / elCanvas.offsetWidth) * elCanvas.width;
  const y = (e.offsetY / elCanvas.offsetHeight) * elCanvas.height;

  const curve = PARAMS.sets[PARAMS.currSet].curve;
  // If a point is marked isDragging, update its position to (x, y):
  curve.points.forEach((point) => {
    if (point.isDragging && PARAMS.editMode) {
      point.x = x;
      point.y = y;
    }
  });

  // Recompute mid-points on move:
  curve.updateMidPoints();
  // If there are parallels, recompute them as well:
  if (curve.getParNum() >= 2) {
    curve.updateParallels(true);
  }
};

const onMouseUp = () => {
  // Stop listening to move/up when mouse button is released:
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);
};

//------------------------------------------------------------------------------
// INITIALIZE PANE & START SKETCH
//------------------------------------------------------------------------------

createPane();
canvasSketch(sketch, settings);
