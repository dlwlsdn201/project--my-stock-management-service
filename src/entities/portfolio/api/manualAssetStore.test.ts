import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { configureManualAssetStore, createInMemoryManualAssetStore, resetManualAssetStore } from './manualAssetStore';
import { createManualAsset, deleteManualAsset, readManualAssets, updateManualAsset } from './manualAssetApi';

const SEED_ASSET = { id: 'seed-1', ticker: 'AAPL', name: 'Apple', quantity: 5, avgPrice: 150 };

beforeEach(() => {
  configureManualAssetStore(createInMemoryManualAssetStore([{ ...SEED_ASSET }]));
});

afterEach(() => {
  resetManualAssetStore();
});

describe('manualAssetStore — read', () => {
  it('seed 복사본을 반환한다', async () => {
    const result = await readManualAssets();
    expect(result).toEqual([SEED_ASSET]);
  });

  it('반환값은 내부 배열의 복사본이다', async () => {
    const result = await readManualAssets();
    result[0].ticker = 'MUTATED';
    const again = await readManualAssets();
    expect(again[0].ticker).toBe('AAPL');
  });
});

describe('manualAssetStore — create', () => {
  it('create 후 read 목록에 반영된다', async () => {
    await createManualAsset({ ticker: 'TSLA', name: 'Tesla', quantity: 2, avgPrice: 200 });
    const result = await readManualAssets();
    expect(result).toHaveLength(2);
    expect(result[1]).toMatchObject({ ticker: 'TSLA', name: 'Tesla', quantity: 2, avgPrice: 200 });
  });

  it('create는 id가 포함된 자산을 반환한다', async () => {
    const asset = await createManualAsset({ ticker: 'TSLA', name: 'Tesla', quantity: 2, avgPrice: 200 });
    expect(asset.id).toBeTruthy();
    expect(asset.ticker).toBe('TSLA');
  });
});

describe('manualAssetStore — update', () => {
  it('update 후 해당 asset이 변경된다', async () => {
    await updateManualAsset('seed-1', { ticker: 'AAPL', name: 'Apple Inc', quantity: 10, avgPrice: 160 });
    const result = await readManualAssets();
    expect(result[0]).toMatchObject({ id: 'seed-1', name: 'Apple Inc', quantity: 10, avgPrice: 160 });
  });

  it('존재하지 않는 id update 시 기존 목록을 유지한다', async () => {
    await updateManualAsset('nonexistent', { ticker: 'X', name: 'X', quantity: 1, avgPrice: 1 });
    const result = await readManualAssets();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('seed-1');
  });
});

describe('manualAssetStore — delete', () => {
  it('delete 후 해당 asset이 제거된다', async () => {
    await deleteManualAsset('seed-1');
    const result = await readManualAssets();
    expect(result).toHaveLength(0);
  });

  it('존재하지 않는 id delete 시 멱등적으로 처리된다', async () => {
    await deleteManualAsset('nonexistent');
    const result = await readManualAssets();
    expect(result).toHaveLength(1);
  });
});
