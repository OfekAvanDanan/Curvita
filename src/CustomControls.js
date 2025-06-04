import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { PARAMS, settings } from './params.js';
import { Curve } from './classes/Curve.js';
import './CustomControls.css';

function startNewCurve() {
  PARAMS.sets = PARAMS.sets.filter(set => set.curve.points.length > 0);
  const newIndex = PARAMS.sets.length;
  PARAMS.sets.push({
    name: `Curve ${newIndex}`,
    curve: new Curve({ points: [] }),
    color: '#ffffff',
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
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

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

  const updateEditMode = (checked) => {
    setEditMode(checked);
    PARAMS.editMode = checked;
    settings.animate = checked;
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
    // slider value is 0..100, map exponentially to 0.1..200
    const normalized = parseFloat(value) / 100;
    const n = Math.pow(normalized, 2) * (200 - 0.1) + 0.1; // exp curve
    setLineWidth(Number(n.toFixed(1)));
    PARAMS.currLineWidth = n;
    PARAMS.sets[PARAMS.currSet].lineWidth = n;
    if (onDraw) onDraw();
  };

  const updateLineWidthInput = (value) => {
    const n = parseFloat(value);
    setLineWidth(n);
    // adjust slider position accordingly
    // invert mapping: sliderPos = sqrt((n - 0.1)/(200 - 0.1)) * 100
    const ratio = (n - 0.1) / (200 - 0.1);
    const sliderPos = Math.sqrt(Math.max(0, ratio)) * 100;
    document.getElementById('slider-lineWidth').value = sliderPos;
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
    // slider value is 0..100, map exponentially to 0..200
    const normalized = parseFloat(value) / 100;
    const n = Math.round(Math.pow(normalized, 2) * 200);
    setNumPar(n);
    PARAMS.currNumOfPar = n;
    const curve = PARAMS.sets[PARAMS.currSet].curve;
    curve.setParNum(n);
    if (n >= 2) curve.updateParallels(true);
    if (onDraw) onDraw();
  };

  const updateNumParInput = (value) => {
    const n = parseInt(value, 10);
    setNumPar(n);
    const ratio = n / 200;
    const sliderPos = Math.sqrt(Math.max(0, ratio)) * 100;
    document.getElementById('slider-numPar').value = sliderPos;
    PARAMS.currNumOfPar = n;
    const curve = PARAMS.sets[PARAMS.currSet].curve;
    curve.setParNum(n);
    if (n >= 2) curve.updateParallels(true);
    if (onDraw) onDraw();
  };

  const updateDistPar = (value) => {
    // slider value is 0..100, map exponentially to 2..100
    const normalized = parseFloat(value) / 100;
    const n = Math.pow(normalized, 2) * (100 - 2) + 2;
    setDistPar(Number(n.toFixed(1)));
    PARAMS.currDisOfPar = n;
    const curve = PARAMS.sets[PARAMS.currSet].curve;
    curve.setParDis(n);
    if (curve.getParNum() >= 2) curve.updateParallels(true);
    if (onDraw) onDraw();
  };

  const updateDistParInput = (value) => {
    const n = parseFloat(value);
    setDistPar(n);
    const ratio = (n - 2) / (100 - 2);
    const sliderPos = Math.sqrt(Math.max(0, ratio)) * 100;
    document.getElementById('slider-distPar').value = sliderPos;
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

  const handleEditClick = (e, idx) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingName(idx);
    setTempName(PARAMS.sets[idx].name);
  };

  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleNameBlur = () => {
    if (tempName.trim()) {
      PARAMS.sets[editingName].name = tempName.trim();
      if (editingName === PARAMS.currSet) {
        setCurveName(tempName.trim());
      }
    }
    setEditingName(false);
    if (onDraw) onDraw();
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setEditingName(false);
    }
  };

  const downloadCanvas = () => {
    // Store current edit mode state
    const wasEditMode = PARAMS.editMode;
    
    // Temporarily disable edit mode
    PARAMS.editMode = false;
    
    // Redraw without guides
    if (onDraw) onDraw();
    
    // Get the canvas data URL
    const canvas = document.querySelector('canvas');
    const dataURL = canvas.toDataURL('image/png');
    
    // Create download link
    const link = document.createElement('a');
    link.download = 'curvita-design.png';
    link.href = dataURL;
    link.click();
    
    // Restore edit mode state
    PARAMS.editMode = wasEditMode;
    if (onDraw) onDraw();
  };

  return (
    <div className="control-pane">
      <label className="lable">
        Editor
       
        <span className="toggle-slider" />
        <input
          type="checkbox"
          checked={editMode}
          onChange={(e) => updateEditMode(e.target.checked)}
          className="toggle-input"
        />
      </label>

<label className="lable">
  <br/>
<button onClick={downloadCanvas} className="subttle-button" >
        Download Design
      </button>
</label>
      <label className='lable'>
        Background
        <input
          type="color"
          value={backgroundColor}
          onChange={(e) => updateBackgroundColor(e.target.value)}
          className="color-input"
        />
      </label>

      <label className='lable'>
        Current Curve
        <div className='liniar-layout'>
        {editingName === currSet ? (
          <div className="name-edit-container">
            <input
              type="text"
              value={tempName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleNameKeyDown}
              autoFocus
            />
          </div>
        ) : (
          <>
            <select value={currSet} onChange={(e) => updateCurrSet(e.target.value)}>
              {PARAMS.sets.map((set, idx) => (
                <option key={idx} value={idx}>
                  {`${set.name} (${idx})`}
                </option>
              ))}
            </select>
            <button
              className="subttle-button"
              onClick={(e) => handleEditClick(e, currSet)}
              title="Edit curve name"
            >
              ✎
            </button>
          </>
        )}
        </div>
      </label>

     {/*  {editMode && (
        <div className="edit-section">
          <h4>{`Edit Mode: ${curveName} (${currSet}/${PARAMS.sets.length - 1})`}</h4>

          <label>
            Name
            <input
              type="text"
              value={curveName}
              onChange={(e) => updateCurveName(e.target.value)}
            />
          </label>

          <label>
            Stroke Color
            <input
              type="color"
              value={strokeColor}
              onChange={(e) => updateStrokeColor(e.target.value)}
              className="color-input"
            />
          </label>

          <label>
            Line Width
            <div className="slider-input-group">
              <input
                type="range"
                id="slider-lineWidth"
                min="0"
                max="100"
                defaultValue={Math.sqrt((lineWidth - 0.1) / (200 - 0.1)) * 100}
                onInput={(e) => updateLineWidth(e.target.value)}
                className="slider"
              />
              <input
                type="number"
                min="0.1"
                max="200"
                step="0.1"
                value={lineWidth}
                onChange={(e) => updateLineWidthInput(e.target.value)}
              />
            </div>
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
            Number of Parallels
            <div className="slider-input-group">
              <input
                type="range"
                id="slider-numPar"
                min="0"
                max="100"
                defaultValue={Math.sqrt(numPar / 200) * 100}
                onInput={(e) => updateNumPar(e.target.value)}
                className="slider"
              />
              <input
                type="number"
                min="0"
                max="200"
                step="1"
                value={numPar}
                onChange={(e) => updateNumParInput(e.target.value)}
              />
            </div>
          </label>

          <label>
            Distance
            <div className="slider-input-group">
              <input
                type="range"
                id="slider-distPar"
                min="0"
                max="100"
                defaultValue={Math.sqrt((distPar - 2) / (100 - 2)) * 100}
                onInput={(e) => updateDistPar(e.target.value)}
                className="slider"
              />
              <input
                type="number"
                min="2"
                max="100"
                step="0.1"
                value={distPar}
                onChange={(e) => updateDistParInput(e.target.value)}
              />
            </div>
          </label>

          <button onClick={deleteCurve} className="button" id="red">
            Delete this curve
          </button>
            <button onClick={addCurve} className="button" id="green">
        Add a new curve
      </button>
        </div>
      )} */}

    

     
    </div>
  );
}

export default forwardRef(CustomControls);
