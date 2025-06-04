import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { PARAMS, settings } from './params.js';
import { Curve } from './classes/Curve.js';
import './CustomControls.css';

function startNewCurve() {
  PARAMS.sets = PARAMS.sets.filter(set => set.curve.points.length > 0);
  const newIndex = PARAMS.sets.length;
  PARAMS.sets.push({
    name: `Curve ${newIndex}`,
    curve: new Curve({ points: [] }),
    color: '#000000',
    lineWidth: 5,
    lineCap: 'butt',
    pairsOdd: [],
    pairDouble: [],
  });
}

function CustomControls({ onDraw }, ref) {
  const [backgroundColor, setBackgroundColor] = useState(settings.backgroundColor);
  const [editMode, setEditMode] = useState(PARAMS.editMode);
  const [currSet, setCurrSet] = useState(PARAMS.currSet);
  const [curveName, setCurveName] = useState(PARAMS.sets[PARAMS.currSet].name);
  const [strokeColor, setStrokeColor] = useState(PARAMS.currColor);
  const [lineWidth, setLineWidth] = useState(PARAMS.currLineWidth);
  const [lineCap, setLineCap] = useState(PARAMS.currLineCap);
  const [numPar, setNumPar] = useState(PARAMS.currNumOfPar);
  const [distPar, setDistPar] = useState(PARAMS.currDisOfPar);

  const refreshState = () => {
    const idx = PARAMS.currSet;
    const set = PARAMS.sets[idx];
    setBackgroundColor(settings.backgroundColor);
    setEditMode(PARAMS.editMode);
    setCurrSet(idx);
    setCurveName(set.name);
    setStrokeColor(set.color);
    setLineWidth(set.lineWidth);
    setLineCap(set.lineCap);
    setNumPar(set.curve.getParNum());
    setDistPar(set.curve.getParDis());
  };

  useImperativeHandle(ref, () => ({
    refresh: refreshState
  }));

  useEffect(() => {
    refreshState();
  }, []);

  const updateBackgroundColor = (value) => {
    setBackgroundColor(value);
    settings.backgroundColor = value;
    if (onDraw) onDraw();
  };

  const updateEditMode = (value) => {
    setEditMode(value);
    PARAMS.editMode = value;
    settings.animate = value;
    if (onDraw) onDraw();
  };

  const updateCurrSet = (value) => {
    const idx = parseInt(value, 10);
    if (idx >= 0 && idx < PARAMS.sets.length) {
      PARAMS.currSet = idx;
      const set = PARAMS.sets[idx];
      PARAMS.currColor = set.color;
      PARAMS.currLineWidth = set.lineWidth;
      PARAMS.currLineCap = set.lineCap;
      PARAMS.currNumOfPar = set.curve.getParNum();
      PARAMS.currDisOfPar = set.curve.getParDis();
      refreshState();
      if (onDraw) onDraw();
    }
  };

  const updateCurveName = (value) => {
    setCurveName(value);
    PARAMS.sets[PARAMS.currSet].name = value;
    if (onDraw) onDraw();
  };

  const updateStrokeColor = (value) => {
    setStrokeColor(value);
    PARAMS.currColor = value;
    PARAMS.sets[PARAMS.currSet].color = value;
    if (onDraw) onDraw();
  };

  const updateLineWidth = (value) => {
    const n = parseFloat(value);
    setLineWidth(n);
    PARAMS.currLineWidth = n;
    PARAMS.sets[PARAMS.currSet].lineWidth = n;
    if (onDraw) onDraw();
  };

  const updateLineCap = (value) => {
    setLineCap(value);
    PARAMS.currLineCap = value;
    PARAMS.sets[PARAMS.currSet].lineCap = value;
    if (onDraw) onDraw();
  };

  const updateNumPar = (value) => {
    const n = parseInt(value, 10);
    setNumPar(n);
    PARAMS.currNumOfPar = n;
    const curve = PARAMS.sets[PARAMS.currSet].curve;
    curve.setParNum(n);
    if (n >= 2) curve.updateParallels(true);
    if (onDraw) onDraw();
  };

  const updateDistPar = (value) => {
    const n = parseFloat(value);
    setDistPar(n);
    PARAMS.currDisOfPar = n;
    const curve = PARAMS.sets[PARAMS.currSet].curve;
    curve.setParDis(n);
    if (curve.getParNum() >= 2) curve.updateParallels(true);
    if (onDraw) onDraw();
  };

  const deleteCurve = () => {
    PARAMS.sets.splice(PARAMS.currSet, 1);
    PARAMS.currSet = Math.max(0, PARAMS.currSet - 1);
    if (PARAMS.sets.length === 0) {
      startNewCurve();
      PARAMS.currSet = 0;
    }
    refreshState();
    if (onDraw) onDraw();
  };

  const addCurve = () => {
    startNewCurve();
    PARAMS.currSet = PARAMS.sets.length - 1;
    refreshState();
    if (onDraw) onDraw();
  };

  return (
    <div className="control-pane">
      <h3>Editor</h3>
      <label>
        Background Color
        <input type="color" value={backgroundColor} onChange={(e) => updateBackgroundColor(e.target.value)} />
      </label>
      <label>
        Edit Mode
        <input type="checkbox" checked={editMode} onChange={(e) => updateEditMode(e.target.checked)} />
      </label>
      <label>
        Current Curve
        <select value={currSet} onChange={(e) => updateCurrSet(e.target.value)}>
          {PARAMS.sets.map((set, idx) => (
            <option key={idx} value={idx}>{`${set.name} (${idx})`}</option>
          ))}
        </select>
      </label>
      {editMode && (
        <div className="edit-section">
          <h4>{`Edit Mode: ${curveName} (${currSet}/${PARAMS.sets.length - 1})`}</h4>
          <label>
            Name
            <input type="text" value={curveName} onChange={(e) => updateCurveName(e.target.value)} />
          </label>
          <label>
            Stroke Color
            <input type="color" value={strokeColor} onChange={(e) => updateStrokeColor(e.target.value)} />
          </label>
          <label>
            Line Width
            <input type="number" min="0.1" max="100" step="0.1" value={lineWidth} onChange={(e) => updateLineWidth(e.target.value)} />
          </label>
          <label>
            Line Cap
            <select value={lineCap} onChange={(e) => updateLineCap(e.target.value)}>
              <option value="butt">butt</option>
              <option value="round">round</option>
              <option value="square">square</option>
            </select>
          </label>
          <label>
            Num of Parallels
            <input type="number" min="0" max="200" step="1" value={numPar} onChange={(e) => updateNumPar(e.target.value)} />
          </label>
          <label>
            Distance
            <input type="number" min="5" max="150" step="1" value={distPar} onChange={(e) => updateDistPar(e.target.value)} />
          </label>
          <button onClick={deleteCurve} className="button" id="red">Delete this curve</button>
        </div>
      )}
      <button onClick={addCurve} className="button" id="green">Add a new curve</button>
    </div>
  );
}

export default forwardRef(CustomControls);
