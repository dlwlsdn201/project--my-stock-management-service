import type { SupabaseClient } from '@supabase/supabase-js';
import { MOCK_TARGET_ALLOCATION } from '../model/mockPortfolio';
import type { TargetAllocation } from '../model/types';
import { MOCK_SUPABASE_USER_ID } from './supabaseMockUser';
import type { TargetAllocationStore } from './targetAllocationStore';

interface TargetAllocationRow {
  id: string;
  user_id: string;
  equity: number;
  bond: number;
  cash_and_alternative: number;
  created_at: string;
  updated_at: string;
}

const rowToEntity = (row: TargetAllocationRow): TargetAllocation => ({
  equity: Number(row.equity),
  bond: Number(row.bond),
  'cash-and-alternative': Number(row.cash_and_alternative),
});

const entityToRow = (
  entity: TargetAllocation,
  userId: string,
): Omit<TargetAllocationRow, 'id' | 'created_at' | 'updated_at'> => ({
  user_id: userId,
  equity: entity.equity,
  bond: entity.bond,
  cash_and_alternative: entity['cash-and-alternative'],
});

export const createSupabaseTargetAllocationStore = (
  client: SupabaseClient,
  userId: string = MOCK_SUPABASE_USER_ID,
): TargetAllocationStore => ({
  read: async () => {
    const { data, error } = await client
      .from('target_allocations')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw new Error(`target_allocations read failed: ${error.message}`);
    if (!data) return { ...MOCK_TARGET_ALLOCATION };

    return rowToEntity(data as TargetAllocationRow);
  },

  save: async (next: TargetAllocation) => {
    const row = entityToRow(next, userId);
    const { data, error } = await client
      .from('target_allocations')
      .upsert(row, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw new Error(`target_allocations save failed: ${error.message}`);
    if (!data) throw new Error('target_allocations save: no data returned');

    return rowToEntity(data as TargetAllocationRow);
  },
});
