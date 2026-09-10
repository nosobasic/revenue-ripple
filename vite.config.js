import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";

dotenv.config();

function contentEngineDevApi() {
  const routes = {
    '/api/content/status': './api/content/status.js',
    '/api/content/analyze-gaps': './api/content/analyze-gaps.js',
    '/api/content/generate-script': './api/content/generate-script.js',
  };

  return {
    name: 'content-engine-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0];
        const handlerPath = routes[pathname];
        if (!handlerPath) return next();

        const { default: handler } = await import(handlerPath);

        let body = '';
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          body = await new Promise((resolve, reject) => {
            let data = '';
            req.on('data', (chunk) => {
              data += chunk;
            });
            req.on('end', () => resolve(data));
            req.on('error', reject);
          });
        }

        let parsedBody;
        if (body) {
          try {
            parsedBody = JSON.parse(body);
          } catch {
            parsedBody = undefined;
          }
        }

        const reqMock = {
          method: req.method,
          query: {},
          body: parsedBody,
          on: req.on.bind(req),
        };

        const resMock = {
          statusCode: 200,
          status(code) {
            this.statusCode = code;
            return this;
          },
          setHeader() {},
          json(payload) {
            res.statusCode = this.statusCode || 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(payload));
          },
        };

        try {
          await handler(reqMock, resMock);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

function synthesiaDevApi() {
  return {
    name: "synthesia-dev-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/synthesia")) return next();

        const { default: handler } = await import("./api/synthesia.js");
        const url = new URL(req.url, "http://vite.local");
        const query = {};
        url.searchParams.forEach((value, key) => {
          if (query[key] !== undefined) {
            query[key] = Array.isArray(query[key])
              ? [...query[key], value]
              : [query[key], value];
          } else {
            query[key] = value;
          }
        });

        const reqMock = { method: req.method, query };
        const resMock = {
          statusCode: 200,
          status(code) {
            this.statusCode = code;
            return this;
          },
          setHeader() {},
          json(body) {
            res.statusCode = this.statusCode || 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(body));
          },
        };

        try {
          await handler(reqMock, resMock);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), contentEngineDevApi(), synthesiaDevApi()],
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
    minify: process.env.NODE_ENV === 'production' ? 'terser' : 'esbuild',
    terserOptions: process.env.NODE_ENV === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    } : undefined
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
    host: "0.0.0.0",
    port: 5000,
    allowedHosts: true,
    proxy: {
      "/devops": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/create-payment-intent": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/create-tripwire-session": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/create-pro-reseller-session": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/create-reseller-session": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/create-membership-session": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/create-quarterly-growth-session": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/webhook": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/your-existing-api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
      "/paypal": {
        target: "http://localhost:8000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
