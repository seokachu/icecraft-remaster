import { ServerToClientEvents } from "@shared/socket-events";
import { socket } from "@/utils/socket/socket";
import { useEffect } from "react";

//NOTE - 핸들러 객체의 키(이벤트 이름)와 시그니처가 공유 타입으로 컴파일 타임에 검증된다
export type SocketHandlers = Partial<ServerToClientEvents>;

const useSocketOn = (handlers: SocketHandlers) => {
  useEffect(() => {
    const sockets = Object.entries(handlers) as [
      keyof ServerToClientEvents,
      (...args: never[]) => void
    ][];

    sockets.forEach(([eventName, handler]) => {
      socket.on(eventName, handler as never);
    });

    return () => {
      sockets.forEach(([eventName, handler]) => {
        //NOTE - 반드시 등록한 핸들러만 해제한다
        // (핸들러 없이 off하면 같은 이벤트를 듣는 다른 컴포넌트의 리스너까지 제거됨)
        socket.off(eventName, handler as never);
      });
    };
  }, []);
};

export default useSocketOn;
