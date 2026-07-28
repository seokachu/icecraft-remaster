import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { getRoomInfo } from "../api/supabase/roomAPI";

export const onUpdateRoomInfo = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("updateRoomInfo", async (roomId) => {
    console.log(`[updateRoomInfo] roomId : ${roomId}`);
    try {
      const roomInfo = await getRoomInfo(roomId);
      socket.emit("updateRoomInfo", roomInfo);
    } catch (error) {
      console.log(`[updateRoomInfoError] ${(error as Error).message}`);
      socket.emit("updateRoomInfoError", (error as Error).message);
    }
  });
};
