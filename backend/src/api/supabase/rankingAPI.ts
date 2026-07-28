import { supabase } from "./client";
import { AllPlayer } from "../../../types/index";

// 게임 종료 시 서버가 전체 플레이어의 랭킹 점수를 갱신한다.
// (클라이언트가 자기 점수를 직접 update하던 구조는 조작 가능해 제거)
export const applyGameScores = async (
  allPlayers: AllPlayer[],
  winnerRole: string
) => {
  for (const player of allPlayers) {
    const isWinner =
      winnerRole === "마피아"
        ? player.role === "마피아"
        : player.role !== "마피아";
    const delta = isWinner ? 100 : 20;

    const { data, error } = await supabase
      .from("account_table")
      .select("mafia_score, music_score")
      .eq("user_id", player.user_id)
      .single();

    if (error || !data) {
      console.log(
        `[applyGameScoresError] ${player.user_id} 점수 조회 실패: ${error?.message}`
      );
      continue;
    }

    const mafia_score = data.mafia_score + delta;
    const { error: updateError } = await supabase
      .from("account_table")
      .update({ mafia_score, total_score: mafia_score + data.music_score })
      .eq("user_id", player.user_id);

    if (updateError) {
      console.log(
        `[applyGameScoresError] ${player.user_id} 점수 갱신 실패: ${updateError.message}`
      );
    }
  }
};
