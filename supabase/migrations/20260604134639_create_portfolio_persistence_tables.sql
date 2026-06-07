-- target_allocations: 사용자별 목표 자산군 비중 (equity/bond/cash-and-alternative)
-- 엔티티 타입: TargetAllocation { equity: number; bond: number; 'cash-and-alternative': number }
create table if not exists public.target_allocations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  equity      numeric(5,2) not null check (equity >= 0 and equity <= 100),
  bond        numeric(5,2) not null check (bond >= 0 and bond <= 100),
  cash_and_alternative numeric(5,2) not null check (cash_and_alternative >= 0 and cash_and_alternative <= 100),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 사용자당 목표 비중 레코드는 1개. upsert 패턴으로 단일 레코드를 유지한다.
create unique index if not exists target_allocations_user_id_unique
  on public.target_allocations (user_id);

-- manual_assets: 사용자가 수동 입력한 자산 목록
-- 엔티티 타입: ManualAsset { id: string; ticker: string; name: string; quantity: number; avgPrice: number }
create table if not exists public.manual_assets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null,
  ticker      text not null,
  name        text not null,
  quantity    numeric not null check (quantity > 0),
  avg_price   numeric not null check (avg_price > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- RLS 활성화
alter table public.target_allocations enable row level security;
alter table public.manual_assets enable row level security;

-- MVP RLS 정책: anon 키로 접근 가능하게 열어둔다.
-- mock user_id 기반 persistence가 동작해야 하므로 제한적으로 허용한다.
--
-- 운영 전환 시:
--   1. 아래 MVP 정책을 삭제한다.
--   2. 아래 운영 정책(주석 처리됨)을 활성화한다.
--   3. Supabase Auth(OAuth 등) 연동이 완료된 상태여야 한다.
--
-- 운영 정책 예시 (Unit 25+ OAuth 연동 후 적용):
-- create policy "users_manage_own_target_allocations"
--   on public.target_allocations for all
--   to authenticated
--   using ( (select auth.uid()) = user_id )
--   with check ( (select auth.uid()) = user_id );
--
-- create policy "users_manage_own_manual_assets"
--   on public.manual_assets for all
--   to authenticated
--   using ( (select auth.uid()) = user_id )
--   with check ( (select auth.uid()) = user_id );

create policy "mvp_anon_all_target_allocations"
  on public.target_allocations for all
  to anon
  using (true)
  with check (true);

create policy "mvp_anon_all_manual_assets"
  on public.manual_assets for all
  to anon
  using (true)
  with check (true);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger target_allocations_set_updated_at
  before update on public.target_allocations
  for each row execute function public.set_updated_at();

create trigger manual_assets_set_updated_at
  before update on public.manual_assets
  for each row execute function public.set_updated_at();
