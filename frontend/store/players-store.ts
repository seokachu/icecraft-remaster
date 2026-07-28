import { create } from "zustand";
import { playersInfo } from "@/types";

interface PlayersState {
  players: playersInfo[];

  actions: {
    setPlayers: (players: playersInfo[]) => void;
    setPlayersReset: () => void;
  };
}

//NOTE - 방 안의 전체 player 명단 (usersInfo 소켓 이벤트로 갱신, DB 기반이라 모든 클라이언트에서 동일)
const usePlayersStore = create<PlayersState>((set) => ({
  players: [],

  actions: {
    setPlayers: (players: playersInfo[]) => set({ players }),
    setPlayersReset: () => set({ players: [] })
  }
}));

export const useRoomPlayers = () => usePlayersStore((state) => state.players);
export const usePlayersActions = () => usePlayersStore((state) => state.actions);
