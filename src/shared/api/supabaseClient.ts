// Supabase 연동 설정 감지(SSOT). 실제 supabase-js 클라이언트 연동은 후속 범위이며,
// 본 모듈은 환경변수 존재 여부만 판정해 entities 계층의 mock fallback 분기 근거를 제공한다.

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (typeof url === 'string' && url.length > 0 && typeof anonKey === 'string' && anonKey.length > 0) {
    return { url, anonKey };
  }

  return null;
};

export const isSupabaseConfigured = (): boolean => getSupabaseConfig() !== null;
