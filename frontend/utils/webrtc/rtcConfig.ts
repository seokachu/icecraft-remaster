//NOTE - STUN은 무료 공개 서버 사용. NAT 환경에 따라 P2P가 막히는 경우를 위해 TURN은 env로 선택 주입
export const rtcConfig: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    ...(process.env.NEXT_PUBLIC_TURN_URL
      ? [
          {
            urls: process.env.NEXT_PUBLIC_TURN_URL,
            username: process.env.NEXT_PUBLIC_TURN_USERNAME ?? "",
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL ?? ""
          }
        ]
      : [])
  ]
};
