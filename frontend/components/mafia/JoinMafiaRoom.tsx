"use client";

import MafiaPlayRooms from "@/components/mafia/MafiaPlayRooms";
import MediaRoomProvider from "@/components/mafia/MediaRoom";
import PeerVideo from "@/components/mafia/PeerVideo";
import useBeforeUnloadHandler from "@/hooks/useBeforeUnloadHandler";
import usePopStateHandler from "@/hooks/usePopStateHandler";
import { useRoomAction } from "@/store/room-store";
import Style from "@/style/commons/commons.module.css";
import S from "@/style/livekit/livekit.module.css";
import { socket } from "@/utils/socket/socket";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import MediaError from "@/assets/images/media_error.svg";
import SorryImage from "@/assets/images/sorry_image.avif";
import Image from "next/image";
import { checkUserLogIn } from "@/utils/supabase/authAPI";

const JoinMafiaRoom = () => {
  const params = useParams();
  const roomId = (Array.isArray(params.id) ? params.id[0] : params.id) ?? "";
  const [userInfo, setUserInfo] = useState({
    userId: "",
    nickname: ""
  });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMediaError, setIsMediaError] = useState(false);
  const [isJoinError, setIsJoinError] = useState(false);
  const [isJoin, setIsJoin] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const isPopState = usePopStateHandler();
  const { setIsReLoad } = useBeforeUnloadHandler();
  const { setIsEntry } = useRoomAction();

  const router = useRouter();

  //NOTE - 뒤로가기 시 작동
  useEffect(() => {
    if (isPopState) {
      socket.emit("exitRoom", roomId, userInfo.userId);
      setIsEntry(false);
    }
  }, [isPopState]);

  //NOTE - 로그인 정보
  useEffect(() => {
    const checkUserInfo = async () => {
      try {
        const loginInfo = await checkUserLogIn();
        if (loginInfo) {
          const nickname = loginInfo.user_metadata.nickname || loginInfo.user_metadata.name;
          setUserInfo({ userId: loginInfo.id, nickname });
        }
      } catch (error) {
        setIsJoinError(true);
      }
    };

    checkUserInfo();
  }, []);

  //NOTE - 카메라/마이크 획득 (미리보기 및 통화에 같은 스트림 사용)
  useEffect(() => {
    let isCancelled = false;

    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (isCancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        setLocalStream(stream);
      } catch (error) {
        setIsMediaError(true);
      }
    };

    getMedia();

    return () => {
      isCancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  //NOTE - 방입장 이벤트
  const joinRoomHandler = () => {
    setIsReLoad(true); //새로고침 팝업창 on, off
    setIsJoin(true); //방 입장
  };

  //NOTE - 에러 이벤트 핸들러(로그인, 방입장 등)
  if (isJoinError) {
    return (
      <section className={Style.mainSection}>
        <Image src={SorryImage} alt="sorry image" />
        <h2>게임 접속에 불편을 드려서 죄송합니다.</h2>
        <h3>
          현재 원활한 게임이 진행되지 않고 있으니, <br />
          다시 접속해 주시기 바랍니다.
        </h3>
        <button
          onClick={() => {
            socket.emit("exitRoom", roomId, userInfo.userId);
            router.back();
            setIsEntry(false);
          }}
        >
          메인페이지로 이동하기
        </button>
      </section>
    );
  }

  //NOTE - 미디어 권한 에러 UI
  if (isMediaError) {
    return (
      <section className={`${Style.mainSection} ${Style.mediaInfoCheck}`}>
        <Image
          className={Style.mediaInfoImage}
          src={MediaError}
          alt="카메라, 마이크를 활성화 시켜주세요"
          width={686}
          height={452}
        />
        <h2 className={Style.mediaError}>게임 접속에 불편을 드려서 죄송합니다.</h2>
        <h3>마이크 및 카메라 권한 설정을 확인 후 진행해 주세요.</h3>
        <button
          onClick={() => {
            socket.emit("exitRoom", roomId, userInfo.userId);
            router.back();
            setIsEntry(false);
          }}
        >
          메인페이지로 이동하기
        </button>
        <div className={Style.settingCheck}>
          <h2>잘못 설정했을 때 진입 시 아래의 사항을 체크해주세요!</h2>
          <ul className={Style.settingCheckList}>
            <li>설정 &gt; 비디오&#47;오디오 설정을 체크</li>
            <li>타 플랫폼 비디오 실행 시 비디오가 활성화 안될 수 있습니다.</li>
            <li>이용 브라우저, 앱 최신 업데이트</li>
            <li>
              <h3>OS 내 카메라&#47;마이크 설정 확인</h3>
              <div>
                <p>
                  Windows 설정 &#62; 개인 정보 및 보안 &#62; 앱 사용 권한 - 카메라&#47;마이크 &#62; 앱에서 액세스하도록
                  허용 &#62; 데스크톱앱이 카메라/마이크에 액세스하도록 허용 &#62; 켬 &#62; 브라우저 새로고침
                </p>
                <p>
                  Mac 설정 &#62; Apple 메뉴 &#62; 시스템 설정 &#62; 개인정보 보호 및 보안 &#62; 화면 기록 선택 &#62;
                  Chrome을 찾고 토글을 켜 화면 기록을 허용
                </p>
              </div>
            </li>
            <li>
              실행 중인 다른 프로그램이 제한하는 경우 &#58; 바이러스 검사 소프트웨어&#40;백신&#41;, 방화벽&#40;VPN&#41;
              등이 이용을 제한할 수 있으니 종료&#47;비활성화 후 진행해 보시길 바랍니다.
            </li>
          </ul>
        </div>
      </section>
    );
  }

  return (
    <main>
      {isJoin && localStream && userInfo.userId ? (
        <MediaRoomProvider
          roomId={roomId}
          userId={userInfo.userId}
          nickname={userInfo.nickname}
          localStream={localStream}
        >
          <MafiaPlayRooms />
        </MediaRoomProvider>
      ) : (
        <section className={S.settingWrapper}>
          <h2>오디오 & 캠 설정 창 입니다.</h2>
          <div className={S.settingCam}>
            <div className={S.previewVideoBox}>
              {localStream ? (
                <PeerVideo stream={localStream} muted className={`${S.peerVideo} ${S.mirrored}`} />
              ) : (
                <p className={S.previewLoading}>카메라 연결 중...</p>
              )}
            </div>
            <div className={S.settingUserButton}>
              <button onClick={joinRoomHandler} disabled={!localStream || !userInfo.userId}>
                입장하기
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default JoinMafiaRoom;
