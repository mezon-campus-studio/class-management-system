import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './providers';
import '@styles/global.css';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppProvider />
    </StrictMode>
  );
}
