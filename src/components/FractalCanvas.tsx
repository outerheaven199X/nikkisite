import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { FractalParameters } from '../types/fractal';
import { FractalRenderer } from '../utils/FractalRenderer';

interface FractalCanvasProps {
  parameters: FractalParameters;
  onRenderStart: () => void;
  onRenderComplete: (time: number) => void;
}

export interface FractalCanvasRef {
  render: () => Promise<void>;
  getCanvas: () => HTMLCanvasElement | null;
}

export const FractalCanvas = forwardRef<FractalCanvasRef, FractalCanvasProps>(
  ({ parameters, onRenderStart, onRenderComplete }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const rendererRef = useRef<FractalRenderer | null>(null);

    useImperativeHandle(ref, () => ({
      render: async () => {
        if (!canvasRef.current || !rendererRef.current) return;
        
        onRenderStart();
        const startTime = performance.now();
        
        try {
          await rendererRef.current.render(parameters);
          const endTime = performance.now();
          onRenderComplete(endTime - startTime);
        } catch (error) {
          console.error('Render error:', error);
          onRenderComplete(0);
        }
      },
      getCanvas: () => canvasRef.current,
    }));

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Initialize renderer
      rendererRef.current = new FractalRenderer(canvas);

      // Handle resize
      const handleResize = () => {
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(dpr, dpr);
          canvas.style.width = rect.width + 'px';
          canvas.style.height = rect.height + 'px';
        }
        
        console.log(`Canvas resized: ${canvas.width}x${canvas.height} (${rect.width}x${rect.height})`);
      };

      handleResize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }, []);

    useEffect(() => {
      if (rendererRef.current) {
        rendererRef.current.render(parameters).catch(error => {
          console.error('Render error:', error);
        });
      }
    }, [parameters]);

    return (
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'crosshair',
        }}
      />
    );
  }
);
