const shouldEnableMsw = import.meta.env.DEV && import.meta.env.VITE_ENABLE_MSW === 'true';

export const startMockWorker = async (): Promise<void> => {
  if (!shouldEnableMsw) return;
  const { worker } = await import('./browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
};
