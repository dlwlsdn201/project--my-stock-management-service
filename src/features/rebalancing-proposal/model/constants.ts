export const PROPOSAL_SECTION_LABELS = {
  currentComposition: '현재 자산 구성',
  recommendedComposition: 'AI 추천 구성',
  rationale: 'AI 추천 근거',
  simulation: '예상 시뮬레이션',
} as const;

export const PROPOSAL_REQUEST_CTA_LABEL = 'AI 추천 받기';

export const API_KEY_CONNECTED_NOTE =
  'API key가 연동되어 추천 횟수 제한 없이 이용할 수 있습니다.';

export const TRIAL_EXHAUSTED_NOTICE = '무료 제안 횟수를 모두 사용했습니다.';

export const buildTrialRemainingLabel = (count: number) => `무료 제안 잔여 ${count}회`;

export const SIMULATION_PERIOD_SUFFIX = '개월';

export const API_KEY_PROMPT = {
  dialogLabel: 'API key 연동 안내',
  title: '무료 제안을 모두 사용했어요',
  description: '추가 AI 리밸런싱 추천을 받으려면 설정에서 개인 API key를 연동해 주세요.',
  settingsCtaLabel: '설정으로 이동',
  dismissLabel: '닫기',
} as const;

export const API_KEY_PROMPT_TITLE_ID = 'api-key-prompt-title';

export const API_KEY_PROMPT_DESCRIPTION_ID = 'api-key-prompt-description';
