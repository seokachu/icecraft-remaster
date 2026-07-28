import { Namespace, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { setReady } from "../api/supabase/gamePlayAPI";
import { canGameStart } from "../api/socket/moderatorAPI";

export const onSetReady = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>,
  mafiaIo: Namespace<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("setReady", async (userId, ready) => {
    console.log(`[setReady] userId : ${userId}, ready : ${ready}`);
    try {
      await setReady(userId, ready);

      const roomId = socket.data.roomId;
      mafiaIo.to(roomId).emit("setReady", userId, ready);
      await canGameStart(roomId, mafiaIo);
    } catch (error) {
      console.log(`[setReadyError] ${(error as Error).message}`);
      socket.emit("setReadyError", (error as Error).message);
    }
  });
};
