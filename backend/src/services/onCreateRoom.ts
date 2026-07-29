import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { MIN_PLAYERS, MAX_PLAYERS } from "../../../shared/constants";
import { createRoom } from "../api/supabase/roomAPI";

export const onCreateRoom = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("createRoom", async (title, game_category, total_user_count) => {
    console.log(
      `[createRoom] title : ${title}, game_category : ${game_category}, total_user_count : ${total_user_count}`
    );
    if (
      !Number.isInteger(total_user_count) ||
      total_user_count < MIN_PLAYERS ||
      total_user_count > MAX_PLAYERS
    ) {
      socket.emit(
        "createRoomError",
        `인원수는 ${MIN_PLAYERS}명부터 ${MAX_PLAYERS}명까지 가능합니다.`
      );
      return;
    }
    try {
      const room = await createRoom(title, game_category, total_user_count);
      socket.emit("createRoom", room);
    } catch (error) {
      console.log(`[createRoomError] ${(error as Error).message}`);
      socket.emit("createRoomError", (error as Error).message);
    }
  });
};
