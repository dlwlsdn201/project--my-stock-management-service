import type { ValueChangeDirection } from './types';

// 전일 대비 KPI 계산용 mock baseline (대시보드 전용 표시 데이터).
export const MOCK_PREVIOUS_TOTAL_VALUE = 19_500_000;

export const TOP_HOLDINGS_COUNT = 3;

export const MOCK_DIAGNOSIS_SUMMARY =
  '현재 주식 비중이 목표치를 상회합니다. 채권·현금 비중을 보완하면 변동성을 낮출 수 있습니다.';

export const VALUE_CHANGE_DIRECTION_LABELS: Record<ValueChangeDirection, string> = {
  up: '상승',
  down: '하락',
  flat: '보합',
};

export const VALUE_CHANGE_DIRECTION_SYMBOLS: Record<ValueChangeDirection, string> = {
  up: '▲',
  down: '▼',
  flat: '–',
};

// 상승/하락을 색상과 함께 보조 전달 (텍스트 라벨과 병행). 한국 시장 관례: 상승=빨강, 하락=파랑.
export const VALUE_CHANGE_DIRECTION_CLASSES: Record<ValueChangeDirection, string> = {
  up: 'text-[hsl(var(--destructive))]',
  down: 'text-[hsl(var(--primary))]',
  flat: 'text-[hsl(var(--muted-foreground))]',
};
