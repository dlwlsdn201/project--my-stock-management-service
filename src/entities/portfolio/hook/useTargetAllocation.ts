import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { TargetAllocation } from '../model/types';
import { readTargetAllocation, saveTargetAllocation } from '../api/targetAllocationApi';

export const TARGET_ALLOCATION_QUERY_KEY = ['portfolio', 'target-allocation'] as const;

// [2단계] 조회 훅 — 신규 조회는 useSuspenseQuery + 상위 <ApiQueryBoundary> 기준.
export const useSuspenseTargetAllocation = () =>
  useSuspenseQuery({
    queryKey: TARGET_ALLOCATION_QUERY_KEY,
    queryFn: readTargetAllocation,
  });

// [2단계] 변경 훅 — 성공 시 invalidateQueries만 담당(toast/모달 등 UX는 features 호출부에서 처리).
export const useUpdateTargetAllocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (next: TargetAllocation) => saveTargetAllocation(next),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: TARGET_ALLOCATION_QUERY_KEY });
    },
  });
};
