import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './tau/browser-polyfills.js';
import { App } from './app.js';
import './styles.css';

const rootElement = document.querySelector('#root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
