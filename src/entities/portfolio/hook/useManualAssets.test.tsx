import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { configureManualAssetStore, createInMemoryManualAssetStore, resetManualAssetStore } from '../api/manualAssetStore';
import {
  MANUAL_ASSETS_QUERY_KEY,
  useCreateManualAsset,
  useDeleteManualAsset,
  useSuspenseManualAssets,
  useUpdateManualAsset,
} from './useManualAssets';

const SEED = { id: 'seed-1', ticker: 'AAPL', name: 'Apple', quantity: 5, avgPrice: 150 };

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={null}>{children}</Suspense>
    </QueryClientProvider>
  );
};

beforeEach(() => {
  configureManualAssetStore(createInMemoryManualAssetStore([{ ...SEED }]));
});

afterEach(() => {
  resetManualAssetStore();
});

describe('useSuspenseManualAssets', () => {
  it('조회 훅이 저장된 수동 자산 목록을 반환한다', async () => {
    const { result } = renderHook(() => useSuspenseManualAssets(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual([SEED]));
  });

  it('빈 store에서는 빈 배열을 반환한다', async () => {
    configureManualAssetStore(createInMemoryManualAssetStore([]));
    const { result } = renderHook(() => useSuspenseManualAssets(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.data).toEqual([]));
  });
});

describe('useCreateManualAsset', () => {
  it('create 성공 시 query invalidate로 목록이 갱신된다', async () => {
    const { result } = renderHook(
      () => ({ query: useSuspenseManualAssets(), mutation: useCreateManualAsset() }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.query.data).toHaveLength(1));

    await act(async () => {
      await result.current.mutation.mutateAsync({ ticker: 'TSLA', name: 'Tesla', quantity: 2, avgPrice: 200 });
    });

    await waitFor(() => expect(result.current.query.data).toHaveLength(2));
    expect(result.current.query.data[1]).toMatchObject({ ticker: 'TSLA', name: 'Tesla' });
  });

  it('create 실패 시 에러 상태가 된다', async () => {
    configureManualAssetStore({
      read: async () => [{ ...SEED }],
      create: async () => { throw new Error('create failed'); },
      update: async (id, payload) => ({ id, ...payload }),
      delete: async () => undefined,
    });

    const { result } = renderHook(() => useCreateManualAsset(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ ticker: 'X', name: 'X', quantity: 1, avgPrice: 1 }).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateManualAsset', () => {
  it('update 성공 시 query invalidate로 목록이 갱신된다', async () => {
    const { result } = renderHook(
      () => ({ query: useSuspenseManualAssets(), mutation: useUpdateManualAsset() }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.query.data[0].name).toBe('Apple'));

    await act(async () => {
      await result.current.mutation.mutateAsync({
        id: 'seed-1',
        payload: { ticker: 'AAPL', name: 'Apple Inc', quantity: 10, avgPrice: 160 },
      });
    });

    await waitFor(() => expect(result.current.query.data[0].name).toBe('Apple Inc'));
  });
});

describe('useDeleteManualAsset', () => {
  it('delete 성공 시 query invalidate로 목록에서 제거된다', async () => {
    const { result } = renderHook(
      () => ({ query: useSuspenseManualAssets(), mutation: useDeleteManualAsset() }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.query.data).toHaveLength(1));

    await act(async () => {
      await result.current.mutation.mutateAsync('seed-1');
    });

    await waitFor(() => expect(result.current.query.data).toHaveLength(0));
  });
});

describe('MANUAL_ASSETS_QUERY_KEY', () => {
  it('쿼리 키가 올바르게 정의된다', () => {
    expect(MANUAL_ASSETS_QUERY_KEY).toEqual(['portfolio', 'manual-assets']);
  });
});
