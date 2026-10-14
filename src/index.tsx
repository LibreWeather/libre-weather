import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import * as serviceWorker from './resources/serviceWorker';

import './fonts';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorker.register();
