/**
 * Supabase 테스트 격리 유틸리티 (테스트 전용 — 프로덕션 코드에서 import 금지)
 *
 * 현재 Unit 22 시점의 supabase store 테스트는 mock SupabaseClient를 직접 주입하는
 * factory 패턴을 사용하므로 이 파일이 직접 필요하지 않다.
 *
 * 향후 통합 테스트(실제 환경 변수 + getSupabaseClient 경유)가 추가될 경우
 * 여기에 `resetSupabaseClientForTest` 등의 헬퍼를 추가한다.
 * 그 시점에 supabaseClient.ts 내부 변수를 테스트 전용으로 접근하는 방식을 결정한다.
 */

export {};
