import React, { useRef, useEffect } from 'react';
import { Pane } from 'tweakpane';
import { plugins as EssentialsPlugins } from '@tweakpane/plugin-essentials';
import { Point } from './classes/Point.js';
import { Curve, getCurve } from './classes/Curve.js';
import { SELECTED_LINE_CURVE } from "./curveStyle.js"

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

const settings = {
  dimensions: [1080, 1080],
  animate: PARAMS.editMode,
};

export default function SketchCurvesWindow() {
  const canvasRef = useRef(null);
  const paneRef = useRef(null);
  const animationRef = useRef();
  const paneInstance = useRef();

  // Helper to get canvas context
  const getContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  // Redraw function
  const draw = () => {
    const context = getContext();
    if (!context) return;
    const width = settings.dimensions[0];
    const height = settings.dimensions[1];
    context.clearRect(0, 0, width, height);
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    // Draw all curves first
    for (let i = 0; i < PARAMS.sets.length; i++) {
      const set = PARAMS.sets[i];
      const curve = set.curve;
      if (curve.getParNum() >= 2) {
        curve.updateParallels(true);
      }
      if (i !== PARAMS.currSet || !PARAMS.editMode || curve.getParNum() >= 1) {
        if (curve.getParNum() <= 1) {
          curve.drawCurve(context, true, set.color, set.lineWidth, set.lineCap);
        } else {
          curve.drawParallels(context, true, set.color, set.lineWidth, set.lineCap);
        }
      }
    }

    // If in edit mode, draw the selected curve with highlight
    if (PARAMS.editMode) {
      const set = PARAMS.sets[PARAMS.currSet];
      const curve = set.curve;
      if (curve.getParNum() >= 2) {
        curve.updateParallels(true);
      }
      context.save();
      context.shadowColor = SELECTED_LINE_CURVE.shadowColor;
      context.shadowBlur = SELECTED_LINE_CURVE.shadowBlur;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;

      // Draw highlight behind the curve
      curve.drawCurve(
        context,
        true,
        SELECTED_LINE_CURVE.strokeStyle,
        set.lineWidth + SELECTED_LINE_CURVE.lineWidth,
        SELECTED_LINE_CURVE.lineCap
      );


      context.shadowColor = 'transparent';
      context.shadowBlur = 0;
      // Draw the actual curve on top
      curve.drawCurve(context, true, set.color, set.lineWidth, set.lineCap);
      curve.drawGuides(context);
      curve.drawAllPoints(context);
      context.restore();
    }
  };

  // Animation loop
  const animate = () => {
    draw();
    if (settings.animate) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  let prevPointIndex = -1;
  // Mouse event handlers
  const onMouseDown = (e) => {
    if (!PARAMS.editMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    // First check if we clicked on any curve
    // First check if we clicked on any curve
    let clickedCurveIndex = -1;
    for (let i = 0; i < PARAMS.sets.length; i++) {
      const curve = PARAMS.sets[i].curve;
      // אם אין כלל נקודות או פחות משתי נקודות, מדלגים על הבדיקה
      if (curve.points.length < 2) continue;

      // Check if click is near the curve
      for (let t = 0; t <= 1; t += 0.01) {
        const p = getCurve(curve.points, t);
        const dx = p.x - x;
        const dy = p.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 20) { // 20 pixels threshold
          clickedCurveIndex = i;
          break;
        }
      }
      if (clickedCurveIndex !== -1) break;
    }


    // If we clicked on a curve, select it
    if (clickedCurveIndex !== -1 && clickedCurveIndex !== PARAMS.currSet) {
      PARAMS.currSet = clickedCurveIndex;
      // Update tweakpane with new curve properties
      const set = PARAMS.sets[PARAMS.currSet];
      PARAMS.currColor = set.color;
      PARAMS.currLineWidth = set.lineWidth;
      PARAMS.currLineCap = set.lineCap;
      PARAMS.currNumOfPar = set.curve.getParNum();
      PARAMS.currDisOfPar = set.curve.getParDis();
      if (paneInstance.current) {
        paneInstance.current.refresh();
      }
      draw();
      return;
    }

    const curve = PARAMS.sets[PARAMS.currSet].curve;

    // First, check if we clicked on any existing point
    let clickedPoint = null;
    let clickedPointIndex = -1;
    for (let i = 0; i < curve.points.length; i++) {
      const point = curve.points[i];
      if (point.hitTest(x, y)) {
        clickedPoint = point;
        clickedPointIndex = i;
        break;
      }
    }

    // Update previous point index if we clicked on a point
    if (clickedPointIndex !== -1) {
      prevPointIndex = clickedPointIndex;
    }

    if (clickedPoint) {
      if (e.button === 2) { // Right click
        // Delete the point
        curve.points.splice(clickedPointIndex, 1);
        curve.updateMidPoints();
        if (PARAMS.currNumOfPar >= 2) {
          curve.updateParallels(true);
        }
      } else { // Left click
        // If we clicked on a point, deselect all points and select this one
        curve.points.forEach(p => {
          p.isSelected = false;
          p.isDragging = false;
        });
        clickedPoint.isSelected = true;
        clickedPoint.isDragging = true;
      }
    } else {
      // If we didn't click on any point, create a new one
      const newPoint = new Point({ x, y });

      // If the first point was selected, add new point before it
      if (prevPointIndex === 0) {
        curve.points.unshift(newPoint);
      } else {
        curve.points.push(newPoint);
      }

      // Reset selection for all points
      curve.points.forEach(p => {
        p.isSelected = false;
        p.isDragging = false;
      });

      // Select the new point
      newPoint.isSelected = true;

      curve.updateMidPoints();
      if (PARAMS.currNumOfPar >= 2) {
        curve.updateParallels(true);
      }
    }

    draw();
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const onMouseMove = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const curve = PARAMS.sets[PARAMS.currSet].curve;
    curve.points.forEach((point) => {
      if (point.isDragging && PARAMS.editMode) {
        point.x = x;
        point.y = y;
      }
    });
    curve.updateMidPoints();
    if (curve.getParNum() >= 2) {
      curve.updateParallels(true);
    }
    draw();
  };

  const onMouseUp = () => {
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  // Pane setup
  const createPane = () => {
    if (paneInstance.current) {
      try {
        paneInstance.current.dispose();
      } catch (e) {
        // Ignore if already disposed
      }
      paneInstance.current = null;
    }
    const pane = new Pane({ container: paneRef.current });
    pane.registerPlugin(EssentialsPlugins);
    const f1 = pane.addFolder({ title: 'Editor', expanded: true });
    const f2 = f1.addFolder({ title: `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`, expanded: true });
    f1.addBinding(PARAMS, 'editMode', { label: 'Edit Mode' }).on('change', () => {
      settings.animate = PARAMS.editMode;
      f2.hidden = !PARAMS.editMode;
      if (settings.animate) {
        animate();
      } else {
        cancelAnimationFrame(animationRef.current);
        draw();
      }
    });
    const curveOptions = {};
    PARAMS.sets.forEach((_, idx) => {
      curveOptions[`Curve ${idx}`] = idx;
    });

    f1.addBinding(PARAMS, 'currSet', {
      label: 'Current Curve',
      options: curveOptions,
    }).on('change', () => {
      f2.title = `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`;
      updateInputs();
      draw();
    });
    f2.addBinding(PARAMS, 'currColor', { view: 'color', label: 'Stroke Color' }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.color = PARAMS.currColor;
      draw();
    });
    f2.addBinding(PARAMS, 'currLineWidth', {
      label: 'Line Width',
      min: 0.1,
      max: 200,
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.lineWidth = PARAMS.currLineWidth;
      draw();
    });
    f2.addBinding(PARAMS, 'currLineCap', {
      label: 'Line Cap',
      options: { butt: 'butt', round: 'round', square: 'square' },
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.lineCap = PARAMS.currLineCap;
      draw();
    });
    f2.addBinding(PARAMS, 'currNumOfPar', {
      label: 'Num of Parallels',
      min: 0,
      max: 200,
      step: 1,
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.curve.setParNum(PARAMS.currNumOfPar);
      if (PARAMS.currNumOfPar >= 2) {
        set.curve.updateParallels(true);
      }
      draw();
    });
    f2.addBinding(PARAMS, 'currDisOfPar', {
      label: 'Distance',
      min: 2,
      max: 100,
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.curve.setParDis(PARAMS.currDisOfPar);
      if (set.curve.getParNum() >= 2) {
        set.curve.updateParallels(true);
      }
      draw();
    });
    f2.addButton({ title: 'Delete this curve' }).on('click', () => {
      PARAMS.sets.splice(PARAMS.currSet, 1);
      PARAMS.currSet = Math.max(0, PARAMS.currSet - 1);
      if (PARAMS.sets.length === 0) {
        startNewCurve();
      }
      pane.refresh();
      f2.title = `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`;
      updateInputs();
      createPane();
      draw();
    });
    f1.addButton({ title: 'Add a new curve' }).on('click', () => {
      startNewCurve();
      PARAMS.currSet = PARAMS.sets.length - 1;
      pane.refresh();
      f2.title = `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`;
      updateInputs();
      createPane();
      draw();
    });
    f2.hidden = !PARAMS.editMode;
    function updateInputs() {
      const set = PARAMS.sets[PARAMS.currSet];
      PARAMS.currColor = set.color;
      PARAMS.currLineWidth = set.lineWidth;
      PARAMS.currLineCap = set.lineCap;
      PARAMS.currNumOfPar = set.curve.getParNum();
      PARAMS.currDisOfPar = set.curve.getParDis();
      pane.refresh();

    }
    paneInstance.current = pane;
  };

  // Add a new empty curve
  const startNewCurve = () => {
    PARAMS.sets = PARAMS.sets.filter((set) => set.curve.points.length > 0);
    PARAMS.sets.push({
      curve: new Curve({ points: [] }),
      color: '#000000',
      lineWidth: 5,
      lineCap: 'butt',
      pairsOdd: [],
      pairDouble: [],
    });
  };

  // Add context menu prevention
  useEffect(() => {
    const canvas = canvasRef.current;
    const preventContextMenu = (e) => {
      e.preventDefault();
    };
    canvas.addEventListener('contextmenu', preventContextMenu);
    return () => {
      canvas.removeEventListener('contextmenu', preventContextMenu);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = settings.dimensions[0];
    canvas.height = settings.dimensions[1];
    draw();
    createPane();
    canvas.addEventListener('mousedown', onMouseDown);
    if (settings.animate) animate();
    // HMR: Redraw canvas when classes change (for instant feedback)
    if (module.hot) {
      module.hot.accept(['./classes/Curve.js', './classes/Point.js'], () => {
        draw();
      });
    }
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      cancelAnimationFrame(animationRef.current);
      if (paneInstance.current) {
        try {
          paneInstance.current.dispose();
        } catch (e) {
          // Ignore if already disposed
        }
        paneInstance.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid #ccc', background: '#fff', width: 540, height: 540 }}
        width={settings.dimensions[0]}
        height={settings.dimensions[1]}
      />
      <div ref={paneRef} style={{ minWidth: 320 }} />
    </div>
  );
} 