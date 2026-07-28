import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

/**
 * WebRTC mesh 시그널링 릴레이
 * - 각 소켓은 join 시 자신의 userId room에 들어가 있으므로 userId로 개인 타겟팅이 가능하다.
 * - mediaReady: 미디어 준비 완료를 방 전체에 알림 (offer 개시 트리거)
 * - mediaReadyTo: 동시 입장 시 tie-breaker 용 — 특정 상대에게만 mediaReady를 재전달
 * - webrtcOffer / webrtcAnswer / webrtcIce: SDP·ICE를 상대에게 그대로 릴레이
 */
export const onWebRTCSignal = (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  socket.on("mediaReady", (roomId, userId, nickname) => {
    socket.to(roomId).emit("mediaReady", userId, nickname);
  });

  socket.on("mediaReadyTo", (roomId, targetId, senderId, senderNickname) => {
    socket.to(targetId).emit("mediaReady", senderId, senderNickname);
  });

  socket.on("webrtcOffer", (roomId, targetId, senderId, senderNickname, sdp) => {
    socket.to(targetId).emit("webrtcOffer", senderId, senderNickname, sdp);
  });

  socket.on("webrtcAnswer", (roomId, targetId, senderId, sdp) => {
    socket.to(targetId).emit("webrtcAnswer", senderId, sdp);
  });

  socket.on("webrtcIce", (roomId, targetId, senderId, candidate) => {
    socket.to(targetId).emit("webrtcIce", senderId, candidate);
  });
};
