import { useState } from 'react';
import { Button, FieldMessage, Surface } from '@shared';
import type { ManualAsset } from '@entities/portfolio';
import {
  useCreateManualAsset,
  useDeleteManualAsset,
  useSuspenseManualAssets,
  useUpdateManualAsset,
} from '@entities/portfolio';
import {
  MANUAL_ASSET_ADD_ERROR,
  MANUAL_ASSET_ADD_SUCCESS,
  MANUAL_ASSET_DELETE_ERROR,
  MANUAL_ASSET_DELETE_SUCCESS,
  MANUAL_ASSET_UPDATE_ERROR,
  MANUAL_ASSET_UPDATE_SUCCESS,
} from '../model/constants';

interface AssetFormValues {
  ticker: string;
  name: string;
  quantity: string;
  avgPrice: string;
}

const EMPTY_FORM: AssetFormValues = { ticker: '', name: '', quantity: '', avgPrice: '' };

const inputClassName =
  'w-full rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]';

export const ManualAssetsSection = () => {
  const { data: assets } = useSuspenseManualAssets();
  const createMutation = useCreateManualAsset();
  const updateMutation = useUpdateManualAsset();
  const deleteMutation = useDeleteManualAsset();

  const [form, setForm] = useState<AssetFormValues>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange =
    (field: keyof AssetFormValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setSuccessMessage(null);
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const validate = (): string | null => {
    if (!form.ticker.trim() || !form.name.trim()) {
      return '티커와 종목명을 입력해주세요.';
    }
    const quantity = Number(form.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return '보유 수량을 0보다 큰 숫자로 입력해주세요.';
    }
    const avgPrice = Number(form.avgPrice);
    if (!Number.isFinite(avgPrice) || avgPrice <= 0) {
      return '평균 단가를 0보다 큰 숫자로 입력해주세요.';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validationMessage = validate();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      setSuccessMessage(null);
      return;
    }
    setErrorMessage(null);

    const payload = {
      ticker: form.ticker.trim(),
      name: form.name.trim(),
      quantity: Number(form.quantity),
      avgPrice: Number(form.avgPrice),
    };

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload });
        setSuccessMessage(MANUAL_ASSET_UPDATE_SUCCESS);
      } else {
        await createMutation.mutateAsync(payload);
        setSuccessMessage(MANUAL_ASSET_ADD_SUCCESS);
      }
      setForm(EMPTY_FORM);
      setEditingId(null);
    } catch {
      setErrorMessage(editingId ? MANUAL_ASSET_UPDATE_ERROR : MANUAL_ASSET_ADD_ERROR);
    }
  };

  const handleEdit = (asset: ManualAsset) => {
    setEditingId(asset.id);
    setForm({
      ticker: asset.ticker,
      name: asset.name,
      quantity: String(asset.quantity),
      avgPrice: String(asset.avgPrice),
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      if (editingId === id) {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setErrorMessage(null);
      }
      setSuccessMessage(MANUAL_ASSET_DELETE_SUCCESS);
    } catch {
      setErrorMessage(MANUAL_ASSET_DELETE_ERROR);
    }
  };

  return (
    <Surface as="section" aria-label="수동 자산 관리" className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold">수동 자산 입력</h2>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          증권사 연동 외 보유 자산을 직접 추가하고 관리합니다.
        </p>
      </div>

      <form onSubmit={(e) => void handleSubmit(e)} noValidate aria-label="자산 추가 폼" className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-ticker" className="text-sm font-medium">
              티커
            </label>
            <input id="asset-ticker" className={inputClassName} value={form.ticker} onChange={handleChange('ticker')} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-name" className="text-sm font-medium">
              종목명
            </label>
            <input id="asset-name" className={inputClassName} value={form.name} onChange={handleChange('name')} />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-quantity" className="text-sm font-medium">
              보유 수량
            </label>
            <input
              id="asset-quantity"
              type="number"
              min="0"
              className={inputClassName}
              value={form.quantity}
              onChange={handleChange('quantity')}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="asset-avg-price" className="text-sm font-medium">
              평균 단가
            </label>
            <input
              id="asset-avg-price"
              type="number"
              min="0"
              className={inputClassName}
              value={form.avgPrice}
              onChange={handleChange('avgPrice')}
            />
          </div>
        </div>

        {errorMessage && <FieldMessage tone="error">{errorMessage}</FieldMessage>}
        {successMessage && <FieldMessage tone="success">{successMessage}</FieldMessage>}

        <div className="flex gap-2">
          <Button type="submit" variant="primary">
            {editingId ? '자산 수정' : '자산 추가'}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setForm(EMPTY_FORM);
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
            >
              취소
            </Button>
          )}
        </div>
      </form>

      {assets.length === 0 ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">아직 추가된 자산이 없습니다.</p>
      ) : (
        <ul aria-label="추가된 자산 목록" className="flex flex-col gap-2">
          {assets.map((asset) => (
            <li
              key={asset.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius)] border border-[hsl(var(--border))] px-3 py-2 text-sm"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {asset.name} ({asset.ticker})
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                  {asset.quantity}주 · 평균 {asset.avgPrice.toLocaleString('ko-KR')}원
                </span>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="secondary"
                  aria-label={`${asset.name} 편집`}
                  onClick={() => handleEdit(asset)}
                >
                  편집
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  aria-label={`${asset.name} 삭제`}
                  onClick={() => void handleDelete(asset.id)}
                >
                  삭제
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Surface>
  );
};
