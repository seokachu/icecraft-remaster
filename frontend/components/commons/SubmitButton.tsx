import React from "react";
import S from "@/style/commons/commons.module.css";

export const SubmitButton = ({ children, disabled = false }: { children: React.ReactNode; disabled?: boolean }) => {
  return (
    <button type="submit" className={S.submitButton} disabled={disabled}>
      {children}
    </button>
  );
};
