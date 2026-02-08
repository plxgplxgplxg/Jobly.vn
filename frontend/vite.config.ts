import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
})
