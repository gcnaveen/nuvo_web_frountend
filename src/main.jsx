import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
// Landing page Tailwind v4 + Montserrat — scoped to .nuvo-landing,
// does NOT affect Bootstrap admin styles.
import './landing.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
