import React from "react";
import ReactDOM from "react-dom/client";
import 'leaflet/dist/leaflet.css';
import { BrowserRouter } from 'react-router-dom';
import App from "./App";
import { fetchCsrf } from './api/api';
import { AuthProvider } from './contexts/AuthContext';

// Ensure CSRF cookie is set for POST requests
fetchCsrf();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
