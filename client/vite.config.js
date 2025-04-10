import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill the `crypto` module
    global: {},
  },
  optimizeDeps: {
    include: ['crypto-browserify'],
  },
  server: {
    host: '0.0.0.0',  // Allows access from outside the container
    port: 3000,        // Default port Vite uses
  },
})
