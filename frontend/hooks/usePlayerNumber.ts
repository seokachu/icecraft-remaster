import getPlayersNumber from "@/utils/mafia/getPlayersNumber";
import { useRoomPlayers } from "@/store/players-store";
import { useEffect, useState } from "react";

const usePlayerNumber = (userId: string, isGameState: string) => {
  const players = useRoomPlayers();
  const [playerNumber, setPlayerNumber] = useState<number | null>(null);

  useEffect(() => {
    if (!userId || !isGameState) {
      return;
    }

    if (isGameState === "gameStart") {
      const allPlayers = getPlayersNumber(players);
      const playerNumber = allPlayers.find((player) => player.playerId === userId);

      if (playerNumber) {
        setPlayerNumber(playerNumber.number);
      }
    }
  }, [isGameState, players]);

  return playerNumber;
};

export default usePlayerNumber;
