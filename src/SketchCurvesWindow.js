import React, { useRef, useEffect, useCallback } from 'react';
import { Point } from './classes/Point.js';
import { getCurve } from './classes/Curve.js';
import { SELECTED_LINE_CURVE } from "./curveStyle.js";
import { PARAMS, settings } from './params.js';
import { TweakpaneUI } from './TweakpaneUI.js';

export default function SketchCurvesWindow() {
  const canvasRef = useRef(null);
  const paneRef = useRef(null);
  const animationRef = useRef();
  const tweakpaneUI = useRef();
  const prevPointIndexRef = useRef(-1);
  const mouseMoveHandlerRef = useRef(null);
  const mouseUpHandlerRef = useRef(null);
  const touchMoveHandlerRef = useRef(null);
  const touchEndHandlerRef = useRef(null);
  const lastTapTimeRef = useRef(0);
  const lastTapPointRef = useRef(null);

  // Helper to get canvas context
  const getContext = () => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext('2d') : null;
  };

  // Redraw function
  const draw = useCallback(() => {
    const context = getContext();
    if (!context) return;
    const width = settings.dimensions[0];
    const height = settings.dimensions[1];
    context.clearRect(0, 0, width, height);
    context.fillStyle = settings.backgroundColor;
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
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    draw();
    if (settings.animate) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [draw]);

  // Mouse event handlers
  const onMouseMove = useCallback((e) => {
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
  }, [draw]);

  const onMouseUp = useCallback(() => {
    window.removeEventListener('mousemove', mouseMoveHandlerRef.current);
    window.removeEventListener('mouseup', mouseUpHandlerRef.current);
  }, []);

  const onTouchMove = useCallback((e) => {
    e.preventDefault(); // Prevent scrolling while dragging
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;
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
  }, [draw]);

  const onTouchEnd = useCallback(() => {
    window.removeEventListener('touchmove', touchMoveHandlerRef.current);
    window.removeEventListener('touchend', touchEndHandlerRef.current);
  }, []);

  const onMouseDown = useCallback((e) => {
    if (!PARAMS.editMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;

    handlePointInteraction(x, y, e.button === 2);
  }, []);

  const onTouchStart = useCallback((e) => {
    if (!PARAMS.editMode) return;
    e.preventDefault(); // Prevent default touch behavior

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = ((touch.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((touch.clientY - rect.top) / rect.height) * canvas.height;

    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTimeRef.current;
    
    // Check if this is a double tap (within 300ms and near the same point)
    if (lastTapPointRef.current && tapLength < 300) {
      const lastPoint = lastTapPointRef.current;
      const dx = lastPoint.x - x;
      const dy = lastPoint.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 20) { // If taps are close enough
        handlePointInteraction(x, y, true); // true for delete
        lastTapTimeRef.current = 0; // Reset to prevent triple tap
        lastTapPointRef.current = null;
        return;
      }
    }
    
    // Update last tap info
    lastTapTimeRef.current = currentTime;
    lastTapPointRef.current = { x, y };
    
    handlePointInteraction(x, y, false);
  }, []);

  const handlePointInteraction = useCallback((x, y, isRightClick) => {
    // First check if we clicked on any curve
    let clickedCurveIndex = -1;
    for (let i = 0; i < PARAMS.sets.length; i++) {
      const curve = PARAMS.sets[i].curve;
      // If fewer than 2 points, skip distance check
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
      const set = PARAMS.sets[PARAMS.currSet];
      PARAMS.currColor = set.color;
      PARAMS.currLineWidth = set.lineWidth;
      PARAMS.currLineCap = set.lineCap;
      PARAMS.currNumOfPar = set.curve.getParNum();
      PARAMS.currDisOfPar = set.curve.getParDis();
      if (tweakpaneUI.current) {
        tweakpaneUI.current.createPane();
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
      prevPointIndexRef.current = clickedPointIndex;
    }

    if (clickedPoint) {
      if (isRightClick) { // Right click: delete the point
        curve.points.splice(clickedPointIndex, 1);
        curve.updateMidPoints();
        if (PARAMS.currNumOfPar >= 2) {
          curve.updateParallels(true);
        }
      } else { // Left click: select and drag
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
      if (prevPointIndexRef.current === 0) {
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
    mouseMoveHandlerRef.current = onMouseMove;
    mouseUpHandlerRef.current = onMouseUp;
    touchMoveHandlerRef.current = onTouchMove;
    touchEndHandlerRef.current = onTouchEnd;
    window.addEventListener('mousemove', mouseMoveHandlerRef.current);
    window.addEventListener('mouseup', mouseUpHandlerRef.current);
    window.addEventListener('touchmove', touchMoveHandlerRef.current);
    window.addEventListener('touchend', touchEndHandlerRef.current);
  }, [draw, onMouseMove, onMouseUp, onTouchMove, onTouchEnd]);

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
    
    // Initialize Tweakpane UI
    tweakpaneUI.current = new TweakpaneUI(paneRef, draw);
    tweakpaneUI.current.createPane();
    
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart);
    if (settings.animate) animate();
    
    // HMR: Redraw canvas when classes change (for instant feedback)
    if (module.hot) {
      module.hot.accept(['./classes/Curve.js', './classes/Point.js'], () => {
        draw();
      });
    }
    
    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (tweakpaneUI.current) {
        tweakpaneUI.current.dispose();
      }
    };
  }, [draw, onMouseDown, onTouchStart, animate]);

  const downloadCanvas = useCallback(() => {
    // Store current edit mode state
    const wasEditMode = PARAMS.editMode;
    
    // Temporarily disable edit mode
    PARAMS.editMode = false;
    
    // Redraw without guides
    draw();
    
    // Get the canvas data URL
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'curvita-design.png';
    link.href = dataURL;
    link.click();
    
    // Restore edit mode state
    PARAMS.editMode = wasEditMode;
    draw();
  }, [draw]);

  return (
    <div className="CanvasBox">
      <canvas
        ref={canvasRef}
        width={settings.dimensions[0]}
        height={settings.dimensions[1]}
        style={{
          display: 'block'
        }}
      />
      <div>
        <div ref={paneRef} style={{ minWidth: 320 }} />
        <button 
          onClick={downloadCanvas}
          className='button' id="green"
        >
          Download Design
        </button>
      </div>
    </div>
  );
}
