import type { ManualAsset, ManualAssetPayload } from '../model/types';
import { getManualAssetStore } from './manualAssetStore';

export const readManualAssets = (): Promise<ManualAsset[]> => getManualAssetStore().read();

export const createManualAsset = (payload: ManualAssetPayload): Promise<ManualAsset> =>
  getManualAssetStore().create(payload);

export const updateManualAsset = (id: string, payload: ManualAssetPayload): Promise<ManualAsset> =>
  getManualAssetStore().update(id, payload);

export const deleteManualAsset = (id: string): Promise<void> => getManualAssetStore().delete(id);
