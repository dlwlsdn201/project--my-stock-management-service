import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';
import type { TargetAllocation } from '../model/types';
import { configureTargetAllocationStore, resetTargetAllocationStore } from '../api/targetAllocationStore';
import { useSuspenseTargetAllocation, useUpdateTargetAllocation } from './useTargetAllocation';

const SAMPLE: TargetAllocation = { equity: 80, bond: 10, 'cash-and-alternative': 10 };

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

afterEach(() => resetTargetAllocationStore());

describe('useTargetAllocation 훅', () => {
  it('조회 훅이 저장된 목표 비중을 반환한다', async () => {
    const { result } = renderHook(() => useSuspenseTargetAllocation(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current?.data).toEqual(MOCK_TARGET_ALLOCATION));
  });

  it('저장 성공 시 invalidate로 조회 결과가 갱신된다', async () => {
    const { result } = renderHook(
      () => ({
        query: useSuspenseTargetAllocation(),
        mutation: useUpdateTargetAllocation(),
      }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current?.query.data).toEqual(MOCK_TARGET_ALLOCATION));

    await act(async () => {
      await result.current.mutation.mutateAsync(SAMPLE);
    });

    await waitFor(() => expect(result.current.query.data).toEqual(SAMPLE));
  });

  it('저장 실패 시 에러 상태가 된다', async () => {
    configureTargetAllocationStore({
      read: async () => MOCK_TARGET_ALLOCATION,
      save: async () => {
        throw new Error('save failed');
      },
    });

    const { result } = renderHook(() => useUpdateTargetAllocation(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateAsync(SAMPLE).catch(() => undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
