import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../..'),
      '@shared': path.resolve(__dirname, '../../packages/shared'),
      '@ui': path.resolve(__dirname, '../../packages/ui'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/components': path.resolve(__dirname, './src/components')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['kaiyan.online', 'www.kaiyan.online', '.kaiyan.online'],
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
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
        '@': path.resolve(__dirname, '../..'),
        '@shared': path.resolve(__dirname, '../../packages/shared'),
        '@ui': path.resolve(__dirname, '../../packages/ui'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/components': path.resolve(__dirname, './src/components')
      }
    }
  }
})
