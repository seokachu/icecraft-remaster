import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const getUsersRanking = async () => {
  const { data, error } = await supabase.from("account_table").select("*").order("total_score", { ascending: false });

  if (error) {
    throw new Error("유저들의 랭킹 정보를 불러오는데 실패했습니다.");
  }

  return data;
};

//NOTE - 점수 갱신은 게임 종료 시 백엔드가 service_role로 일괄 수행한다 (클라이언트 조작 차단)
