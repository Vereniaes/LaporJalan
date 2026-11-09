/* Todo:
-> mount React root component into DOM
-> load global typography and stylesheet tokens
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- Application Bootstrap ----------------------------------------------------
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
// --- end of Application Bootstrap ---------------------------------------------
