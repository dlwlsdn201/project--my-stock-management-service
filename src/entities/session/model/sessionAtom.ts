import { atom } from 'jotai';
import { readBrowserStorageJson, removeBrowserStorageItem, writeBrowserStorageJson } from '@shared/lib';
import { SESSION_STORAGE_KEY } from './constants';
import type { Session } from './types';

/** 저장된 값이 최소한의 Session shape를 만족하는지 검증한다. */
const isSession = (value: unknown): value is Session => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<Session>;
  const isKnownStatus = candidate.userStatus === 'new' || candidate.userStatus === 'existing';
  const isValidTrialCount =
    typeof candidate.aiTrialRemainingCount === 'number' &&
    Number.isInteger(candidate.aiTrialRemainingCount) &&
    candidate.aiTrialRemainingCount >= 0;
  return isKnownStatus && isValidTrialCount;
};

const readPersistedSession = (): Session | null =>
  readBrowserStorageJson<Session | null>({
    key: SESSION_STORAGE_KEY,
    storageType: 'session',
    fallback: null,
    validate: (value): value is Session | null => value === null || isSession(value),
  });

/** store별 첫 접근 시 sessionStorage에서 1회 복원하기 위한 sentinel */
const UNINITIALIZED = Symbol('session-uninitialized');

/** 내부 base atom. sentinel 동안은 storage 값을 복원하고, write 이후에는 메모리 값을 보관한다. */
const persistedSessionAtom = atom<Session | null | typeof UNINITIALIZED>(UNINITIALIZED);

/**
 * 앱 전역 mock 인증 세션. null이면 비로그인 상태.
 * 초기값은 sessionStorage에서 복원하며, write 시 storage에 저장/삭제를 반영한다.
 * (인증 토큰·민감정보 미저장 — userStatus와 무료 AI 잔여 횟수 메타데이터만 보존)
 */
export const sessionAtom = atom(
  (get): Session | null => {
    const current = get(persistedSessionAtom);
    return current === UNINITIALIZED ? readPersistedSession() : current;
  },
  (_get, set, nextSession: Session | null) => {
    set(persistedSessionAtom, nextSession);
    if (nextSession) {
      writeBrowserStorageJson({ key: SESSION_STORAGE_KEY, storageType: 'session', value: nextSession });
      return;
    }
    removeBrowserStorageItem({ key: SESSION_STORAGE_KEY, storageType: 'session' });
  },
);

/** 파생 상태: 세션 존재 여부 = 인증 여부 */
export const isAuthenticatedAtom = atom((get) => get(sessionAtom) !== null);

/** 세션을 비우는 write-only 액션 (로그아웃 등). storage도 함께 제거한다. */
export const clearSessionAtom = atom(null, (_get, set) => {
  set(sessionAtom, null);
});

/** 무료 AI 제안 횟수를 1 차감한다. 0 미만이 되지 않으며 세션 없으면 no-op. storage도 함께 갱신한다. */
export const decrementAiTrialAtom = atom(null, (get, set) => {
  const session = get(sessionAtom);
  if (!session || session.aiTrialRemainingCount <= 0) return;
  set(sessionAtom, { ...session, aiTrialRemainingCount: session.aiTrialRemainingCount - 1 });
});
