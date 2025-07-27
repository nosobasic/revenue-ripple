import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/devops': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/create-payment-intent': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/create-tripwire-session': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/create-pro-reseller-session': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/create-reseller-session': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/create-membership-session': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/webhook': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
      '/your-existing-api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
