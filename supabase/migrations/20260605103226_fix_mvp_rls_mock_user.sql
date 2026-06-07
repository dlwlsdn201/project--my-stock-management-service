-- MVP RLS 패치: anon 전체 row 접근(using true) → mock user_id 범위로 제한
--
-- 이 migration은 Unit 22 1차 리뷰 지적(C2)에 따라 추가됐다.
-- 기존 정책(using true)은 anon 키를 아는 누구나 모든 row를 조회/수정할 수 있었다.
-- mock MVP 단계에서는 앱이 사용하는 고정 user_id만 허용한다.
--
-- 운영 전환 시:
--   1. 아래 MVP 정책을 삭제한다.
--   2. Supabase Auth(OAuth 등) 연동을 완료한다.
--   3. authenticated role + auth.uid() = user_id 기반 운영 정책을 생성한다.
--   (Unit 25+ OAuth 연동 후 적용 예정)

-- target_allocations: 기존 MVP anon-all 정책 제거
drop policy if exists "mvp_anon_all_target_allocations" on public.target_allocations;

-- manual_assets: 기존 MVP anon-all 정책 제거
drop policy if exists "mvp_anon_all_manual_assets" on public.manual_assets;

-- target_allocations: mock user_id 범위로 제한
create policy "mvp_anon_target_allocations_mock_user"
  on public.target_allocations for all
  to anon
  using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);

-- manual_assets: mock user_id 범위로 제한
create policy "mvp_anon_manual_assets_mock_user"
  on public.manual_assets for all
  to anon
  using (user_id = '00000000-0000-0000-0000-000000000001'::uuid)
  with check (user_id = '00000000-0000-0000-0000-000000000001'::uuid);
