import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { bundleAnalyzerConfig } from './optimization/bundling/bundle-analyzer.config'

export default defineConfig({
  plugins: [
    react(),
    visualizer(bundleAnalyzerConfig),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@ui': path.resolve(__dirname, '../../packages/ui'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/components': path.resolve(__dirname, './src/components'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          editor: ['@monaco-editor/react', 'monaco-editor'],
          charts: ['recharts', 'chart.js'],
          ai: ['openai'],
        },
      },
    },
    chunkSizeWarningLimit: 200,
    sourcemap: process.env.NODE_ENV === 'production',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['kaiyan.online', 'www.kaiyan.online', '.kaiyan.online'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        withCredentials: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        withCredentials: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache'],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@shared': path.resolve(__dirname, '../../packages/shared/src'),
        '@ui': path.resolve(__dirname, '../../packages/ui'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/components': path.resolve(__dirname, './src/components'),
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand'],
  },
})
