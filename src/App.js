import React, { useRef, useEffect } from 'react';
import './App.css';
import { Pane } from 'tweakpane';
import EssentialsPlugin from '@tweakpane/plugin-essentials';
import { Point, Curve } from './sketchCurves';

const CANVAS_SIZE = 800;

const initialCurves = [
  new Curve({
    points: [
      new Point({ x: 0, y: 0 }),
      new Point({ x: 400, y: 400 }),
      new Point({ x: 700, y: 400 }),
    ],
  }),
  new Curve({
    points: [
      new Point({ x: 50, y: 80 }),
      new Point({ x: 600, y: 300 }),
      new Point({ x: 300, y: 700 }),
    ],
  }),
];

const defaultParams = {
  editMode: true,
  sets: [
    {
      curve: initialCurves[0],
      color: '#000000',
      lineWidth: 5,
      lineCap: 'butt',
    },
    {
      curve: initialCurves[1],
      color: '#000000',
      lineWidth: 5,
      lineCap: 'butt',
    },
  ],
  currColor: '#000000',
  currLineWidth: 5,
  currLineCap: 'butt',
  currSet: 0,
  currNumOfPar: 0,
  currDisOfPar: 0,
};

function App() {
  const canvasRef = useRef(null);
  const paneRef = useRef(null);
  const paramsRef = useRef(JSON.parse(JSON.stringify(defaultParams)));
  const animationRef = useRef();

  // Draw function
  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const PARAMS = paramsRef.current;
    for (let i = 0; i < PARAMS.sets.length; i++) {
      const set = PARAMS.sets[i];
      const curve = set.curve;
      if (i !== PARAMS.currSet || !PARAMS.editMode || curve.getParNum() >= 1) {
        if (curve.getParNum() <= 1) {
          curve.drawCurve(ctx, true, set.color, set.lineWidth, set.lineCap);
        } else {
          curve.drawParallels(ctx, true, set.color, set.lineWidth, set.lineCap);
        }
      }
    }
    if (PARAMS.editMode) {
      const set = PARAMS.sets[PARAMS.currSet];
      const curve = set.curve;
      ctx.save();
      curve.drawCurve(ctx, true, 'white', set.lineWidth * 3 + 10, set.lineCap);
      curve.drawCurve(ctx, true, set.color, set.lineWidth * 1.1, set.lineCap);
      curve.drawGuides(ctx);
      curve.drawAllPoints(ctx);
      ctx.restore();
    }
  };

  // Animation loop
  useEffect(() => {
    function animate() {
      draw();
      if (paramsRef.current.editMode) {
        animationRef.current = requestAnimationFrame(animate);
      }
    }
    animate();
    return () => cancelAnimationFrame(animationRef.current);
    // eslint-disable-next-line
  }, []);

  // Tweakpane setup
  useEffect(() => {
    if (paneRef.current) {
      paneRef.current.dispose();
    }
    const PARAMS = paramsRef.current;
    const pane = new Pane({ title: 'Curve Editor' });
    pane.registerPlugin(EssentialsPlugin);
    paneRef.current = pane;
    // Editor folder
    const f1 = pane.addFolder({ title: 'Editor', expanded: true });
    f1.addInput(PARAMS, 'editMode', { label: 'Edit Mode' }).on('change', () => {
      draw();
    });
    f1.addInput(PARAMS, 'currSet', {
      label: 'Current Curve',
      min: 0,
      max: PARAMS.sets.length - 1,
      step: 1,
    }).on('change', () => {
      updateInputs();
      draw();
    });
    // Edit Mode folder
    const f2 = f1.addFolder({
      title: `Edit Mode: ${PARAMS.currSet}/${PARAMS.sets.length - 1}`,
      expanded: true,
    });
    f2.addInput(PARAMS, 'currColor', { view: 'color', label: 'Stroke Color' }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.color = PARAMS.currColor;
      draw();
    });
    f2.addInput(PARAMS, 'currLineWidth', {
      label: 'Line Width',
      min: 0.1,
      max: 200,
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.lineWidth = PARAMS.currLineWidth;
      draw();
    });
    f2.addInput(PARAMS, 'currLineCap', {
      label: 'Line Cap',
      options: { butt: 'butt', round: 'round', square: 'square' },
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.lineCap = PARAMS.currLineCap;
      draw();
    });
    f2.addInput(PARAMS, 'currNumOfPar', {
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
    f2.addInput(PARAMS, 'currDisOfPar', {
      label: 'Distance',
      min: 0,
      max: 200,
      step: 1,
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.curve.setParDis(PARAMS.currDisOfPar);
      if (PARAMS.currNumOfPar >= 2) {
        set.curve.updateParallels(true);
      }
      draw();
    });
    function updateInputs() {
      const set = PARAMS.sets[PARAMS.currSet];
      PARAMS.currColor = set.color;
      PARAMS.currLineWidth = set.lineWidth;
      PARAMS.currLineCap = set.lineCap;
      PARAMS.currNumOfPar = set.curve.getParNum();
      PARAMS.currDisOfPar = set.curve.getParDis();
    }
    // Attach pane to DOM
    const paneContainer = document.getElementById('pane-container');
    if (paneContainer) {
      paneContainer.innerHTML = '';
      paneContainer.appendChild(pane.element);
    }
    // Cleanup
    return () => pane.dispose();
    // eslint-disable-next-line
  }, []);

  // Mouse interaction handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const PARAMS = paramsRef.current;
    let dragging = false;
    let dragPoint = null;
    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
      const y = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;
      return { x, y };
    }
    function onMouseDown(e) {
      if (!PARAMS.editMode) return;
      const { x, y } = getCanvasCoords(e);
      const curve = PARAMS.sets[PARAMS.currSet].curve;
      let hit = false;
      curve.points.forEach((point) => {
        point.isDragging = point.hitTest(x, y);
        if (!hit && point.isDragging && point.type === 0) {
          hit = true;
          dragPoint = point;
        }
      });
      if (!hit) {
        const newPoint = new Point({ x, y });
        curve.points.push(newPoint);
        curve.updateMidPoints();
        if (PARAMS.currNumOfPar >= 2) {
          curve.updateParallels(true);
        }
        dragPoint = newPoint;
        dragPoint.isDragging = true;
      }
      dragging = true;
      draw();
    }
    function onMouseMove(e) {
      if (!dragging || !PARAMS.editMode) return;
      const { x, y } = getCanvasCoords(e);
      const curve = PARAMS.sets[PARAMS.currSet].curve;
      curve.points.forEach((point) => {
        if (point.isDragging) {
          point.x = x;
          point.y = y;
        }
      });
      curve.updateMidPoints();
      if (curve.getParNum() >= 2) {
        curve.updateParallels(true);
      }
      draw();
    }
    function onMouseUp() {
      dragging = false;
      dragPoint = null;
      PARAMS.sets[PARAMS.currSet].curve.points.forEach((point) => {
        point.isDragging = false;
      });
      draw();
    }
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', background: '#f7f7f7' }}>
      <div id="pane-container" style={{ minWidth: 320, padding: 24, background: '#fff', boxShadow: '2px 0 8px #0001', zIndex: 2 }} />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          style={{ borderRadius: 16, boxShadow: '0 4px 32px #0002', background: '#fff', cursor: 'pointer', maxWidth: '90vw', maxHeight: '90vh' }}
        />
      </div>
    </div>
  );
}

export default App;
