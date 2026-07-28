import { updateSession } from "@/utils/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";

// 클라이언트의 요청이 서버에 도착하기 전 또는 응답이 클라이언트에게 전송되기 전에 미들웨어(중간 역할)가 실행됩니다.
export async function middleware(request: NextRequest) {
  await updateSession(request);

  // 쿠키 이름의 프로젝트 ref를 env에서 유도 (Supabase 프로젝트 교체 시에도 동작)
  const projectRef = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split(".")[0];
  const loginCookie = request.cookies.get(`sb-${projectRef}-auth-token`);
  const socialCookie = request.cookies.get(`sb-${projectRef}-auth-token0`);
  const url = request.nextUrl.pathname;

  if (url == "/login" && (loginCookie || socialCookie)) {
    const url = request.nextUrl.clone();
    url.pathname = "/main";
    return NextResponse.redirect(url);
  }

  if (url == "/register" && (loginCookie || socialCookie)) {
    const url = request.nextUrl.clone();
    url.pathname = "/main";
    return NextResponse.redirect(url);
  }
}

// 아래의 경로를 제외한 모든 경로에서 미들웨어를 실행
// 이미지 파일 (svg, png, jpg, jpeg, gif, webp)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
