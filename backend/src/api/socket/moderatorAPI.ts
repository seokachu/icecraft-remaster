import { Namespace } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../../../shared/socket-events";
import {
  AllPlayer,
  MostVotedPlayer,
  RoundStatus,
  VoteBoard,
  YesOrNoVoteResult,
} from "../../../types/index";
import {
  checkAllPlayersReady,
  checkPlayerCountEnough,
  getVoteYesOrNoResult,
  initGame,
} from "../supabase/gamePlayAPI";
import {
  getChief,
  getRoomInfo,
  getUserCountInRoom,
  setRoomIsPlaying,
} from "../supabase/roomAPI";
import { applyGameScores } from "../supabase/rankingAPI";
import { unregisterGame } from "./gameRegistry";

export const canGameStart = async (
  roomId: string,
  mafiaIo: Namespace<ClientToServerEvents, ServerToClientEvents>
) => {
  console.log("게임 진행 가능 확인");
  let canStart = false;
  try {
    const { total_user_count: totalUserCount } = await getUserCountInRoom(
      roomId
    );

    const isAllPlayerEnoughCount = await checkPlayerCountEnough(
      roomId,
      totalUserCount
    );

    console.log("룸 아이디", roomId);
    console.log("총 인원 :", totalUserCount);

    const isAllPlayersReady = await checkAllPlayersReady(
      roomId,
      totalUserCount
    );

    canStart = isAllPlayerEnoughCount && isAllPlayersReady;

    console.log(
      "인원 충분 : ",
      isAllPlayerEnoughCount,
      "전부 레디 : ",
      isAllPlayersReady
    );

    const chief = await getChief(roomId);

    console.log(`[chiefStart] ${chief} ${canStart}`);

    mafiaIo.to(chief).emit("chiefStart", canStart);
  } catch (error) {
    console.log(`[canGameStartError] ${(error as Error).message}`);
    mafiaIo.to(roomId).emit("canGameStartError", (error as Error).message);
  }
};

export const shufflePlayers = (allPlayers: AllPlayer[] | VoteBoard[]) => {
  for (let i = allPlayers.length - 1; i >= 0; i--) {
    let j = Math.floor(Math.random() * (i + 1));
    [allPlayers[i], allPlayers[j]] = [allPlayers[j], allPlayers[i]];
  }
  return allPlayers;
};

export const getMostVotedPlayer = (
  voteBoard: VoteBoard[],
  exceptedMafia: boolean
): MostVotedPlayer => {
  const isValid = voteBoard[0].voted_count !== voteBoard[1].voted_count;

  if (isValid) {
    return { isValid, result: voteBoard[0] };
  } else {
    voteBoard = voteBoard.filter((vote) => vote.is_lived === true);

    if (exceptedMafia) {
      voteBoard = voteBoard.filter((vote) => vote.role !== "마피아");
    }

    const shuffledPlayers = shufflePlayers(voteBoard);

    return { isValid, result: shuffledPlayers[0] };
  }
};

export const getYesOrNoVoteResult = async (
  roomId: string
): Promise<YesOrNoVoteResult> => {
  const voteResult = await getVoteYesOrNoResult(roomId);
  let yesCount = 0;
  let noCount = 0;

  voteResult.forEach((vote) => {
    if (vote === true) {
      yesCount++;
    } else if (vote === false) {
      noCount++;
    }
  });

  return {
    result: yesCount > noCount,
    detail: { yesCount, noCount },
  };
};

export const whoWins = (allPlayers: AllPlayer[]) => {
  const mafiaPlayers = allPlayers
    .filter((player) => player.is_lived === true)
    .filter((player) => player.role === "마피아");
  const citizenPlayers = allPlayers
    .filter((player) => player.is_lived === true)
    .filter((player) => player.role !== "마피아");
  let mafiaCount;
  let citizenCount;

  mafiaPlayers.length > 0
    ? (mafiaCount = mafiaPlayers.length)
    : (mafiaCount = 0);

  citizenPlayers.length > 0
    ? (citizenCount = citizenPlayers.length)
    : (citizenCount = 0);

  if (mafiaCount === 0) {
    return { isValid: true, result: "시민" };
  }

  if (mafiaCount >= citizenCount) {
    return { isValid: true, result: "마피아" };
  }

  return { isValid: false };
};

// 3~6인 지원 (WebRTC mesh 구조상 인원 상한 6명), 반환 순서: [마피아, 경찰, 의사]
export const getRoleMaxCount = (totalCount: number) => {
  switch (totalCount) {
    case 3:
      return [1, 0, 0];
    case 4:
      return [1, 1, 0];
    case 5:
      return [1, 1, 1];
    case 6:
      return [2, 1, 1];
  }
  return [0, 0, 0];
};

export const playError = async (
  roundName: string,
  roomId: string,
  mafiaIo: Namespace<ClientToServerEvents, ServerToClientEvents>,
  error: Error,
  start: NodeJS.Timeout | null,
  roundStatus: RoundStatus
) => {
  if (roundName != roundStatus.INIT) {
    await initGame(roomId);
  }

  await setRoomIsPlaying(roomId, false);

  mafiaIo.to(roomId).emit("playError", roundName, error.message);
  if (start) {
    clearInterval(start);
  }
  unregisterGame(roomId);
};

export const gameOver = async (
  mafiaIo: Namespace<ClientToServerEvents, ServerToClientEvents>,
  roomId: string,
  roundName: string,
  allPlayers: AllPlayer[],
  start: NodeJS.Timeout,
  roundStatus: RoundStatus
) => {
  if (
    roundName === roundStatus.INIT ||
    roundName === roundStatus.R0_0 ||
    roundName === roundStatus.R0_1 ||
    roundName === roundStatus.R0_2
  ) {
    return roundName;
  }

  const gameResult = whoWins(allPlayers);
  const time = 5;

  if (gameResult.isValid) {
    if (gameResult.result === "시민") {
      mafiaIo.to(roomId).emit("victoryPlayer", "Citizen", time);
    } else if (gameResult.result === "마피아") {
      mafiaIo.to(roomId).emit("victoryPlayer", "Mafia", time);
    }
    roundName = roundStatus.GAME_END;

    //NOTE - 랭킹 점수는 서버가 일괄 갱신 (클라이언트 조작 차단)
    try {
      await applyGameScores(allPlayers, gameResult.result!);
    } catch (error) {
      console.log(`[applyGameScoresError] ${(error as Error).message}`);
    }

    await initGame(roomId);
    await setRoomIsPlaying(roomId, false);

    const roomInfo = await getRoomInfo(roomId);
    mafiaIo.emit("updateRoomInfo", roomInfo);

    clearInterval(start);
    unregisterGame(roomId);
  }
  return roundName;
};
