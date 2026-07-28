import { MediaStatus } from "@/types";
import { useMediaRoom } from "@/components/mafia/MediaRoom";
import { useEffect, useState } from "react";

//NOTE - playersMedias 구조: {userId: {camera: boolean, mike: boolean}}
//NOTE - 자신의 미디어는 송출 트랙을, 상대의 미디어는 수신 트랙의 로컬 재생을 끄고 켠다
const useMediaDevice = () => {
  const [playersMediaStatus, setPlayersMediaStatus] = useState<MediaStatus | null>(null);
  const [isMediaReset, setIsMediaReset] = useState(false);

  const { userId: localPlayerId, localStream, remotePeers } = useMediaRoom();

  //NOTE - 미디어 관리
  useEffect(() => {
    //Type 좁히기: "playersMediaStatus": MediaStatus | null
    if (!playersMediaStatus) {
      return;
    }

    const userIdList = Object.keys(playersMediaStatus);

    userIdList.forEach((playerId) => {
      const isMedia = playersMediaStatus[playerId];

      //NOTE - 로컬 사용자의 미디어 (송출 자체를 on/off)
      if (localPlayerId === playerId) {
        localStream.getVideoTracks().forEach((track) => (track.enabled = isMedia.camera));
        localStream.getAudioTracks().forEach((track) => (track.enabled = isMedia.mike));
      }

      //NOTE - 원격 사용자들의 미디어 (내 화면에서의 재생을 on/off)
      if (localPlayerId !== playerId) {
        const remotePeer = remotePeers.find((peer) => peer.userId === playerId);

        if (!remotePeer) {
          return;
        }

        remotePeer.stream.getVideoTracks().forEach((track) => (track.enabled = isMedia.camera));
        remotePeer.stream.getAudioTracks().forEach((track) => (track.enabled = isMedia.mike));
      }
    });
  }, [playersMediaStatus, remotePeers]);

  //NOTE - 게임 종료 시 모든 player 캠 및 오디오 on
  useEffect(() => {
    if (isMediaReset) {
      localStream.getTracks().forEach((track) => (track.enabled = true));

      remotePeers.forEach((peer) => {
        peer.stream.getTracks().forEach((track) => (track.enabled = true));
      });

      //초기화
      setIsMediaReset(false);
    }
  }, [isMediaReset]);

  return { setIsMediaReset, setPlayersMediaStatus };
};

export default useMediaDevice;
