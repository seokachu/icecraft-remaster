import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { voteTo } from "../api/supabase/gamePlayAPI";

export const onVoteTo = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("voteTo", async (votedPlayer) => {
    console.log(`[voteTo] 투표 대상 : ${votedPlayer}`);
    try {
      await voteTo(votedPlayer, new Date());
    } catch (error) {
      console.log(`[voteToError] ${(error as Error).message}`);
      socket.emit("voteToError", (error as Error).message);
    }
  });
};
