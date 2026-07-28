import React from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
