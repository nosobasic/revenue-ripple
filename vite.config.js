import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React and core libraries
          vendor: ['react', 'react-dom', 'react-router-dom'],
          
          // UI library chunk
          ui: ['framer-motion', 'lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-scroll-area'],
          
          // Charts and data visualization
          charts: ['chart.js', 'react-chartjs-2'],
          
          // Payment processing
          payments: ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          
          // Database and API
          database: ['@supabase/supabase-js', '@tanstack/react-query'],
          
          // Utilities
          utils: ['canvas-confetti', 'class-variance-authority']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Enable source maps for better debugging in production
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Optimize assets
    assetsInlineLimit: 4096, // 4kb - files smaller than this will be inlined
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    }
  },
  
  // Optimize deps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@stripe/stripe-js'
    ]
  },
  
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
