import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { createRoom } from "../api/supabase/roomAPI";

export const onCreateRoom = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("createRoom", async (title, game_category, total_user_count) => {
    console.log(
      `[createRoom] title : ${title}, game_category : ${game_category}, total_user_count : ${total_user_count}`
    );
    try {
      const room = await createRoom(title, game_category, total_user_count);
      socket.emit("createRoom", room);
    } catch (error) {
      console.log(`[createRoomError] ${(error as Error).message}`);
      socket.emit("createRoomError", (error as Error).message);
    }
  });
};
