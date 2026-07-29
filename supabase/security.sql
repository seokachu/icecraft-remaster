-- ============================================================
-- IceCraft 보안 설정 통합본 (트리거 + RLS + 컬럼 차단)
-- 몇 번을 다시 실행해도 안전함 (멱등)
--
-- ⚠️ 실행 전 필수: Render(icecraft-backend) 환경변수에
--   SUPABASE_SERVICE_ROLE_KEY를 넣고 재배포가 끝난 상태여야 함.
--   (BE가 anon key인 상태에서 RLS가 켜져 있으면 게임 진행이 전부 막힘)
-- ============================================================

-- ------------------------------------------------------------
-- 1. 회원가입 시 account_table 자동 생성 트리거
--    (이메일 가입·소셜 로그인 모두 커버, FE의 직접 insert 제거)
-- ------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.account_table (user_id, email, nickname)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      new.raw_user_meta_data ->> 'nickname',
      new.raw_user_meta_data ->> 'name',
      split_part(coalesce(new.email, '익명'), '@', 1)
    )
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 백필: 트리거 생성 이전에 가입한 계정을 account_table에 채움
insert into public.account_table (user_id, email, nickname)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(
    u.raw_user_meta_data ->> 'nickname',
    u.raw_user_meta_data ->> 'name',
    split_part(coalesce(u.email, '익명'), '@', 1)
  )
from auth.users u
on conflict (user_id) do nothing;

-- ------------------------------------------------------------
-- 2. RLS 활성화 + 읽기 정책
--    쓰기 정책은 의도적으로 없음 → 클라이언트의 모든 쓰기 거부
--    (백엔드가 service_role로만 쓰기 수행, RLS 우회)
-- ------------------------------------------------------------
alter table public.account_table enable row level security;
alter table public.room_table enable row level security;
alter table public.room_user_match_table enable row level security;

drop policy if exists "account_read" on public.account_table;
create policy "account_read" on public.account_table
  for select using (true);

drop policy if exists "room_read" on public.room_table;
create policy "room_read" on public.room_table
  for select using (true);

drop policy if exists "match_read" on public.room_user_match_table;
create policy "match_read" on public.room_user_match_table
  for select using (true);

-- ------------------------------------------------------------
-- 3. 컬럼 단위 차단: 마피아 정체 은닉 (핵심)
--    클라이언트가 읽을 수 있는 컬럼을 명단 표시용으로 제한.
--    role·투표 컬럼은 service_role(백엔드)만 읽을 수 있다.
-- ------------------------------------------------------------
revoke select on public.room_user_match_table from anon, authenticated;
grant select (match_id, room_id, user_id, user_nickname, is_ready, is_lived, join_time)
  on public.room_user_match_table to anon, authenticated;

-- ------------------------------------------------------------
-- 4. 적용 결과 확인 (이 쿼리 결과가 화면에 표시됨)
-- ------------------------------------------------------------
select 'RLS 켜짐: ' || tablename as "항목", rowsecurity::text as "값"
from pg_tables where schemaname = 'public'
union all
select '읽기 정책: ' || tablename || ' → ' || policyname, cmd
from pg_policies where schemaname = 'public'
union all
select '가입 트리거 존재', (count(*) > 0)::text
from pg_trigger where tgname = 'on_auth_user_created'
union all
select 'auth 가입 계정 수', count(*)::text from auth.users
union all
select 'account_table 행 수', count(*)::text from public.account_table;
