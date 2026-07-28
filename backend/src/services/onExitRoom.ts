import { Namespace, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { exitRoom, getRoomInfo } from "../api/supabase/roomAPI";

export const onExitRoom = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  mafiaIo: Namespace<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("exitRoom", async (roomId, userId) => {
    console.log(`[exitRoom] roomId : ${roomId}, userId : ${userId}`);
    try {
      await exitRoom(roomId, userId);
      const roomInfo = await getRoomInfo(roomId);

      socket.data.userId = null;
      socket.data.roomId = null;
      socket.leave(userId);
      socket.leave(roomId);

      mafiaIo.to(roomId).emit("exitRoom");
      mafiaIo.emit("updateRoomInfo", roomInfo);
    } catch (error) {
      console.log(`[exitRoomError] ${(error as Error).message}`);
      socket.emit("exitRoomError", (error as Error).message);
    }
  });
};
