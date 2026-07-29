-- ============================================================
-- 회원가입 시 account_table 자동 생성 트리거
-- (이메일 가입·소셜 로그인 모두 커버, FE의 직접 insert 제거)
--
-- ✅ 지금 바로 실행해도 안전 (RLS와 무관, 백엔드 동작에 영향 없음)
-- ============================================================
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

-- ------------------------------------------------------------
-- 백필: 트리거 생성 이전에 가입한 계정을 account_table에 채움
-- ------------------------------------------------------------
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
