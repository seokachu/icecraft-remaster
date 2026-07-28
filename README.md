# IceCraft Remaster

실시간 화상채팅 기반 마피아 게임. 2024년 4인 팀 프로젝트 [IceCraft](https://github.com/orgs/ice-craft/repositories)를 개인 프로젝트로 재구축하는 저장소입니다.

원본 코드 스냅샷에서 새로 시작해 구조 개선 · 보안 강화 · 무료 인프라 이전(Vercel + Render + Supabase + LiveKit Cloud)을 진행합니다.

## 구조

| 디렉토리 | 내용 |
|---|---|
| `frontend/` | Next.js (App Router) · TypeScript · LiveKit · Socket.IO client · Supabase · Zustand · Tailwind CSS |
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

## 배포 (무료 티어)

| 대상 | 플랫폼 | 방법 |
|---|---|---|
| `backend/` | Render (free) | 루트의 `render.yaml` 블루프린트로 생성. 환경변수 `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ALLOWED_ORIGINS` 설정 |
| `frontend/` | Vercel (hobby) | Root Directory를 `frontend`로 지정. `.env.example`의 변수들 설정 |

Render 무료 티어는 15분 무접속 시 잠들며 첫 접속에 콜드스타트(~1분)가 있습니다.
