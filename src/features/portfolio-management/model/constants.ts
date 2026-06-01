export const PORTFOLIO_TABLE_CAPTION = '보유 종목별 현재/목표 비중 및 AI 추천 액션';

export const PORTFOLIO_TABLE_COLUMNS = {
  name: '종목',
  currentWeight: '현재 비중',
  targetWeight: '목표 비중',
  gap: '차이',
  action: 'AI 액션',
} as const;

export const WEIGHT_SUFFIX = '%';

export const GAP_SUFFIX = '%p';

export const GAP_DECIMAL_PLACES = 2;

export const REBALANCE_CTA_LABEL = 'AI 리밸런싱 추천 보기';

export const PANEL_HEADING = '보유 종목 관리';

// 차이값은 부호(+/-) 텍스트와 색상을 함께 사용해 가시성을 높인다(색상 단독 금지).
export const GAP_TONE_CLASSES = {
  over: 'text-red-600',
  under: 'text-blue-600',
  even: 'text-[hsl(var(--muted-foreground))]',
} as const;

export const EMPTY_STATE = {
  title: '표시할 보유 종목이 없습니다',
  description: '증권사 계좌를 연동하거나 자산을 추가하면 종목별 관리 화면이 표시됩니다.',
} as const;

export const ERROR_STATE_DESCRIPTION =
  '포트폴리오 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
