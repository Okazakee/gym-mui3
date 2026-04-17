import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // MUI and emotion
            if (id.includes('@mui')) return 'mui';
            if (id.includes('@emotion')) return 'emotion';
            // React
            if (id.includes('react')) return 'react';
            // Other vendors (fontsource, etc)
            return 'vendor';
          }
        },
      },
    },
  },
})