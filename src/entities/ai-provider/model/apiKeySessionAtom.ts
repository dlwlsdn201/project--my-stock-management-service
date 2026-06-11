import { atom } from 'jotai';

// raw API key는 브라우저 세션 동안 메모리에만 보관한다.
// localStorage/sessionStorage/Supabase 등 어떤 저장소에도 기록하지 않는다 (Unit 24에서 암호화 저장 전환 예정).
export const aiApiKeySessionAtom = atom<string | null>(null);

export const hasAiApiKeySessionAtom = atom((get) => get(aiApiKeySessionAtom) !== null);

export const setAiApiKeySessionAtom = atom(null, (_get, set, key: string) => {
  set(aiApiKeySessionAtom, key);
});

export const clearAiApiKeySessionAtom = atom(null, (_get, set) => {
  set(aiApiKeySessionAtom, null);
});
