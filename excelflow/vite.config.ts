import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer (generates stats.html after build)
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Production optimizations
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: true, // Enable sourcemaps for production debugging
    rollupOptions: {
      output: {
        // Manual chunks for better code splitting
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': [
            '@radix-ui/react-progress',
            '@radix-ui/react-toast',
            '@radix-ui/react-dialog',
            'lucide-react',
            'sonner',
          ],
        },
      },
    },
    // Chunk size warning limit (in KB)
    chunkSizeWarningLimit: 600,
  },
  // Preview server configuration
  preview: {
    port: 4173,
    strictPort: false,
    open: true,
  },
});
