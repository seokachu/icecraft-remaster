# 세팅 · 배포 가이드

## 로컬 실행

```bash
# 백엔드 (http://localhost:4000)
cd backend
cp .env.example .env   # 값 채우기
npm install
npm run dev

# 프론트엔드 (http://localhost:3000)
cd frontend
cp .env.example .env.local   # 값 채우기
npm install
npm run dev
```

## Supabase 새 프로젝트 세팅

기존 팀 프로젝트의 Supabase는 접속 불가 상태라 새 프로젝트가 필요합니다.

1. [supabase.com](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 전체 실행 (테이블 3개 생성)
3. Authentication > Providers에서 이메일 로그인 확인, 필요 시 소셜 로그인(Kakao / Google) 설정 — 각 플랫폼의 OAuth 앱 키가 필요합니다
4. Authentication > URL Configuration에서 Site URL을 배포 도메인으로 설정
5. Settings > API의 URL과 anon key를 프론트/백엔드 환경변수에 입력

## 보안 설정 (RLS)

`supabase/security.sql`이 RLS · 계정 자동 생성 트리거 · 컬럼 차단(마피아 role 은닉)을 설정합니다. 멱등 스크립트라 재실행해도 안전합니다. **반드시 이 순서로 적용하세요:**

1. Render의 `icecraft-backend` 환경변수에 `SUPABASE_SERVICE_ROLE_KEY` 추가 (Supabase Settings > API의 service_role secret) → 재배포 완료 대기
2. Supabase SQL Editor에서 `supabase/security.sql` 전체 실행

순서를 지키지 않으면(BE가 anon key인 상태에서 RLS를 켜면) 게임 진행이 전부 막힙니다.

## 배포 (무료 티어)

| 대상 | 플랫폼 | 방법 |
|---|---|---|
| `backend/` | Render (free) | 루트의 `render.yaml` 블루프린트로 생성. 환경변수 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `ALLOWED_ORIGINS` 설정 |
| `frontend/` | Vercel (hobby) | Root Directory를 `frontend`로 지정. `.env.example`의 변수들 설정 |

Render 무료 티어는 15분 무접속 시 잠들며 첫 접속에 콜드스타트(\~1분)가 있습니다.
