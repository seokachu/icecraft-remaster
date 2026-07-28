import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { getRooms } from "../api/supabase/roomAPI";

export const onEnterMafia = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("enterMafia", async () => {
    console.log("[enterMafia]");
    try {
      const rooms = await getRooms();
      socket.emit("enterMafia", rooms);
    } catch (error) {
      console.log(`[enterMafiaError] ${(error as Error).message}`);
      socket.emit("enterMafiaError", (error as Error).message);
    }
  });
};
