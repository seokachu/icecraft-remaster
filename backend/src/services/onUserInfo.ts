import { Namespace, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { getUsersInfoInRoom } from "../api/supabase/roomAPI";

export const onUserInfo = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  mafiaIo: Namespace<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("usersInfo", async (roomId) => {
    console.log(`[usersInfo] roomId : ${roomId}`);
    try {
      const usersInfo = await getUsersInfoInRoom(roomId);
      mafiaIo.to(roomId).emit("usersInfo", usersInfo);
    } catch (error) {
      console.log(`[usersInfoError] ${(error as Error).message}`);
      socket.emit("usersInfoError", (error as Error).message);
    }
  });
};
