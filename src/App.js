/**
 * App Component
 * 
 * The main application component that provides the user interface
 * for the curve drawing application. It includes the header, main
 * content area, and footer.
 * 
 * @component
 */
import React from 'react';
import SketchCurvesWindow from './SketchCurvesWindow';
import './App.css';
import './TweakpaneVision.css';
import CurvitaLogo from './media/Curvita.svg';
import OfekLogo from "./media/Ofek White Icon.svg";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src='/media/Curvita.svg' alt="Curvita"/>
        <p>
          A minimalistic curve-drawing playground
        </p>
      </header>
      <main>
        <img src={OfekLogo} id="main-logo" alt="Ofek" />
        
        <div className='glassy-panel'>
          <div className='Title'>
            <img src={CurvitaLogo} id="app-icon" alt="Curvita" />
            <h1>Curvita</h1>
          </div>

          <p className="tagline">
            Curvita is a minimalistic visual tool for designing smooth curved lines and their parallels.<br/>
            Great for exploring creative geometric forms and elegant compositions.
          </p>

          <div className='CanvasBox'>
            <SketchCurvesWindow />
          </div>

          <p className="info">
            Version 1.0 · Created by Ofek Avan Danan
          </p>
        </div>
      </main>
      <footer>
        <p>Created with ❤️ by Ofek Avan Danan</p>
      </footer>
    </div>
  );
}

export default App;
