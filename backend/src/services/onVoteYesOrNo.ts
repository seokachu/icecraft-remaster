import { Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../shared/socket-events";
import { voteYesOrNo } from "../api/supabase/gamePlayAPI";

export const onVoteYesOrNo = async (
  socket: Socket<ClientToServerEvents, ServerToClientEvents>
) => {
  socket.on("voteYesOrNo", async (yesOrNo) => {
    console.log(`[voteYesOrNo] 찬성/반대 : ${yesOrNo}`);
    const userId = socket.data.userId;

    try {
      await voteYesOrNo(userId, yesOrNo);
    } catch (error) {
      console.log(`[voteYesOrNoError] ${(error as Error).message}`);
      socket.emit("voteYesOrNoError", (error as Error).message);
    }
  });
};
