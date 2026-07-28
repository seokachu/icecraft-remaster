# IceCraft Remaster

실시간 화상채팅 기반 마피아 게임. 2024년 4인 팀 프로젝트 [IceCraft](https://github.com/orgs/ice-craft/repositories)를 개인 프로젝트로 재구축하는 저장소입니다.

원본 코드 스냅샷에서 새로 시작해 구조 개선 · 보안 강화 · 무료 인프라 이전(Vercel + Render + Supabase)을 진행합니다. 화상채팅은 LiveKit에서 순수 WebRTC P2P mesh(최대 6인)로 전환했습니다.

## 구조

| 디렉토리 | 내용 |
|---|---|
| `frontend/` | Next.js (App Router) · TypeScript · WebRTC (P2P mesh) · Socket.IO client · Supabase · Zustand · Tailwind CSS |
| `backend/` | Express · Socket.IO 게임 서버 · TypeScript · Supabase |

각 디렉토리의 README에 원본 프로젝트의 상세 문서가 있습니다.

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
3. Authentication > Providers에서 이메일 로그인 확인, 필요 시 소셜 로그인(Kakao/Google/GitHub/Facebook) 설정 — 각 플랫폼의 OAuth 앱 키가 필요합니다
4. Authentication > URL Configuration에서 Site URL을 배포 도메인으로 설정
5. Settings > API의 URL과 anon key를 프론트/백엔드 환경변수에 입력

## 배포 (무료 티어)

| 대상 | 플랫폼 | 방법 |
|---|---|---|
| `backend/` | Render (free) | 루트의 `render.yaml` 블루프린트로 생성. 환경변수 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ALLOWED_ORIGINS` 설정 |
| `frontend/` | Vercel (hobby) | Root Directory를 `frontend`로 지정. `.env.example`의 변수들 설정 |

Render 무료 티어는 15분 무접속 시 잠들며 첫 접속에 콜드스타트(~1분)가 있습니다.
