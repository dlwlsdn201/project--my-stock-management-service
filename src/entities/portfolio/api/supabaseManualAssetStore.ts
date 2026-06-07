import type { SupabaseClient } from '@supabase/supabase-js';
import type { ManualAsset, ManualAssetPayload } from '../model/types';
import type { ManualAssetStore } from './manualAssetStore';
import { MOCK_SUPABASE_USER_ID } from './supabaseMockUser';

interface ManualAssetRow {
  id: string;
  user_id: string;
  ticker: string;
  name: string;
  quantity: number;
  avg_price: number;
  created_at: string;
  updated_at: string;
}

const rowToEntity = (row: ManualAssetRow): ManualAsset => ({
  id: row.id,
  ticker: row.ticker,
  name: row.name,
  quantity: Number(row.quantity),
  avgPrice: Number(row.avg_price),
});

const payloadToRow = (
  payload: ManualAssetPayload,
  userId: string,
): Omit<ManualAssetRow, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  ticker: payload.ticker,
  name: payload.name,
  quantity: payload.quantity,
  avg_price: payload.avgPrice,
});

export const createSupabaseManualAssetStore = (
  client: SupabaseClient,
  userId: string = MOCK_SUPABASE_USER_ID,
): ManualAssetStore => ({
  read: async () => {
    const { data, error } = await client
      .from('manual_assets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`manual_assets read failed: ${error.message}`);

    return ((data ?? []) as ManualAssetRow[]).map(rowToEntity);
  },

  create: async (payload: ManualAssetPayload) => {
    const row = payloadToRow(payload, userId);
    const { data, error } = await client
      .from('manual_assets')
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`manual_assets create failed: ${error.message}`);
    if (!data) throw new Error('manual_assets create: no data returned');

    return rowToEntity(data as ManualAssetRow);
  },

  update: async (id: string, payload: ManualAssetPayload) => {
    const { data, error } = await client
      .from('manual_assets')
      .update({
        ticker: payload.ticker,
        name: payload.name,
        quantity: payload.quantity,
        avg_price: payload.avgPrice,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw new Error(`manual_assets update failed: ${error.message}`);
    if (!data) throw new Error('manual_assets update: no data returned');

    return rowToEntity(data as ManualAssetRow);
  },

  delete: async (id: string) => {
    const { error } = await client
      .from('manual_assets')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw new Error(`manual_assets delete failed: ${error.message}`);
  },
});
