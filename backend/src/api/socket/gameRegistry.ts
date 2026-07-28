// 방별 진행 중인 게임 루프 레지스트리
// - gameStart 중복 실행 방지 (같은 방에 setInterval이 여러 개 도는 사고 차단)
// - 게임 종료/에러 시 반드시 unregister로 해제할 것
const activeGames = new Map<string, NodeJS.Timeout | null>();

export const isGameActive = (roomId: string) => activeGames.has(roomId);

// 검증 단계에서 자리를 먼저 잡아 동시 요청 race를 막는다
export const reserveGame = (roomId: string) => {
  activeGames.set(roomId, null);
};

export const registerGame = (roomId: string, timer: NodeJS.Timeout) => {
  activeGames.set(roomId, timer);
};

export const unregisterGame = (roomId: string) => {
  const timer = activeGames.get(roomId);
  if (timer) {
    clearInterval(timer);
  }
  activeGames.delete(roomId);
};
