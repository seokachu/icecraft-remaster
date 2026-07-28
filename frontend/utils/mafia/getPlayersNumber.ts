import { playersInfo } from "@/types";

//NOTE - DB의 join_time 기준 정렬이라 모든 클라이언트에서 동일한 번호가 보장된다
const getPlayersNumber = (players: playersInfo[]) => {
  // NOTE - 입장 시간 및 id 순서로 정렬
  const sortedPlayers = [...players].sort((a, b) => {
    // 존재 하지 않을 시 제자리
    if (!a.join_time || !b.join_time) {
      return 0;
    }
    if (a.join_time === b.join_time) {
      return a.user_id.localeCompare(b.user_id);
    }
    return new Date(a.join_time).getTime() - new Date(b.join_time).getTime();
  });
  // NOTE - gamePlayers: {playerId, playerName, playerJoinAt, playerNumber}
  const gamePlayers = sortedPlayers.map((player, index) => ({
    playerId: player.user_id,
    playerName: player.user_nickname,
    playerJoinAt: player.join_time,
    number: index + 1
  }));
  return gamePlayers;
};
export default getPlayersNumber;
