import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { selectPlayer } from "../api/supabase/gamePlayAPI";

export const onSelectPlayer = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("selectPlayer", async (selectedPlayer) => {
    console.log(
      `[selectedPlayer] 의사에 의해 선택받은 플레이어 : ${selectedPlayer}`
    );
    try {
      await selectPlayer(selectedPlayer);
    } catch (error) {
      console.log(`[selectPlayerError] ${(error as Error).message}`);
      socket.emit("selectPlayerError", (error as Error).message);
    }
  });
};
