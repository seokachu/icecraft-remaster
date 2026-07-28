"use client";

import S from "@/style/mainpage/main.module.css";
import { checkUserLogIn } from "@/utils/supabase/authAPI";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const SnsLogIn = () => {
  const router = useRouter();

  //NOTE - 계정 생성은 DB 트리거(handle_new_user)가 자동 처리 — 세션 확인 후 이동만 한다
  useEffect(() => {
    const confirmLogin = async () => {
      try {
        await checkUserLogIn();
      } catch (error) {
        toast.error("SNS 로그인이 실패했습니다.");
      } finally {
        router.replace("/main");
      }
    };

    confirmLogin();
  }, []);

  return (
    <div className={`${S.loadingTextWrapper} ${S.loadingCommonWrapper}`}>
      <h1 className={S.loading}>
        Loading
        <span className={S.dot1}>.</span>
        <span className={S.dot2}>.</span>
        <span className={S.dot3}>.</span>
      </h1>
      <div className={S.spinner}>
        <div className={S.curvedTopLeft}></div>
        <div className={S.curvedBottomRight}></div>
        <div className={S.curvedTopRight}></div>
        <div className={S.curvedBottomLeft}></div>
        <p className={S.centerCircle}></p>
      </div>
    </div>
  );
};

export default SnsLogIn;
