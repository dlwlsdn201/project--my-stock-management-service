import { getSupabaseClient, isSupabaseConfigured } from '@shared';
import type { ManualAsset, ManualAssetPayload } from '../model/types';
import { createSupabaseManualAssetStore } from './supabaseManualAssetStore';

export interface ManualAssetStore {
  read: () => Promise<ManualAsset[]>;
  create: (payload: ManualAssetPayload) => Promise<ManualAsset>;
  update: (id: string, payload: ManualAssetPayload) => Promise<ManualAsset>;
  delete: (id: string) => Promise<void>;
}

export const createInMemoryManualAssetStore = (seed: ManualAsset[] = []): ManualAssetStore => {
  let current = seed.map((asset) => ({ ...asset }));
  let nextId = current.length + 1;

  return {
    read: async () => current.map((asset) => ({ ...asset })),
    create: async (payload) => {
      const asset = { id: `manual-asset-${nextId}`, ...payload };
      nextId += 1;
      current = [...current, asset];
      return { ...asset };
    },
    update: async (id, payload) => {
      const nextAsset = { id, ...payload };
      current = current.map((asset) => (asset.id === id ? nextAsset : asset));
      return { ...nextAsset };
    },
    delete: async (id) => {
      current = current.filter((asset) => asset.id !== id);
    },
  };
};

const resolveDefaultStore = (): ManualAssetStore => {
  if (isSupabaseConfigured()) {
    const client = getSupabaseClient();
    if (client) return createSupabaseManualAssetStore(client);
  }
  return createInMemoryManualAssetStore();
};

let activeStore: ManualAssetStore = resolveDefaultStore();

export const getManualAssetStore = (): ManualAssetStore => activeStore;

export const configureManualAssetStore = (store: ManualAssetStore): void => {
  activeStore = store;
};

export const resetManualAssetStore = (): void => {
  activeStore = resolveDefaultStore();
};
