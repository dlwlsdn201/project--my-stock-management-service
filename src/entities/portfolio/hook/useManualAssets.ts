import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import type { ManualAssetPayload } from '../model/types';
import { createManualAsset, deleteManualAsset, readManualAssets, updateManualAsset } from '../api/manualAssetApi';

export const MANUAL_ASSETS_QUERY_KEY = ['portfolio', 'manual-assets'] as const;

export const useSuspenseManualAssets = () =>
  useSuspenseQuery({
    queryKey: MANUAL_ASSETS_QUERY_KEY,
    queryFn: readManualAssets,
  });

export const useCreateManualAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ManualAssetPayload) => createManualAsset(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MANUAL_ASSETS_QUERY_KEY });
    },
  });
};

export const useUpdateManualAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ManualAssetPayload }) =>
      updateManualAsset(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MANUAL_ASSETS_QUERY_KEY });
    },
  });
};

export const useDeleteManualAsset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteManualAsset(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: MANUAL_ASSETS_QUERY_KEY });
    },
  });
};
