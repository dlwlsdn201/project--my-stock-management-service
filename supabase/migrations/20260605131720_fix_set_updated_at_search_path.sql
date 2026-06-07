-- DB hardening: public.set_updated_at 함수의 search_path 명시
--
-- Supabase security advisor(function_search_path_mutable) 경고 해소.
-- search_path를 명시하지 않으면 함수 실행 컨텍스트에 따라 의도치 않은 스키마를
-- 참조할 수 있다. 트리거 함수이므로 SECURITY DEFINER는 불필요하며
-- SET search_path = '' 로 명시적으로 고정한다.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
