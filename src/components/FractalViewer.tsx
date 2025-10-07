import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FractalCanvas } from './FractalCanvas';
import { ControlPanel } from './ControlPanel';
import { FractalParameters, FractalType } from '../types/fractal';

const defaultParameters: FractalParameters = {
  type: 'mandelbrot',
  centerX: -0.5,
  centerY: 0,
  zoom: 1,
  maxIterations: 100,
  colorScheme: 'rainbow',
  juliaReal: -0.7,
  juliaImag: 0.27015,
  power: 2,
  bailout: 2,
  colorOffset: 0,
  colorScale: 1,
};

export const FractalViewer: React.FC = () => {
  const [parameters, setParameters] = useState<FractalParameters>(defaultParameters);
  const [isRendering, setIsRendering] = useState(false);
  const [renderTime, setRenderTime] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log('FractalViewer component mounted');
  }, []);

  const handleParameterChange = useCallback((newParams: Partial<FractalParameters>) => {
    setParameters(prev => ({ ...prev, ...newParams }));
  }, []);

  const handleRenderComplete = useCallback((time: number) => {
    setRenderTime(time);
    setIsRendering(false);
  }, []);

  const handleRenderStart = useCallback(() => {
    setIsRendering(true);
  }, []);

  const resetView = useCallback(() => {
    setParameters(defaultParameters);
  }, []);

  const randomizeJulia = useCallback(() => {
    const real = (Math.random() - 0.5) * 2;
    const imag = (Math.random() - 0.5) * 2;
    setParameters(prev => ({
      ...prev,
      juliaReal: real,
      juliaImag: imag,
    }));
  }, []);

  return (
    <div className="app">
      <div className="canvas-container">
        <FractalCanvas
          ref={canvasRef}
          parameters={parameters}
          onRenderStart={handleRenderStart}
          onRenderComplete={handleRenderComplete}
        />
        {isRendering && (
          <div className="loading-overlay">
            Rendering fractal...
          </div>
        )}
      </div>
      
      <ControlPanel
        parameters={parameters}
        onParameterChange={handleParameterChange}
        onReset={resetView}
        onRandomizeJulia={randomizeJulia}
        renderTime={renderTime}
      />
    </div>
  );
};
