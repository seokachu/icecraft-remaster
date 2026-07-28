import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;

// 게임 마스터 권한(service_role)이 기본. RLS가 켜진 뒤에는 anon key로 동작 불가.
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "[supabase] SUPABASE_SERVICE_ROLE_KEY가 없어 anon key로 동작 중 — RLS 활성화 시 게임이 멈춥니다."
  );
}

export const supabase = createClient(supabaseUrl!, supabaseKey!);
