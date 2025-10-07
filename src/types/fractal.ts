export type FractalType = 'mandelbrot' | 'julia' | 'burning-ship' | 'tricorn' | 'multibrot';

export type ColorScheme = 'rainbow' | 'fire' | 'ocean' | 'grayscale' | 'neon';

export interface FractalParameters {
  type: FractalType;
  centerX: number;
  centerY: number;
  zoom: number;
  maxIterations: number;
  colorScheme: ColorScheme;
  juliaReal: number;
  juliaImag: number;
  power: number;
  bailout: number;
  colorOffset: number;
  colorScale: number;
}

export interface ComplexNumber {
  real: number;
  imag: number;
}

export interface RenderResult {
  renderTime: number;
  pixelCount: number;
}
