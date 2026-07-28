import useMediaDevice from "@/hooks/useMediaDevice";
import useSelectSocket from "@/hooks/useSelectSocket";
import useSocketOn from "@/hooks/useSocketOn";
import { pretendard } from "@/public/fonts/fonts";
import { useGameActions, useGameState } from "@/store/game-store";
import { useOverLayActions } from "@/store/overlay-store";
import { usePlayersActions } from "@/store/players-store";
import { useModalActions } from "@/store/show-modal-store";
import S from "@/style/livekit/livekit.module.css";
import { MediaStatus, playersInfo } from "@/types";

import { Tables } from "@/types/supabase";
import { socket } from "@/utils/socket/socket";
import { useEffect } from "react";
import LocalParticipant from "@/components/mafia/LocalParticipant";
import MafiaHeader from "@/components/mafia/MafiaHeader";
import MafiaModals from "@/components/mafia/MafiaModals";
import MafiaToolTip from "@/components/mafia/MafiaToolTip";
import RemoteParticipant from "@/components/mafia/RemoteParticipant";
import { useMediaRoom } from "@/components/mafia/MediaRoom";

const MafiaPlayRooms = () => {
  //NOTE - WebRTC room 정보
  const { roomId, userId } = useMediaRoom();

  //NOTE - global state
  const isGameState = useGameState();
  const { setPresentRoomId, setChiefPlayerId, setDiedPlayer, setIsGameState, setGameReset } = useGameActions();
  const { setReadyPlayers, setOverlayReset } = useOverLayActions();
  const { setPlayers, setPlayersReset } = usePlayersActions();
  const { setModalReset } = useModalActions();

  //NOTE - custom Hooks
  useSelectSocket(userId);

  const { setIsMediaReset, setPlayersMediaStatus } = useMediaDevice(); // 카메라 및 오디오 처리

  // // NOTE - 방 입장 시 초기화
  useEffect(() => {
    setOverlayReset(); //Local,Remote 클릭 이벤트 및 캠 이미지 초기화
    setModalReset(); //전체 모달 요소 초기화
    setGameReset(); // 죽은 players 및 게임 state 초기화
    setPlayersReset(); // 방 명단 초기화
  }, []);

  //NOTE - 방 입장 시 방의 정보를 불러온다.
  useEffect(() => {
    setPresentRoomId(roomId);
    socket.emit("updateRoomInfo", roomId);
    socket.emit("usersInfo", roomId);
  }, [roomId]);

  const sockets = {
    //NOTE - 전체 players의 실시간 Ready 상태
    setReady: (playerId: string, isReady: boolean) => {
      setReadyPlayers(playerId, isReady);
    },
    //NOTE - 게임 시작
    gameStart: () => {
      setIsGameState("gameStart");
      setOverlayReset(); //local, remote "Ready" 이미지 초기화
    },
    //NOTE - players 미디어 관리
    playerMediaStatus: (playersMedias: MediaStatus) => {
      setPlayersMediaStatus(playersMedias);
    },
    //NOTE - 죽은 player 관리 (의사가 살리면 null이 올 수 있음)
    diedPlayer: (playerId: string | null) => {
      if (playerId) {
        setDiedPlayer(playerId);
      }
    },
    //NOTE - 방에 대한 정보
    updateRoomInfo: (roomInfo: Tables<"room_table">) => {
      if (roomInfo.chief) {
        setChiefPlayerId({ chief: roomInfo.chief, roomId: roomInfo.room_id });
      }
    },
    //NOTE - players의 초기 Ready 상태 및 방 명단
    usersInfo: (players: playersInfo[]) => {
      setPlayers(players);
      players.forEach((player) => {
        setReadyPlayers(player.user_id, player.is_ready);
      });
    },
    //NOTE - Error 처리
    playError: () => {
      setOverlayReset(); //Local,Remote 클릭 이벤트 및 캠 이미지 초기화
      setModalReset(); //전체 모달 요소 초기화
      setGameReset(); // 죽은 players 및 게임 state 초기화
      setIsMediaReset(true); // 캠 및 오디오 초기화
    }
  };
  useSocketOn(sockets);

  //NOTE - 게임 종료 시 UI 초기화 (랭킹 점수는 서버가 갱신)
  useEffect(() => {
    if (isGameState === "gameEnd") {
      setOverlayReset(); //Local,Remote 클릭 이벤트 및 캠 이미지 초기화
      setModalReset(); //전체 모달 요소 초기화
      setGameReset(); // 죽은 players 및 게임 state 초기화
      setIsMediaReset(true); // 캠 및 오디오 초기화
    }
  }, [isGameState]);

  return (
    <section className={`${S.mafiaPlayRoomWrapper} ${pretendard.className}`}>
      <div className={S.goToMainPage}></div>

      <MafiaHeader />
      <div className={S.mafiaPlayRoomSection}>
        <LocalParticipant />
        <RemoteParticipant />
        <MafiaToolTip />
        <MafiaModals />
      </div>
    </section>
  );
};

export default MafiaPlayRooms;
