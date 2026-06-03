import { createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import { SESSION_STORAGE_KEY } from './constants';
import { clearSessionAtom, decrementAiTrialAtom, isAuthenticatedAtom, sessionAtom } from './sessionAtom';

describe('sessionAtom', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

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

  describe('sessionStorage persistence', () => {
    it('유효한 세션이 storage에 있으면 atom 초기값으로 복원한다', () => {
      window.sessionStorage.setItem(
        SESSION_STORAGE_KEY,
        JSON.stringify({ userStatus: 'existing', aiTrialRemainingCount: 2 }),
      );
      const store = createStore();
      expect(store.get(sessionAtom)).toEqual({ userStatus: 'existing', aiTrialRemainingCount: 2 });
      expect(store.get(isAuthenticatedAtom)).toBe(true);
    });

    it('세션을 저장하면 sessionStorage에 기록한다', () => {
      const store = createStore();
      store.set(sessionAtom, { userStatus: 'new', aiTrialRemainingCount: 3 });
      expect(JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? '{}')).toEqual({
        userStatus: 'new',
        aiTrialRemainingCount: 3,
      });
    });

    it('clear 액션은 sessionStorage 값도 제거한다', () => {
      const store = createStore();
      store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 1 });
      store.set(clearSessionAtom);
      expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    });

    it('잘못된 JSON은 무시하고 null로 fallback한다', () => {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, '{bad-json');
      const store = createStore();
      expect(store.get(sessionAtom)).toBeNull();
    });

    it('shape가 다른 값은 무시하고 null로 fallback한다', () => {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ userStatus: 'unknown' }));
      const store = createStore();
      expect(store.get(sessionAtom)).toBeNull();
    });
  });
});

describe('decrementAiTrialAtom', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('잔여 횟수가 남아있으면 1 차감한다', () => {
    const store = createStore();
    store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 3 });
    store.set(decrementAiTrialAtom);
    expect(store.get(sessionAtom)?.aiTrialRemainingCount).toBe(2);
  });

  it('잔여 횟수를 차감하면 sessionStorage 값도 함께 갱신한다', () => {
    const store = createStore();
    store.set(sessionAtom, { userStatus: 'existing', aiTrialRemainingCount: 2 });
    store.set(decrementAiTrialAtom);
    expect(JSON.parse(window.sessionStorage.getItem(SESSION_STORAGE_KEY) ?? '{}').aiTrialRemainingCount).toBe(1);
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
