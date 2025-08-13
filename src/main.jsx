import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AIAssistantProvider } from './context/AIAssistantContext';
import ErrorBoundary from './components/ErrorBoundary';
import { performanceMonitor } from './utils/performance';
import './index.css';

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  console.log('Starting app bootstrap...');
  console.log('Environment variables:', {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL ? 'SET' : 'NOT_SET',
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
    NODE_ENV: import.meta.env.NODE_ENV
  });
  performanceMonitor.startTiming('app-bootstrap');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

try {
  console.log('Rendering app...');
  root.render(
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider> 
          <AIAssistantProvider>
            <App />
          </AIAssistantProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
  console.log('App rendered successfully');
} catch (error) {
  console.error('Error rendering app:', error);
  root.render(
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>App Error</h1>
      <p>There was an error loading the application.</p>
      <pre>{error.message}</pre>
    </div>
  );
}

// End bootstrap timing after render
if (typeof window !== 'undefined') {
  setTimeout(() => {
    performanceMonitor.endTiming('app-bootstrap');
  }, 0);
}