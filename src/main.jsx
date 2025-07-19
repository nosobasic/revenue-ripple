console.log("Main entry loaded");
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AIAssistantProvider } from './context/AIAssistantContext';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <BrowserRouter>
    <AuthProvider> 
      <AIAssistantProvider>
        <App />
      </AIAssistantProvider>
    </AuthProvider>
  </BrowserRouter>
);