import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx'; // <-- IMPORTE

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* <-- ADICIONE AQUI */}
        <App />
      </AuthProvider> {/* <-- E AQUI */}
    </BrowserRouter>
  </React.StrictMode>,
);