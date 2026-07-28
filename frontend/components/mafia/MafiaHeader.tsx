import MoonIcon from "@/assets/images/moon.svg";
import SunIcon from "@/assets/images/sun.svg";
import SpeakTimer from "@/components/mafia/SpeakTimer";
import { useMediaRoom } from "@/components/mafia/MediaRoom";
import { useGameState, useIsDay } from "@/store/game-store";
import { useRoomAction } from "@/store/room-store";
import S from "@/style/livekit/livekit.module.css";
import { socket } from "@/utils/socket/socket";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MafiaHeader = () => {
  //NOTE - WebRTC room 정보
  const { roomId, userId, localStream } = useMediaRoom();

  //NOTE - global state
  const isGameState = useGameState();
  const isDay = useIsDay();
  const { setIsEntry } = useRoomAction();

  const [morning, setMorning] = useState(false);
  const [night, setNight] = useState(false);
  const router = useRouter();

  //NOTE - 게임 입장 및 종료 시
  useEffect(() => {
    if (isGameState === "gameReady" || isGameState === "gameEnd") {
      setMorning(false);
      setNight(false);
    }
  }, [isGameState]);

  //NOTE - 방 나가기 이벤트 헨들러
  const leaveRoom = () => {
    socket.emit("exitRoom", roomId, userId);
    router.back();
    setIsEntry(false);
  };

  //NOTE - 게임 중 카메라/마이크가 꺼지면(기기 분리, 권한 회수) 강제퇴장
  useEffect(() => {
    const forceExit = () => {
      socket.emit("exitRoom", roomId, userId);
      router.back();
      setIsEntry(false);
    };

    const tracks = localStream.getTracks();
    tracks.forEach((track) => track.addEventListener("ended", forceExit));

    return () => {
      tracks.forEach((track) => track.removeEventListener("ended", forceExit));
    };
  }, [localStream, roomId, userId]);

  //NOTE - 밤, 낮 배경
  useEffect(() => {
    if (isDay === "낮") {
      setMorning(true);
      setNight(false);
      return;
    }

    if (isDay === "밤") {
      setNight(true);
      setMorning(false);
    }
  }, [isDay]);

  //NOTE -  테마
  const dayTime = morning ? S.day : "";
  const nightTime = night ? S.night : "";
  const resultClassName = `${dayTime} ${nightTime}`;

  return (
    <div className={`${S.roomBackground} ${resultClassName}`}>
      <div className={S.goToMainPage}>
        <button onClick={leaveRoom}>
          <span>＜</span> 방 나가기
        </button>
      </div>
      {isGameState === "gameStart" && (
        <div className={S.gameTimer}>
          <SpeakTimer />
          <p className={S.dayAndNight}>
            <span className={S.sun}>{morning && <Image src={SunIcon} className={S.sunImage} alt="sun icon" />}</span>
            <span className={S.moon}>{night && <Image src={MoonIcon} className={S.moonImage} alt="moon icon" />}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MafiaHeader;
