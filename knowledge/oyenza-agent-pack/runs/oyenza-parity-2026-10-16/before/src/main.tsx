/*
file ini entry point react untuk mounting aplikasi LaporJalan ke DOM
Todo:
-> render App ke #root
-> import index.css global
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
