import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './assets/index.css';

// ── PWA service worker registration (vite-plugin-pwa) ────────────────────────
// The plugin auto-generates and registers the SW; nothing extra needed here.
// To test locally, set devOptions.enabled = true in vite.config.ts.

const container = document.getElementById('root');

if (!container) {
  throw new Error(
    '[CampusCoin] Root element #root not found. Check index.html.'
  );
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
