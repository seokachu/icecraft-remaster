"use client";

import { useRoomPlayers } from "@/store/players-store";
import { socket } from "@/utils/socket/socket";
import { rtcConfig } from "@/utils/webrtc/rtcConfig";
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

export interface RemotePeer {
  userId: string;
  nickname: string;
  stream: MediaStream;
}

interface MediaRoomValue {
  roomId: string;
  userId: string;
  nickname: string;
  localStream: MediaStream;
  remotePeers: RemotePeer[];
}

const MediaRoomContext = createContext<MediaRoomValue | null>(null);

export const useMediaRoom = () => {
  const context = useContext(MediaRoomContext);
  if (!context) {
    throw new Error("useMediaRoom은 MediaRoomProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
};

interface MediaRoomProviderProps {
  roomId: string;
  userId: string;
  nickname: string;
  localStream: MediaStream;
  children: ReactNode;
}

/**
 * WebRTC mesh 연결 관리자
 * - 시그널링은 기존 Socket.IO 서버(/mafia)를 릴레이로 사용
 * - 입장 시 mediaReady를 방에 브로드캐스트하면 기존 참가자들이 offer를 보낸다
 * - 동시 입장 충돌(glare) 방지: userId 사전순으로 작은 쪽만 offer를 개시
 */
const MediaRoomProvider = ({ roomId, userId, nickname, localStream, children }: MediaRoomProviderProps) => {
  const [remotePeers, setRemotePeers] = useState<RemotePeer[]>([]);
  const pcsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingIceRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const players = useRoomPlayers();

  const closePeer = useCallback((peerId: string) => {
    const pc = pcsRef.current.get(peerId);
    if (pc) {
      pc.onicecandidate = null;
      pc.ontrack = null;
      pc.onconnectionstatechange = null;
      pc.close();
    }
    pcsRef.current.delete(peerId);
    pendingIceRef.current.delete(peerId);
    setRemotePeers((prev) => prev.filter((peer) => peer.userId !== peerId));
  }, []);

  useEffect(() => {
    const createPeer = (peerId: string, peerNickname: string) => {
      closePeer(peerId);
      const pc = new RTCPeerConnection(rtcConfig);

      localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtcIce", roomId, peerId, userId, event.candidate.toJSON());
        }
      };

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (!stream) {
          return;
        }
        setRemotePeers((prev) => {
          const rest = prev.filter((peer) => peer.userId !== peerId);
          return [...rest, { userId: peerId, nickname: peerNickname, stream }];
        });
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === "failed" || pc.connectionState === "closed") {
          closePeer(peerId);
        }
      };

      pcsRef.current.set(peerId, pc);
      return pc;
    };

    const flushPendingIce = async (peerId: string, pc: RTCPeerConnection) => {
      const pending = pendingIceRef.current.get(peerId) ?? [];
      pendingIceRef.current.delete(peerId);
      for (const candidate of pending) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (error) {
          console.error("[webrtc] ICE candidate 적용 실패", error);
        }
      }
    };

    //NOTE - 상대의 미디어 준비 완료 알림 → 사전순으로 작은 쪽만 offer 개시
    const onMediaReady = async (peerId: string, peerNickname: string) => {
      if (peerId === userId || pcsRef.current.has(peerId)) {
        return;
      }
      try {
        if (userId < peerId) {
          const pc = createPeer(peerId, peerNickname);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit("webrtcOffer", roomId, peerId, userId, nickname, offer);
        } else {
          //NOTE - 내 mediaReady를 이 상대에게 다시 알려 상대(작은 쪽)가 offer를 보내게 한다
          socket.emit("mediaReadyTo", roomId, peerId, userId, nickname);
        }
      } catch (error) {
        console.error("[webrtc] offer 생성 실패", error);
      }
    };

    const onOffer = async (peerId: string, peerNickname: string, sdp: RTCSessionDescriptionInit) => {
      try {
        const pc = createPeer(peerId, peerNickname);
        await pc.setRemoteDescription(sdp);
        await flushPendingIce(peerId, pc);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtcAnswer", roomId, peerId, userId, answer);
      } catch (error) {
        console.error("[webrtc] answer 생성 실패", error);
      }
    };

    const onAnswer = async (peerId: string, sdp: RTCSessionDescriptionInit) => {
      const pc = pcsRef.current.get(peerId);
      if (!pc) {
        return;
      }
      try {
        await pc.setRemoteDescription(sdp);
        await flushPendingIce(peerId, pc);
      } catch (error) {
        console.error("[webrtc] answer 적용 실패", error);
      }
    };

    const onIce = async (peerId: string, candidate: RTCIceCandidateInit) => {
      const pc = pcsRef.current.get(peerId);
      if (pc && pc.remoteDescription) {
        try {
          await pc.addIceCandidate(candidate);
        } catch (error) {
          console.error("[webrtc] ICE candidate 적용 실패", error);
        }
      } else {
        const pending = pendingIceRef.current.get(peerId) ?? [];
        pending.push(candidate);
        pendingIceRef.current.set(peerId, pending);
      }
    };

    //NOTE - 누군가 방을 나가면 최신 명단을 다시 요청 (아래 명단 동기화 effect가 연결을 정리)
    const onSomeoneExit = () => {
      socket.emit("usersInfo", roomId);
    };

    socket.on("mediaReady", onMediaReady);
    socket.on("webrtcOffer", onOffer);
    socket.on("webrtcAnswer", onAnswer);
    socket.on("webrtcIce", onIce);
    socket.on("exitRoom", onSomeoneExit);

    socket.emit("mediaReady", roomId, userId, nickname);

    return () => {
      socket.off("mediaReady", onMediaReady);
      socket.off("webrtcOffer", onOffer);
      socket.off("webrtcAnswer", onAnswer);
      socket.off("webrtcIce", onIce);
      socket.off("exitRoom", onSomeoneExit);
      Array.from(pcsRef.current.keys()).forEach(closePeer);
    };
  }, [roomId, userId, nickname, localStream, closePeer]);

  //NOTE - DB 명단과 동기화: 명단에서 사라진 상대의 연결 정리
  useEffect(() => {
    if (players.length === 0) {
      return;
    }
    const playerIds = new Set(players.map((player) => player.user_id));
    Array.from(pcsRef.current.keys()).forEach((peerId) => {
      if (!playerIds.has(peerId)) {
        closePeer(peerId);
      }
    });
  }, [players, closePeer]);

  return (
    <MediaRoomContext.Provider value={{ roomId, userId, nickname, localStream, remotePeers }}>
      {children}
    </MediaRoomContext.Provider>
  );
};

export default MediaRoomProvider;
