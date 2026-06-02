import { createStore } from 'jotai';
import { describe, expect, it } from 'vitest';
import { clearSessionAtom, decrementAiTrialAtom, isAuthenticatedAtom, sessionAtom } from './sessionAtom';

describe('sessionAtom', () => {
  it('기본값은 비로그인(null)이며 isAuthenticated는 false다', () => {
    const store = createStore();
    expect(store.get(sessionAtom)).toBeNull();
    expect(store.get(isAuthenticatedAtom)).toBe(false);
  });

  it('세션을 저장하면 인증 상태가 되고 사용자 상태를 보존한다', () => {
    const store = createStore();
    store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 1 });
    expect(store.get(isAuthenticatedAtom)).toBe(true);
    expect(store.get(sessionAtom)).toEqual({ userStatus: 'existing', aiTrialRemainingCount: 1 });
  });

  it('clear 액션은 세션을 비운다', () => {
    const store = createStore();
    store.set(sessionAtom, { userStatus: 'new', aiTrialRemainingCount: 3 });
    store.set(clearSessionAtom);
    expect(store.get(sessionAtom)).toBeNull();
    expect(store.get(isAuthenticatedAtom)).toBe(false);
  });
});

describe('decrementAiTrialAtom', () => {
  it('잔여 횟수가 남아있으면 1 차감한다', () => {
    const store = createStore();
    store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 3 });
    store.set(decrementAiTrialAtom);
    expect(store.get(sessionAtom)?.aiTrialRemainingCount).toBe(2);
  });

  it('잔여 횟수가 0이면 음수가 되지 않는다', () => {
    const store = createStore();
    store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 0 });
    store.set(decrementAiTrialAtom);
    expect(store.get(sessionAtom)?.aiTrialRemainingCount).toBe(0);
  });

  it('세션이 없으면 no-op이다', () => {
    const store = createStore();
    store.set(decrementAiTrialAtom);
    expect(store.get(sessionAtom)).toBeNull();
  });
});
