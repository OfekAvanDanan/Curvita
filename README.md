# 🎨 Curvita

**Curvita** is a minimalistic curve-drawing playground, designed for creative expression through smooth bezier lines and dynamic parallel curves.

> A polished blend of geometry and style – made with ❤️ using **React** and **Canvas API**.

### 🌐 Live Demo  
👉 [Try Curvita on GitHub Pages](https://ofekavandanan.github.io/Curvita/)

---

## ✨ Features

- Draw and edit smooth curves
- Add dynamic parallel lines
- Customize stroke color, width, and cap style
- Built with **React**, **Tweakpane**, and native **Canvas rendering**

---

## 🛠️ Tech Stack

- **React**
- **Canvas API**
- **Tweakpane** for UI controls
- **CSS Glassmorphism** (dark mode, blurred panels, subtle animations)

---

## 🧠 Author

Developed by [Ofek Avan Danan](https://github.com/OfekAvanDanan)

---

## 📂 Project Setup

```bash
npm install
npm start
```

Make sure you're using Node.js 16+.

## 🪄 License
MIT – Feel free to fork, remix, and make something cool.

# Curvita - Interactive Curve Drawing Playground

A minimalistic web application for drawing and manipulating Bezier curves with a modern, intuitive interface.

## Features

- Draw and edit Bezier curves with an intuitive point-and-click interface
- Add parallel lines to curves with customizable distance and count
- Customize curve properties:
  - Stroke color
  - Line width
  - Line cap style
- Download your designs as PNG images
- Real-time curve manipulation with visual guides
- Modern, responsive UI with dark mode support

## Tech Stack

- React.js for the frontend framework
- HTML5 Canvas for curve rendering
- Tweakpane for the control panel UI
- CSS3 for styling and animations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/OfekAvanDanan/Curvita.git
   cd Curvita
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Drawing Curves**
   - Click on the canvas to add control points
   - Drag points to adjust the curve
   - Right-click a point to delete it

2. **Editing Curves**
   - Use the control panel to adjust curve properties
   - Toggle edit mode to show/hide control points
   - Add parallel lines with customizable distance

3. **Saving Designs**
   - Click the "Download Design" button to save your work
   - The design will be saved as a PNG image

## Development

### Project Structure

```
src/
├── classes/
│   ├── Curve.js    # Bezier curve implementation
│   └── Point.js    # Control point implementation
├── components/
│   └── SketchCurvesWindow.js  # Main canvas component
├── styles/
│   ├── App.css
│   ├── TweakpaneVision.css
│   └── index.css
├── App.js
└── params.js       # Global parameters and settings
```

### Building for Production

```bash
npm run build
```

### Deployment

The application is configured for deployment to GitHub Pages:

```bash
npm run deploy
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Tweakpane](https://github.com/cocopon/tweakpane) for the control panel UI
- [React](https://reactjs.org/) for the frontend framework
- [HTML5 Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) for curve rendering