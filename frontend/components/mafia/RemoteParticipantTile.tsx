import CamCheck from "@/assets/images/cam_check.svg";
import ChiefImage from "@/assets/images/leader.svg";
import PlayerDieImages from "@/assets/images/player_die.svg";
import useClickHandler from "@/hooks/useClickHandler";
import usePlayerNumber from "@/hooks/usePlayerNumber";
import { useChiefPlayer, useDiedPlayer, useGameState } from "@/store/game-store";
import { useActivePlayer, useIsRemoteOverlay, useJobImageState, useReadyPlayers } from "@/store/overlay-store";
import S from "@/style/livekit/livekit.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import PeerVideo from "@/components/mafia/PeerVideo";
import { RemotePeer } from "@/components/mafia/MediaRoom";

const RemoteParticipantTile = ({ peer }: { peer: RemotePeer }) => {
  const [isChief, setIsChief] = useState(false);
  const remotePlayerId = peer.userId;

  //NOTE - global state
  const isGameState = useGameState();
  const diedPlayers = useDiedPlayer();
  const activePlayerId = useActivePlayer();
  const remoteReadyStates = useReadyPlayers();
  const isRemoteOverlay = useIsRemoteOverlay();
  const imageState = useJobImageState();
  const chiefPlayerId = useChiefPlayer();

  //NOTE - custom Hooks
  const { clickHandler } = useClickHandler();
  const playerNumber = usePlayerNumber(remotePlayerId, isGameState);

  const isDiedPlayer = diedPlayers.find((diedPlayer) => diedPlayer === remotePlayerId);

  //NOTE - 게임 시작 전) 실시간 방장 정보 update
  useEffect(() => {
    if (isGameState === "gameReady" && remotePlayerId === chiefPlayerId.chief) {
      setIsChief(true);
    }

    if (isGameState === "gameStart" || isGameState === "gameEnd") {
      setIsChief(false);
    }
  }, [chiefPlayerId, remotePlayerId, isGameState]);

  return (
    <>
      <li
        className={`${S.remoteParticipantOverlay} ${activePlayerId === remotePlayerId ? S.active : ""}`}
        onClick={isRemoteOverlay && !isDiedPlayer ? (e) => clickHandler(e, remotePlayerId) : undefined}
      >
        <PeerVideo
          stream={peer.stream}
          className={`${S.peerVideo} ${S.remoteCam} ${isRemoteOverlay && !isDiedPlayer ? "cursor-pointer" : ""}`}
        />
        <div className={S.remoteChief}>{isChief && <Image src={ChiefImage} alt={remotePlayerId} />}</div>
        {isGameState === "gameStart" && <p className={S.remotePlayerNumber}>{playerNumber}번</p>}
        {!isDiedPlayer ? (
          <div className={`${S.remoteOverlay} ${remoteReadyStates[remotePlayerId] ? S.active : ""}`}>
            <Image src={imageState || CamCheck} alt={remotePlayerId} />
          </div>
        ) : (
          <div className={S.playerDieOverlay}>
            <Image src={PlayerDieImages} alt={remotePlayerId} />
          </div>
        )}
      </li>
    </>
  );
};

export default RemoteParticipantTile;
