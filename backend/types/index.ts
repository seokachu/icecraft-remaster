export interface VoteBoard {
  user_id: string;
  user_nickname: string;
  voted_count: number;
  role: string;
  is_lived: boolean;
}

export interface AllPlayer {
  user_id: string;
  user_nickname: string;
  is_lived: boolean;
  role: string;
}

export interface MostVotedPlayer {
  isValid: boolean;
  result: VoteBoard | AllPlayer;
}

export interface YesOrNoVoteResult {
  result: boolean;
  detail: {
    yesCount: number;
    noCount: number;
  };
}

// 소켓으로 나가는 미디어 맵 — 공유 이벤트 타입과 동일한 형태를 강제
export type { MediaStatus as Media } from "../../shared/socket-events";

export interface RoundStatus {
  [key: string]: string;
}
