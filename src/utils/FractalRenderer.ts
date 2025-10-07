import { FractalParameters, ComplexNumber } from '../types/fractal';

export class FractalRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private imageData: ImageData | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx;
  }

  async render(params: FractalParameters): Promise<void> {
    const width = this.canvas.width;
    const height = this.canvas.height;
    
    console.log(`Rendering fractal: ${width}x${height}`, params);
    
    if (!this.imageData || this.imageData.width !== width || this.imageData.height !== height) {
      this.imageData = this.ctx.createImageData(width, height);
    }

    const data = this.imageData.data;
    const pixelCount = width * height;

    // Calculate bounds
    const aspectRatio = width / height;
    const scale = 4 / params.zoom;
    const left = params.centerX - scale * aspectRatio / 2;
    const right = params.centerX + scale * aspectRatio / 2;
    const top = params.centerY - scale / 2;
    const bottom = params.centerY + scale / 2;
    
    console.log(`Bounds: left=${left}, right=${right}, top=${top}, bottom=${bottom}`);

    // Render fractal
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const real = left + (x / width) * (right - left);
        const imag = top + (y / height) * (bottom - top);
        
        const iterations = this.calculateIterations(
          { real, imag },
          params
        );
        
        const color = this.getColor(iterations, params);
        const pixelIndex = (y * width + x) * 4;
        
        data[pixelIndex] = color.r;     // Red
        data[pixelIndex + 1] = color.g; // Green
        data[pixelIndex + 2] = color.b; // Blue
        data[pixelIndex + 3] = 255;     // Alpha
      }
    }

    this.ctx.putImageData(this.imageData, 0, 0);
    console.log(`Fractal rendering completed: ${pixelCount} pixels processed`);
  }

  private calculateIterations(c: ComplexNumber, params: FractalParameters): number {
    let z: ComplexNumber = { real: 0, imag: 0 };
    let iterations = 0;

    while (iterations < params.maxIterations) {
      const magnitude = z.real * z.real + z.imag * z.imag;
      
      if (magnitude > params.bailout * params.bailout) {
        break;
      }

      switch (params.type) {
        case 'mandelbrot':
          z = this.complexPower(z, params.power);
          z.real += c.real;
          z.imag += c.imag;
          break;
          
        case 'julia':
          z = this.complexPower(z, params.power);
          z.real += params.juliaReal;
          z.imag += params.juliaImag;
          break;
          
        case 'burning-ship':
          z.real = Math.abs(z.real);
          z.imag = Math.abs(z.imag);
          z = this.complexPower(z, params.power);
          z.real += c.real;
          z.imag += c.imag;
          break;
          
        case 'tricorn':
          z.imag = -z.imag;
          z = this.complexPower(z, params.power);
          z.real += c.real;
          z.imag += c.imag;
          break;
          
        case 'multibrot':
          z = this.complexPower(z, params.power);
          z.real += c.real;
          z.imag += c.imag;
          break;
      }

      iterations++;
    }

    return iterations;
  }

  private complexPower(z: ComplexNumber, power: number): ComplexNumber {
    if (power === 2) {
      // Optimized for power of 2
      return {
        real: z.real * z.real - z.imag * z.imag,
        imag: 2 * z.real * z.imag,
      };
    }
    
    // General case for any power
    const magnitude = Math.pow(z.real * z.real + z.imag * z.imag, power / 2);
    const angle = Math.atan2(z.imag, z.real) * power;
    
    return {
      real: magnitude * Math.cos(angle),
      imag: magnitude * Math.sin(angle),
    };
  }

  private getColor(iterations: number, params: FractalParameters): { r: number; g: number; b: number } {
    if (iterations === params.maxIterations) {
      return { r: 0, g: 0, b: 0 }; // Inside the set
    }

    // Smooth coloring
    const smoothIterations = iterations + 1 - Math.log(Math.log(Math.sqrt(iterations))) / Math.log(2);
    const normalized = (smoothIterations * params.colorScale + params.colorOffset) % 1;

    return this.getColorFromScheme(normalized, params.colorScheme);
  }

  private getColorFromScheme(t: number, scheme: string): { r: number; g: number; b: number } {
    switch (scheme) {
      case 'rainbow':
        return this.rainbowColor(t);
      case 'fire':
        return this.fireColor(t);
      case 'ocean':
        return this.oceanColor(t);
      case 'grayscale':
        return this.grayscaleColor(t);
      case 'neon':
        return this.neonColor(t);
      default:
        return this.rainbowColor(t);
    }
  }

  private rainbowColor(t: number): { r: number; g: number; b: number } {
    const r = Math.sin(t * 2 * Math.PI) * 0.5 + 0.5;
    const g = Math.sin(t * 2 * Math.PI + 2 * Math.PI / 3) * 0.5 + 0.5;
    const b = Math.sin(t * 2 * Math.PI + 4 * Math.PI / 3) * 0.5 + 0.5;
    return { r: r * 255, g: g * 255, b: b * 255 };
  }

  private fireColor(t: number): { r: number; g: number; b: number } {
    const r = Math.min(1, t * 2);
    const g = Math.max(0, Math.min(1, (t - 0.5) * 2));
    const b = Math.max(0, Math.min(1, (t - 0.8) * 5));
    return { r: r * 255, g: g * 255, b: b * 255 };
  }

  private oceanColor(t: number): { r: number; g: number; b: number } {
    const r = Math.max(0, Math.min(1, (t - 0.6) * 2.5));
    const g = Math.max(0, Math.min(1, t * 1.5));
    const b = Math.min(1, t * 1.2 + 0.3);
    return { r: r * 255, g: g * 255, b: b * 255 };
  }

  private grayscaleColor(t: number): { r: number; g: number; b: number } {
    const intensity = t * 255;
    return { r: intensity, g: intensity, b: intensity };
  }

  private neonColor(t: number): { r: number; g: number; b: number } {
    const r = Math.sin(t * 3 * Math.PI) * 0.5 + 0.5;
    const g = Math.sin(t * 3 * Math.PI + Math.PI / 2) * 0.5 + 0.5;
    const b = Math.sin(t * 3 * Math.PI + Math.PI) * 0.5 + 0.5;
    return { r: r * 255, g: g * 255, b: b * 255 };
  }
}
