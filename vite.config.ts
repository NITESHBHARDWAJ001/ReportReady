import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: ['mammoth', 'docx', 'file-saver'],
  },
  build: {
    rollupOptions: {
      output: {
        // Split heavy libraries into their own chunks for faster initial load
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-docx': ['docx', 'file-saver'],
          'vendor-mammoth': ['mammoth'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-tabs', '@radix-ui/react-select'],
        },
      },
    },
  },
})
