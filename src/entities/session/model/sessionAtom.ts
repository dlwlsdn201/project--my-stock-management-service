import { atom } from 'jotai';
import type { Session } from './types';

/** 앱 전역 mock 인증 세션. null이면 비로그인 상태. (token persistence 없음 — 메모리 전용) */
export const sessionAtom = atom<Session | null>(null);

/** 파생 상태: 세션 존재 여부 = 인증 여부 */
export const isAuthenticatedAtom = atom((get) => get(sessionAtom) !== null);

/** 세션을 비우는 write-only 액션 (로그아웃 등) */
export const clearSessionAtom = atom(null, (_get, set) => {
  set(sessionAtom, null);
});

/** 무료 AI 제안 횟수를 1 차감한다. 0 미만이 되지 않으며 세션 없으면 no-op */
export const decrementAiTrialAtom = atom(null, (get, set) => {
  const session = get(sessionAtom);
  if (!session || session.aiTrialRemainingCount <= 0) return;
  set(sessionAtom, { ...session, aiTrialRemainingCount: session.aiTrialRemainingCount - 1 });
});
