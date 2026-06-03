import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { startMockWorker } from '@shared';
import { App } from './apps/App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

void startMockWorker()
  .catch((err: unknown) => {
    console.warn('[MSW] Failed to start worker:', err);
  })
  .finally(() => {
    createRoot(rootElement).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  });
