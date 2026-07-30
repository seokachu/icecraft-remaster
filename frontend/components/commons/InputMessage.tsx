import React from "react";
import S from "@/style/commons/commons.module.css";

const SUCCESS_MESSAGES = ["사용 가능한 이메일입니다.", "사용 가능한 닉네임입니다."];

export const InputMessage = ({ text, id }: { text: string; id?: string }) => {
  const color = SUCCESS_MESSAGES.includes(text) ? "success" : "error";

  return (
    <p id={id} className={S[color]}>
      {text}
    </p>
  );
};
