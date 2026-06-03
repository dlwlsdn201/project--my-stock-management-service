/**
 * 브라우저 storage(local/session)에 대한 안전한 JSON read/write/remove helper.
 *
 * - `window`가 없는 환경(SSR/노드)에서는 storage 접근을 시도하지 않는다.
 * - JSON parse 실패·schema 불일치는 fallback으로 안전하게 처리한다.
 * - write/remove 실패(quota·차단 등)는 앱을 중단시키지 않는다.
 */

type BrowserStorageType = 'local' | 'session';

interface ReadBrowserStorageJsonParams<T> {
  key: string;
  storageType: BrowserStorageType;
  fallback: T;
  validate: (value: unknown) => value is T;
}

interface WriteBrowserStorageJsonParams<T> {
  key: string;
  storageType: BrowserStorageType;
  value: T;
}

interface RemoveBrowserStorageItemParams {
  key: string;
  storageType: BrowserStorageType;
}

const getBrowserStorage = (storageType: BrowserStorageType): Storage | null => {
  if (typeof window === 'undefined') return null;
  try {
    return storageType === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    // 일부 브라우저(프라이빗 모드 등)는 storage 접근 자체를 차단한다.
    return null;
  }
};

export const readBrowserStorageJson = <T>(params: ReadBrowserStorageJsonParams<T>): T => {
  const storage = getBrowserStorage(params.storageType);
  if (!storage) return params.fallback;

  try {
    const raw = storage.getItem(params.key);
    if (!raw) return params.fallback;
    const parsed: unknown = JSON.parse(raw);
    return params.validate(parsed) ? parsed : params.fallback;
  } catch {
    return params.fallback;
  }
};

export const writeBrowserStorageJson = <T>(params: WriteBrowserStorageJsonParams<T>): void => {
  const storage = getBrowserStorage(params.storageType);
  if (!storage) return;

  try {
    storage.setItem(params.key, JSON.stringify(params.value));
  } catch {
    // storage 미지원·quota 초과 상황에서도 앱 동작은 유지되어야 한다.
  }
};

export const removeBrowserStorageItem = (params: RemoveBrowserStorageItemParams): void => {
  const storage = getBrowserStorage(params.storageType);
  if (!storage) return;

  try {
    storage.removeItem(params.key);
  } catch {
    // storage 실패가 로그아웃·초기화 동작을 막아서는 안 된다.
  }
};
