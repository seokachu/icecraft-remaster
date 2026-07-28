import CamCheck from "@/assets/images/cam_check.svg";
import ChiefImage from "@/assets/images/leader.svg";
import PlayerDieImage from "@/assets/images/player_die.svg";
import useClickHandler from "@/hooks/useClickHandler";
import usePlayerNumber from "@/hooks/usePlayerNumber";
import { useChiefPlayer, useDiedPlayer, useGameState } from "@/store/game-store";
import { useActivePlayer, useIsLocalOverlay, useReadyPlayers } from "@/store/overlay-store";
import S from "@/style/livekit/livekit.module.css";
import Image from "next/image";
import GameStartButton from "@/components/mafia/GameStartButton";
import PeerVideo from "@/components/mafia/PeerVideo";
import { useMediaRoom } from "@/components/mafia/MediaRoom";
import { useEffect, useState } from "react";

const LocalParticipant = () => {
  const [isChief, setIsChief] = useState(false);

  //NOTE - WebRTC room 정보
  const { userId: localPlayerId, localStream } = useMediaRoom();

  //NOTE - global state
  const isGameState = useGameState();
  const diedPlayers = useDiedPlayer();
  const activePlayerId = useActivePlayer();
  const localReadyState = useReadyPlayers();
  const isLocalOverlay = useIsLocalOverlay();
  const chiefPlayerId = useChiefPlayer();

  //NOTE - custom hooks
  const { clickHandler } = useClickHandler();
  const playerNumber = usePlayerNumber(localPlayerId, isGameState);

  const isDiedPlayer = diedPlayers.find((diedPlayer) => diedPlayer === localPlayerId);

  //NOTE - 게임 시작 전) 실시간 방장 정보 update
  useEffect(() => {
    if (!localPlayerId || !chiefPlayerId) {
      return;
    }

    if (isGameState === "gameReady" && localPlayerId === chiefPlayerId.chief) {
      setIsChief(true);
    }

    if (isGameState === "gameStart" || isGameState === "gameEnd") {
      setIsChief(false);
    }
  }, [chiefPlayerId, isGameState]);

  return (
    <div className={S.localParticipant}>
      <div className={S.playerInfo}>
        <div className={S.chief}>{isChief && <Image src={ChiefImage} alt={localPlayerId} />}</div>
        {isGameState === "gameStart" && <p className={S.playerNumber}>{playerNumber}번</p>}
      </div>
      <div
        className={`${S.participantOverlay} ${S.localVideoBox} ${activePlayerId === localPlayerId ? S.active : ""}`}
        onClick={isLocalOverlay && !isDiedPlayer ? (e) => clickHandler(e, localPlayerId) : undefined}
      >
        <PeerVideo
          stream={localStream}
          muted
          className={`${S.peerVideo} ${S.mirrored} ${isLocalOverlay ? S.localCam : ""}`}
        />
        {!isDiedPlayer ? (
          <div className={`${S.imageOverlay} ${localReadyState[localPlayerId] ? S.active : ""}`}>
            <Image src={CamCheck} alt={localPlayerId} />
          </div>
        ) : (
          <div className={S.playerDieOverlay}>
            <Image src={PlayerDieImage} alt={localPlayerId} />
          </div>
        )}
      </div>
      {isGameState === "gameReady" && <GameStartButton isGameState={isGameState} />}
    </div>
  );
};

export default LocalParticipant;
