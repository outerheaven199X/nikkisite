import React from 'react';
import { createRoot } from 'react-dom/client';
import { FractalViewer } from './components/FractalViewer';
import './styles.css';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error('Root element not found');
    return;
  }

  try {
    const root = createRoot(container);
    root.render(<FractalViewer />);
    console.log('Fractal viewer mounted successfully');
  } catch (error) {
    console.error('Failed to mount React app:', error);
    container.innerHTML = '<div style="color: red; padding: 20px;">Error loading fractal viewer. Check console for details.</div>';
  }
});
