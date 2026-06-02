import type { InvestmentProfile } from '@entities/portfolio';

// 자산군 라벨은 entities/portfolio SSOT를 재노출한다.
export { ALLOCATION_GROUP_LABELS } from '@entities/portfolio';

// AI 설정 관련 상수는 entities/settings SSOT를 재노출한다.
export {
  AI_MODEL_OPTIONS,
  API_KEY_MIN_LENGTH,
  API_KEY_STATUS_LABELS,
  API_KEY_VISIBLE_SUFFIX_COUNT,
  DEFAULT_AI_MODEL_ID,
} from '@entities/settings';

export const INVESTMENT_PROFILE_LABELS: Record<InvestmentProfile, string> = {
  aggressive: '공격형',
  balanced: '중립형',
  defensive: '방어형',
};

export const INVESTMENT_PROFILE_ORDER: InvestmentProfile[] = [
  'aggressive',
  'balanced',
  'defensive',
];

export const API_KEY_ERROR_ID = 'api-key-error';

export const TARGET_ALLOCATION_SAVE_LABEL = '목표 비중 저장';

export const TARGET_ALLOCATION_SAVING_LABEL = '저장 중...';

export const TARGET_ALLOCATION_SAVE_SUCCESS = '목표 비중을 저장했습니다.';

export const TARGET_ALLOCATION_SAVE_ERROR =
  '목표 비중 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.';

export const TARGET_ALLOCATION_LOAD_ERROR =
  '저장된 목표 비중을 불러오지 못했습니다. 기본값으로 표시합니다.';
