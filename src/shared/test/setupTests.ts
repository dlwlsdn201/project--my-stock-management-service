import '@testing-library/jest-dom';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from '@shared/api/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  // persistence 도입 이후 테스트 간 storage 상태가 누수되지 않도록 매 테스트 후 초기화한다.
  window.localStorage.clear();
  window.sessionStorage.clear();
});
afterAll(() => server.close());
