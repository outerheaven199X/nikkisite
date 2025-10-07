# 🌌 Fractal Parametric Viewer

Interactive real-time fractal explorer with parametric controls for mathematical visualization and artistic exploration.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-green)](#)

## 🛠 Built With

- **React 18.3.1** — Modern UI framework with hooks
- **TypeScript 5.6.3** — Type-safe development
- **esbuild 0.21.5** — Lightning-fast bundling
- **Canvas API** — High-performance fractal rendering
- **Web Workers** — Non-blocking computation (planned)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation & Run

```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build for production
npm run build

# Serve built application
npm start
```

## 🎮 Usage

### Basic Exploration

```bash
npm run dev
```

Navigate to `http://localhost:5173` and:

1. **Select fractal type** — Mandelbrot, Julia, Burning Ship, Tricorn, or Multibrot
2. **Adjust parameters** — Zoom, center point, iterations, color schemes
3. **Real-time rendering** — Changes update instantly with performance metrics

### Parameter Controls

- **Center X/Y** — Pan around the complex plane
- **Zoom** — Magnify fractal details (0.1x to 1000x)
- **Max Iterations** — Detail level vs performance (10-1000)
- **Color Schemes** — Rainbow, Fire, Ocean, Grayscale, Neon
- **Julia Parameters** — Real/imaginary components for Julia sets
- **Power** — Fractal exponent (1.0-10.0)
- **Bailout** — Escape radius threshold

## ✨ Features

- **5 Fractal Types** — Mandelbrot, Julia, Burning Ship, Tricorn, Multibrot
- **Real-time Rendering** — Instant parameter updates with Canvas API
- **5 Color Schemes** — Rainbow, Fire, Ocean, Grayscale, Neon
- **Smooth Coloring** — Continuous color gradients for mathematical beauty
- **Performance Metrics** — Render time and resolution display
- **Responsive Design** — Works on desktop and mobile
- **TypeScript** — Full type safety and IntelliSense
- **Modern Build** — esbuild for fast development and production builds

## 🖼 Visuals

![Fractal Viewer Interface](https://via.placeholder.com/800x400/1a1a2e/ffffff?text=Fractal+Parametric+Viewer)

*Interactive fractal exploration with real-time parameter adjustment and multiple color schemes.*

## 🔧 Configuration

### Environment Variables

No environment variables required for basic operation.

### Build Configuration

```typescript
// scripts/build.ts
const isProduction = process.env.NODE_ENV === 'production';
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "jsx": "react-jsx",
    "strict": true
  }
}
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run tests with coverage
npm run test:coverage
```

*Test suite planned for Q2 2024 with Jest and React Testing Library.*

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-fractal`
3. Commit changes: `git commit -m 'Add amazing fractal type'`
4. Push to branch: `git push origin feature/amazing-fractal`
5. Open Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🗺 Roadmap

- **Web Workers** — Offload fractal computation to background threads
- **Export Features** — Save high-resolution fractal images
- **Animation System** — Parameter interpolation and keyframe animation
- **3D Fractals** — Extend to three-dimensional fractal visualization
- **Shader Support** — GPU-accelerated rendering with WebGL
