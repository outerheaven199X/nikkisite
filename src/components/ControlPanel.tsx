import React from 'react';
import { FractalParameters, FractalType, ColorScheme } from '../types/fractal';

interface ControlPanelProps {
  parameters: FractalParameters;
  onParameterChange: (params: Partial<FractalParameters>) => void;
  onReset: () => void;
  onRandomizeJulia: () => void;
  renderTime: number;
}

const fractalTypes: { value: FractalType; label: string }[] = [
  { value: 'mandelbrot', label: 'Mandelbrot' },
  { value: 'julia', label: 'Julia' },
  { value: 'burning-ship', label: 'Burning Ship' },
  { value: 'tricorn', label: 'Tricorn' },
  { value: 'multibrot', label: 'Multibrot' },
];

const colorSchemes: { value: ColorScheme; label: string }[] = [
  { value: 'rainbow', label: 'Rainbow' },
  { value: 'fire', label: 'Fire' },
  { value: 'ocean', label: 'Ocean' },
  { value: 'grayscale', label: 'Grayscale' },
  { value: 'neon', label: 'Neon' },
];

export const ControlPanel: React.FC<ControlPanelProps> = ({
  parameters,
  onParameterChange,
  onReset,
  onRandomizeJulia,
  renderTime,
}) => {
  const handleFractalTypeChange = (type: FractalType) => {
    onParameterChange({ type });
  };

  const handleNumberInputChange = (key: keyof FractalParameters, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      onParameterChange({ [key]: numValue });
    }
  };

  const handleRangeChange = (key: keyof FractalParameters, value: string) => {
    const numValue = parseFloat(value);
    onParameterChange({ [key]: numValue });
  };

  return (
    <div className="controls-panel">
      <div className="control-group">
        <div className="control-label">Fractal Type</div>
        <div className="fractal-type-selector">
          {fractalTypes.map(({ value, label }) => (
            <button
              key={value}
              className={`fractal-type-button ${parameters.type === value ? 'active' : ''}`}
              onClick={() => handleFractalTypeChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="control-group">
        <div className="control-label">Color Scheme</div>
        <select
          className="control-input"
          value={parameters.colorScheme}
          onChange={(e) => onParameterChange({ colorScheme: e.target.value as ColorScheme })}
        >
          {colorSchemes.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="control-group">
        <div className="control-label">Center X: {parameters.centerX.toFixed(6)}</div>
        <input
          type="range"
          className="range-input"
          min="-2"
          max="2"
          step="0.001"
          value={parameters.centerX}
          onChange={(e) => handleRangeChange('centerX', e.target.value)}
        />
      </div>

      <div className="control-group">
        <div className="control-label">Center Y: {parameters.centerY.toFixed(6)}</div>
        <input
          type="range"
          className="range-input"
          min="-2"
          max="2"
          step="0.001"
          value={parameters.centerY}
          onChange={(e) => handleRangeChange('centerY', e.target.value)}
        />
      </div>

      <div className="control-group">
        <div className="control-label">Zoom: {parameters.zoom.toFixed(2)}x</div>
        <input
          type="range"
          className="range-input"
          min="0.1"
          max="1000"
          step="0.1"
          value={parameters.zoom}
          onChange={(e) => handleRangeChange('zoom', e.target.value)}
        />
      </div>

      <div className="control-group">
        <div className="control-label">Max Iterations: {parameters.maxIterations}</div>
        <input
          type="range"
          className="range-input"
          min="10"
          max="1000"
          step="10"
          value={parameters.maxIterations}
          onChange={(e) => handleRangeChange('maxIterations', e.target.value)}
        />
      </div>

      {parameters.type === 'julia' && (
        <>
          <div className="control-group">
            <div className="control-label">Julia Real: {parameters.juliaReal.toFixed(6)}</div>
            <input
              type="range"
              className="range-input"
              min="-2"
              max="2"
              step="0.001"
              value={parameters.juliaReal}
              onChange={(e) => handleRangeChange('juliaReal', e.target.value)}
            />
          </div>

          <div className="control-group">
            <div className="control-label">Julia Imag: {parameters.juliaImag.toFixed(6)}</div>
            <input
              type="range"
              className="range-input"
              min="-2"
              max="2"
              step="0.001"
              value={parameters.juliaImag}
              onChange={(e) => handleRangeChange('juliaImag', e.target.value)}
            />
          </div>

          <button className="button" onClick={onRandomizeJulia}>
            Randomize Julia
          </button>
        </>
      )}

      <div className="control-group">
        <div className="control-label">Power: {parameters.power.toFixed(1)}</div>
        <input
          type="range"
          className="range-input"
          min="1"
          max="10"
          step="0.1"
          value={parameters.power}
          onChange={(e) => handleRangeChange('power', e.target.value)}
        />
      </div>

      <div className="control-group">
        <div className="control-label">Bailout: {parameters.bailout.toFixed(1)}</div>
        <input
          type="range"
          className="range-input"
          min="1"
          max="10"
          step="0.1"
          value={parameters.bailout}
          onChange={(e) => handleRangeChange('bailout', e.target.value)}
        />
      </div>

      <div className="control-group">
        <div className="control-label">Color Offset: {parameters.colorOffset.toFixed(2)}</div>
        <input
          type="range"
          className="range-input"
          min="0"
          max="1"
          step="0.01"
          value={parameters.colorOffset}
          onChange={(e) => handleRangeChange('colorOffset', e.target.value)}
        />
      </div>

      <div className="control-group">
        <div className="control-label">Color Scale: {parameters.colorScale.toFixed(2)}</div>
        <input
          type="range"
          className="range-input"
          min="0.1"
          max="5"
          step="0.1"
          value={parameters.colorScale}
          onChange={(e) => handleRangeChange('colorScale', e.target.value)}
        />
      </div>

      <button className="button" onClick={onReset}>
        Reset View
      </button>

      <div className="info-panel">
        <div><strong>Render Time:</strong> {renderTime.toFixed(2)}ms</div>
        <div><strong>Resolution:</strong> {Math.round(window.innerWidth)}×{Math.round(window.innerHeight)}</div>
        <div><strong>Iterations:</strong> {parameters.maxIterations}</div>
        <div><strong>Zoom:</strong> {parameters.zoom.toFixed(2)}x</div>
      </div>
    </div>
  );
};
