import { Pane } from 'tweakpane';
import { plugins as EssentialsPlugins } from '@tweakpane/plugin-essentials';
import { PARAMS, settings } from './params.js';
import { Curve } from './classes/Curve.js';

/**
 * TweakpaneUI Class
 * 
 * Manages the Tweakpane interface for controlling curve properties.
 * Provides a user interface for adjusting curve parameters in real-time.
 * 
 * @class
 */
export class TweakpaneUI {
  /**
   * Creates a new TweakpaneUI instance
   * @param {HTMLElement} paneRef - Reference to the pane container element
   * @param {Function} onUpdate - Callback function to trigger when parameters change
   */
  constructor(paneRef, onUpdate) {
    this.paneRef = paneRef;
    this.onUpdate = onUpdate;
    this.pane = null;
  }

  /**
   * Creates the Tweakpane interface with all controls
   */
  createPane() {
    if (this.pane) {
      this.pane.dispose();
    }

    this.pane = new Pane({
      container: this.paneRef,
      title: 'Curve Controls'
    });

    // Add curve style controls
    this.pane.addInput(PARAMS, 'currColor', {
      label: 'Color',
      view: 'color'
    }).on('change', this.onUpdate);

    this.pane.addInput(PARAMS, 'currLineWidth', {
      label: 'Line Width',
      min: 1,
      max: 20,
      step: 1
    }).on('change', this.onUpdate);

    this.pane.addInput(PARAMS, 'currLineCap', {
      label: 'Line Cap',
      options: {
        'Butt': 'butt',
        'Round': 'round',
        'Square': 'square'
      }
    }).on('change', this.onUpdate);

    // Add parallel lines controls
    this.pane.addInput(PARAMS, 'currNumOfPar', {
      label: 'Number of Parallels',
      min: 0,
      max: 10,
      step: 1
    }).on('change', this.onUpdate);

    this.pane.addInput(PARAMS, 'currDisOfPar', {
      label: 'Parallel Distance',
      min: 1,
      max: 50,
      step: 1
    }).on('change', this.onUpdate);

    // Add edit mode toggle
    this.pane.addInput(PARAMS, 'editMode', {
      label: 'Edit Mode'
    }).on('change', this.onUpdate);
  }

  /**
   * Disposes of the Tweakpane instance
   */
  dispose() {
    if (this.pane) {
      this.pane.dispose();
      this.pane = null;
    }
  }
} 