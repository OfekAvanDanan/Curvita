import React, { useRef, useEffect } from 'react';
import { Pane } from 'tweakpane';
import { plugins as EssentialsPlugins } from '@tweakpane/plugin-essentials';
import * as math from 'canvas-sketch-util/math';
import { Point, doSegmentsIntersect } from './classes/Point.js';
import { Curve, ParallelCurveToLine, getCurve } from './classes/Curve.js';

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
    if (PARAMS.editMode) {
      const set = PARAMS.sets[PARAMS.currSet];
      const curve = set.curve;
      if (curve.getParNum() >= 2) {
        curve.updateParallels(true);
      }
      context.save();
      curve.drawCurve(context, true, 'white', set.lineWidth * 3 + 10, set.lineCap);
      curve.drawCurve(context, true, set.color, set.lineWidth * 1.1, set.lineCap);
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

  // Mouse event handlers
  const onMouseDown = (e) => {
    if (!PARAMS.editMode) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const curve = PARAMS.sets[PARAMS.currSet].curve;
    let hit = false;
    curve.points.forEach((point) => {
      point.isDragging = point.hitTest(x, y);
      if (!hit && point.isDragging && point.type === 0) {
        hit = true;
      }
    });
    if (!hit) {
      curve.points.push(new Point({ x, y }));
      curve.updateMidPoints();
      if (PARAMS.currNumOfPar >= 2) {
        curve.updateParallels(true);
      }
      draw();
    }
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
    f1.addBinding(PARAMS, 'currSet', {
      label: 'Current Curve',
      min: 0,
      max: PARAMS.sets.length - 1,
      step: 1,
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
      draw();
    });
    f1.addButton({ title: 'Add a new curve' }).on('click', () => {
      startNewCurve();
      PARAMS.currSet = PARAMS.sets.length - 1;
      pane.refresh();
      f2.title = `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`;
      updateInputs();
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