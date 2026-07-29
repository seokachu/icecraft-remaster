-- ============================================================
-- IceCraft 보안 설정 (RLS)
-- 계정 자동 생성 트리거는 trigger.sql로 분리됨 (먼저 실행해도 안전)
--
-- ⚠️ 실행 순서 주의:
--   반드시 백엔드(Render)에 SUPABASE_SERVICE_ROLE_KEY 환경변수를
--   먼저 넣고 재배포한 뒤에 이 파일을 실행할 것.
--   (BE가 anon key인 상태에서 RLS를 켜면 게임 진행이 전부 막힘)
-- ============================================================

-- ------------------------------------------------------------
-- 1. RLS 활성화
--    쓰기는 전부 차단 (백엔드가 service_role로만 수행, RLS 우회)
-- ------------------------------------------------------------
alter table public.account_table enable row level security;
alter table public.room_table enable row level security;
alter table public.room_user_match_table enable row level security;

-- 읽기 정책: 방 목록/랭킹/중복 이메일 체크에 필요
create policy "account_read" on public.account_table
  for select using (true);

create policy "room_read" on public.room_table
  for select using (true);

create policy "match_read" on public.room_user_match_table
  for select using (true);

-- INSERT / UPDATE / DELETE 정책은 의도적으로 없음
-- → 클라이언트(anon/authenticated)의 모든 쓰기가 거부됨
-- → 점수 조작, 역할 조작, 방 정보 조작 불가

-- ------------------------------------------------------------
-- 2. 컬럼 단위 차단: 마피아 정체 은닉 (핵심)
--    room_user_match_table에서 클라이언트가 읽을 수 있는 컬럼을
--    명단 표시에 필요한 것만으로 제한. role·투표 관련 컬럼은
--    service_role(백엔드)만 읽을 수 있다.
-- ------------------------------------------------------------
revoke select on public.room_user_match_table from anon, authenticated;
grant select (match_id, room_id, user_id, user_nickname, is_ready, is_lived, join_time)
  on public.room_user_match_table to anon, authenticated;
