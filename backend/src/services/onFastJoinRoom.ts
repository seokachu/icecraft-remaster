import { Namespace, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { fastJoinRoom, getRoomInfo } from "../api/supabase/roomAPI";

export const onFastJoinRoom = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  mafiaIo: Namespace<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("fastJoinRoom", async (userId, nickname) => {
    console.log(`[fastJoinRoom] userId : ${userId}, nickname : ${nickname}`);
    try {
      const roomId = await fastJoinRoom(userId, nickname);
      const roomInfo = await getRoomInfo(roomId);

      socket.join(roomId);
      socket.join(userId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;

      mafiaIo.to(roomId).emit("fastJoinRoom", roomId);
      mafiaIo.emit("updateRoomInfo", roomInfo);
    } catch (error) {
      console.log(`[fastJoinRoomError] ${(error as Error).message}`);
      socket.emit("fastJoinRoomError", (error as Error).message);
    }
  });
};
