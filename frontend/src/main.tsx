import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './assets/index.css';
import { initTheme } from './store/useThemeStore';

initTheme(); // apply persisted theme before first paint

const container = document.getElementById('root');
if (!container) throw new Error('[CampusCoin] #root not found.');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);
