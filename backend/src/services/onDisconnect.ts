import { Namespace, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { exitRoom, getRoomInfo } from "../api/supabase/roomAPI";

export const onDisconnect = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  mafiaIo: Namespace<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("disconnect", async () => {
    console.log("클라이언트와의 연결이 끊겼습니다.");
    try {
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;

      if (!roomId) {
        console.log("[exitRoom] 방에서 나가는 경우가 아닙니다.");
        return;
      }

      const roomInfo = await getRoomInfo(roomId);

      console.log(`[exitRoom] roomId : ${roomId}, userId : ${userId}`);

      await exitRoom(roomId, userId);

      socket.leave(userId);
      socket.leave(roomId);
      socket.data.userId = null;
      socket.data.roomId = null;

      mafiaIo.to(roomId).emit("exitRoom");
      mafiaIo.emit("updateRoomInfo", roomInfo);
    } catch (error) {
      console.log(`[exitRoomError] ${(error as Error).message}`);
    }
  });
};
