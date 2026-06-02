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
