// FE와 BE가 공유하는 Socket.IO 이벤트 맵 (단일 소스)
// - frontend: utils/socket/socket.ts 의 io<ServerToClientEvents, ClientToServerEvents>
// - backend: src/app.ts 의 new Server<ClientToServerEvents, ServerToClientEvents>
//
// 이벤트를 추가/변경할 때는 반드시 이 파일을 수정 — 양쪽에서 컴파일 타임에 검증된다.

// ---------- 공용 페이로드 타입 ----------

export interface RoomInfo {
  room_id: string;
  title: string | null;
  game_category: string | null;
  chief: string | null;
  current_user_count: number;
  total_user_count: number;
  is_playing: boolean;
  created_at: string | null;
}

// 로비 방 목록: room_table + 참가자 user_id 조인
export interface LobbyRoom extends RoomInfo {
  users: { user_id: string }[];
}

export interface RoomPlayer {
  user_id: string;
  user_nickname: string;
  is_ready: boolean;
  join_time: string | null;
}

export interface MediaStatus {
  [userId: string]: { camera: boolean; mike: boolean };
}

// 5인 게임에서는 doctor/police가 null
export interface PlayerRoles {
  [job: string]: string[] | null;
}

// 투표 결과 공개용 — role은 의도적으로 제외 (마피아 정체 유출 방지)
export interface VoteResult {
  user_id: string;
  user_nickname: string;
  voted_count: number;
  is_lived: boolean;
}

export interface YesOrNoVoteResult {
  result: boolean;
  detail: { yesCount: number; noCount: number };
}

export type VictoryTeam = "Citizen" | "Mafia";
export type SelectPhase = "vote" | "mafia" | "doctor" | "police";

// WebRTC 페이로드 — BE(lib.dom 없음)에서도 컴파일되도록 DOM 타입과 구조 동일하게 정의
export interface SessionDescription {
  type: "answer" | "offer" | "pranswer" | "rollback";
  sdp?: string;
}

export interface IceCandidate {
  candidate?: string;
  sdpMLineIndex?: number | null;
  sdpMid?: string | null;
  usernameFragment?: string | null;
}

// ---------- 클라이언트 → 서버 ----------

export interface ClientToServerEvents {
  enterMafia: () => void;
  createRoom: (title: string, gameCategory: string, totalUserCount: number) => void;
  joinRoom: (userId: string, roomId: string, nickname: string) => void;
  fastJoinRoom: (userId: string, nickname: string) => void;
  exitRoom: (roomId: string, userId: string) => void;
  setReady: (userId: string, isReady: boolean) => void;
  gameStart: (roomId: string, playersMaxCount: number) => void;
  usersInfo: (roomId: string) => void;
  updateRoomInfo: (roomId: string) => void;
  voteTo: (votedPlayerId: string) => void;
  voteYesOrNo: (yesOrNo: boolean) => void;
  selectPlayer: (selectedPlayerId: string) => void;

  // WebRTC 시그널링
  mediaReady: (roomId: string, userId: string, nickname: string) => void;
  mediaReadyTo: (roomId: string, targetId: string, senderId: string, senderNickname: string) => void;
  webrtcOffer: (
    roomId: string,
    targetId: string,
    senderId: string,
    senderNickname: string,
    sdp: SessionDescription
  ) => void;
  webrtcAnswer: (roomId: string, targetId: string, senderId: string, sdp: SessionDescription) => void;
  webrtcIce: (roomId: string, targetId: string, senderId: string, candidate: IceCandidate) => void;
}

// ---------- 서버 → 클라이언트 ----------

export interface ServerToClientEvents {
  // 로비 / 방
  enterMafia: (rooms: LobbyRoom[]) => void;
  enterMafiaError: (message: string) => void;
  createRoom: (room: RoomInfo) => void;
  createRoomError: (message: string) => void;
  joinRoom: (roomId: string) => void;
  joinRoomError: (message: string) => void;
  fastJoinRoom: (roomId: string) => void;
  fastJoinRoomError: (message: string) => void;
  exitRoom: () => void;
  exitRoomError: (message: string) => void;
  updateRoomInfo: (roomInfo: RoomInfo) => void;
  updateRoomInfoError: (message: string) => void;
  usersInfo: (players: RoomPlayer[]) => void;
  usersInfoError: (message: string) => void;
  setReady: (userId: string, isReady: boolean) => void;
  setReadyError: (message: string) => void;
  chiefStart: (canStart: boolean) => void;
  canGameStartError: (message: string) => void;

  // 게임 진행
  gameStart: () => void;
  gameStartError: (message: string) => void;
  playError: (roundName: string, message: string) => void;
  playerMediaStatus: (media: MediaStatus) => void;
  showModal: (title: string, timer: number) => void;
  showAllPlayerRole: (roles: PlayerRoles, timer: number) => void;
  timerStatus: (timer: number) => void;
  inSelect: (phase: SelectPhase, timer: number) => void;
  showVoteResult: (voteResult: VoteResult[], timer: number) => void;
  showVoteDeadOrLive: (voteResult: YesOrNoVoteResult, timer: number) => void;
  diedPlayer: (playerId: string | null) => void;
  victoryPlayer: (victoryTeam: VictoryTeam, timer: number) => void;
  voteToError: (message: string) => void;
  voteYesOrNoError: (message: string) => void;
  selectPlayerError: (message: string) => void;

  // WebRTC 시그널링
  mediaReady: (peerId: string, peerNickname: string) => void;
  webrtcOffer: (peerId: string, peerNickname: string, sdp: SessionDescription) => void;
  webrtcAnswer: (peerId: string, sdp: SessionDescription) => void;
  webrtcIce: (peerId: string, candidate: IceCandidate) => void;
}
