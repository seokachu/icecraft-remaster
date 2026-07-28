-- IceCraft 데이터베이스 스키마
-- 새 Supabase 프로젝트의 SQL Editor에서 이 파일 전체를 실행하면 됩니다.
-- (원본 팀 프로젝트의 types/supabase.ts 생성 타입에서 복원)

-- 계정/랭킹 — user_id는 Supabase Auth의 user id (회원가입 시 프론트에서 insert)
create table public.account_table (
  user_id uuid primary key default gen_random_uuid(),
  email text not null,
  nickname text,
  mafia_score integer not null default 0,
  music_score integer not null default 0,
  total_score integer not null default 0
);

-- 게임 방
create table public.room_table (
  room_id uuid primary key default gen_random_uuid(),
  title text,
  game_category text,
  chief uuid, -- 방장 user_id
  current_user_count integer not null default 0,
  total_user_count integer not null default 5,
  is_playing boolean not null default false,
  created_at timestamptz default now()
);

-- 방-유저 매칭 + 게임 진행 상태 (역할/생존/투표)
create table public.room_user_match_table (
  match_id uuid primary key default gen_random_uuid(),
  room_id uuid references public.room_table (room_id) on delete cascade,
  user_id uuid,
  user_nickname text,
  role text, -- "마피아" | "시민" | "의사" | "경찰"
  is_lived boolean not null default true,
  is_ready boolean not null default false,
  is_selected boolean not null default false,
  voted_count integer not null default 0,
  vote_yes_or_no boolean,
  join_time timestamptz default now(),
  vote_time timestamptz
);

-- NOTE: RLS는 의도적으로 원본과 동일하게 비활성 상태입니다.
-- 현재 구조는 백엔드가 anon key로 게임 상태를 갱신하기 때문에 RLS를 켜면 게임이 멈춥니다.
-- 보안 리팩토링(백엔드 service_role key 전환) 때 반드시 함께 활성화해야 합니다.
