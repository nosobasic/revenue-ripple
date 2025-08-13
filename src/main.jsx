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
  performanceMonitor.startTiming('app-bootstrap');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

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

// End bootstrap timing after render
if (typeof window !== 'undefined') {
  setTimeout(() => {
    performanceMonitor.endTiming('app-bootstrap');
  }, 0);
}