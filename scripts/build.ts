import { build } from 'esbuild';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

async function buildApplication() {
  console.log('🔨 Building fractal parametric viewer...');
  
  try {
    // Build main application
    await build({
      entryPoints: ['src/main.tsx'],
      bundle: true,
      outfile: 'dist/main.js',
      format: 'iife',
      globalName: 'FractalViewer',
      jsx: 'automatic',
      minify: isProduction,
      sourcemap: !isProduction,
      define: {
        'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
      },
      loader: {
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.js': 'js',
        '.jsx': 'jsx',
      },
    });

    // Copy HTML file
    const htmlContent = readFileSync('src/index.html', 'utf-8');
    const distHtml = htmlContent.replace(
      /<script[^>]*src="[^"]*main\.(js|tsx?)"[^>]*><\/script>/,
      '<script src="main.js"></script>'
    );
    
    const fs = await import('fs');
    fs.writeFileSync('dist/index.html', distHtml);

    console.log('✅ Build completed successfully!');
    console.log('📁 Output: dist/');
    
    if (!isProduction) {
      console.log('🚀 Run "npm start" to serve the application');
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildApplication();
