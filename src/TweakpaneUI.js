import { Pane } from 'tweakpane';
import { plugins as EssentialsPlugins } from '@tweakpane/plugin-essentials';
import { PARAMS, settings } from './params.js';
import { Curve } from './classes/Curve.js';

export class TweakpaneUI {
  constructor(paneRef, onDraw) {
    this.paneRef = paneRef;
    this.onDraw = onDraw;
    this.paneInstance = null;
  }

  createPane() {
    if (this.paneInstance) {
      try {
        this.paneInstance.dispose();
      } catch (e) {
        // ignore disposal errors
      }
      this.paneInstance = null;
    }

    const pane = new Pane({ container: this.paneRef.current });
    pane.registerPlugin(EssentialsPlugins);

    // Add background color control at the top level
    

    const f1 = pane.addFolder({ title: 'Editor', expanded: true });
    const currentSet = PARAMS.sets[PARAMS.currSet];
    
    // Show name and index in the Edit Mode title
    const f2 = f1.addFolder({
      title: `Edit Mode: ${currentSet.name} (${PARAMS.currSet}/${PARAMS.sets.length - 1})`,
      expanded: true,
    });

    f1.addBinding(settings, 'backgroundColor', { view: 'color', label: 'Background Color' }).on('change', () => {
      if (this.onDraw) this.onDraw();
    });

    // Edit Mode toggle
    f1.addBinding(PARAMS, 'editMode', { label: 'Edit Mode' }).on('change', () => {
      if (this.onDraw) this.onDraw();
    });

    // Current curve selection - using addBinding for dropdown selection
    const curveOptions = {};
    PARAMS.sets.forEach((set, idx) => {
      curveOptions[`${set.name} (${idx})`] = idx;
    });

    f1.addBinding(PARAMS, 'currSet', {
      label: 'Current Curve',
      options: curveOptions,
    }).on('change', () => {
      // When switching curves, rebuild pane so the title and name field update
      setTimeout(() => {
        this.createPane();
        if (this.onDraw) this.onDraw();
      }, 0);
    });

    // Curve name field - using addBinding for text input
    f2.addBinding(currentSet, 'name', { label: 'Name' }).on('change', () => {
      // Re-create pane so dropdown labels update to new name
      setTimeout(() => {
        this.createPane();
        if (this.onDraw) this.onDraw();
      }, 0);
    });

    // Style properties - using addBinding for all style controls
    f2.addBinding(PARAMS, 'currColor', { view: 'color', label: 'Stroke Color' }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.color = PARAMS.currColor;
      if (this.onDraw) this.onDraw();
    });

    f2.addBinding(PARAMS, 'currLineWidth', {
      label: 'Line Width',
      min: 0.1,
      max: 100,
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.lineWidth = PARAMS.currLineWidth;
      if (this.onDraw) this.onDraw();
    });

    f2.addBinding(PARAMS, 'currLineCap', {
      label: 'Line Cap',
      options: { butt: 'butt', round: 'round', square: 'square' },
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.lineCap = PARAMS.currLineCap;
      if (this.onDraw) this.onDraw();
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
      if (this.onDraw) this.onDraw();
    });

    f2.addBinding(PARAMS, 'currDisOfPar', {
      label: 'Distance',
      min: 5,
      max: 150,
    }).on('change', () => {
      const set = PARAMS.sets[PARAMS.currSet];
      set.curve.setParDis(PARAMS.currDisOfPar);
      if (set.curve.getParNum() >= 2) {
        set.curve.updateParallels(true);
      }
      if (this.onDraw) this.onDraw();
    });

    // Delete this curve
    f2.addButton({ title: 'Delete this curve' }).on('click', () => {
      PARAMS.sets.splice(PARAMS.currSet, 1);
      PARAMS.currSet = Math.max(0, PARAMS.currSet - 1);
      if (PARAMS.sets.length === 0) {
        this.startNewCurve();
      }
      // Re-create pane so dropdown and titles update
      setTimeout(() => {
        this.createPane();
        if (this.onDraw) this.onDraw();
      }, 0);
    });

    // Add a new curve
    f1.addButton({ title: 'Add a new curve' }).on('click', () => {
      this.startNewCurve();
      PARAMS.currSet = PARAMS.sets.length - 1;
      // Re-create pane with the new curve's name in dropdown
      setTimeout(() => {
        this.createPane();
        if (this.onDraw) this.onDraw();
      }, 0);
    });

    f2.hidden = !PARAMS.editMode;
    this.paneInstance = pane;
  }

  // Add a new empty curve
  startNewCurve() {
    PARAMS.sets = PARAMS.sets.filter((set) => set.curve.points.length > 0);
    // Determine new index before pushing
    const newIndex = PARAMS.sets.length;
    PARAMS.sets.push({
      name: `Curve ${newIndex}`, // default name based on index
      curve: new Curve({ points: [] }),
      color: '#000000',
      lineWidth: 5,
      lineCap: 'butt',
      pairsOdd: [],
      pairDouble: [],
    });
  }

  dispose() {
    if (this.paneInstance) {
      try {
        this.paneInstance.dispose();
      } catch (e) {
        // ignore
      }
      this.paneInstance = null;
    }
  }
} 