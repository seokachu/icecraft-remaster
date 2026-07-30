// Vercel은 NEXT_PUBLIC_VERCEL_URL을 프로토콜 없는 호스트(example.vercel.app)로 주입한다.
// new URL()과 OAuth redirectTo는 스킴이 없으면 실패하므로 여기서 한 번만 보정한다.
const rawBaseUrl =
  process.env.NEXT_PUBLIC_VERCEL_URL || process.env.NEXT_PUBLIC_DEV_CLIENT_URL || "http://localhost:3000";

export const baseUrl = /^https?:\/\//.test(rawBaseUrl) ? rawBaseUrl : `https://${rawBaseUrl}`;
