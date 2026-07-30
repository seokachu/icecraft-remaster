"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { emailLogIn, oAuthLogIn } from "@/utils/supabase/authAPI";
import S from "@/style/login/login.module.css";
import Link from "next/link";
import Image from "next/image";
import KakaoLoginIcon from "@/assets/images/join_kakaotalk.svg";
import GoogleLoginIcon from "@/assets/images/join_google.svg";
import Logo from "@/assets/images/logo.svg";
import ErrorMessage from "@/components/logIn/ErrorMessage";
import { InputMessage } from "@/components/commons/InputMessage";
import { useCookies } from "react-cookie";

const validateEmail = (email: string) => {
  if (email.trim().length === 0) {
    return "이메일을 입력해주세요.";
  }

  let emailPattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);

  if (!emailPattern.test(email)) {
    return "이메일 형식이 아닙니다.";
  }

  return "";
};

// 로그인은 가입 시점의 규칙을 알 수 없으므로 길이는 검사하지 않는다.
const validatePassword = (password: string) => {
  if (password.length === 0) {
    return "비밀번호를 입력해주세요.";
  }

  return "";
};

const LogIn = () => {
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [isEmailSaved, setIsEmailSaved] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies(["savedEmail"]);
  const router = useRouter();

  useEffect(() => {
    if (cookies.savedEmail) {
      setEmail(cookies.savedEmail);
      setIsEmailSaved(true);
    }
  }, []);

  useEffect(() => {
    if (isEmailSaved && email !== "") {
      const daysOf30 = 30 * 24 * 60 * 60;

      setCookie("savedEmail", email, { maxAge: daysOf30, path: "/" });
    } else {
      removeCookie("savedEmail");
    }
  }, [email]);

  const logInHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextEmailMessage = validateEmail(email);
    const nextPasswordMessage = validatePassword(password);

    setEmailMessage(nextEmailMessage);
    setPasswordMessage(nextPasswordMessage);

    if (nextEmailMessage || nextPasswordMessage) {
      return;
    }

    setErrorMessage([]);
    setIsSubmitting(true);

    try {
      await emailLogIn(email, password);
      router.replace("/main");
    } catch (error) {
      setErrorMessage(["이메일 또는 비밀번호를 잘못 입력했습니다.", "입력하신 내용을 다시 확인해주세요."]);
      setIsSubmitting(false);
    }
  };

  // 입력 중에는 이미 떠 있는 에러만 갱신하고, 검사는 blur·전송 시점에 한다.
  const emailChangeHandler = (inputEmail: string) => {
    setEmail(inputEmail);

    if (emailMessage) {
      setEmailMessage(validateEmail(inputEmail));
    }
  };

  const passwordChangeHandler = (inputPassword: string) => {
    setPassword(inputPassword);

    if (passwordMessage) {
      setPasswordMessage(validatePassword(inputPassword));
    }
  };

  const emailFocusHandler = () => {
    setErrorMessage([]);
  };

  const passwordFocusHandler = () => {
    setErrorMessage([]);
  };

  const kakaoLogIn = async () => {
    try {
      await oAuthLogIn("kakao");
    } catch (error) {
      setErrorMessage(["카카오 계정을 통한 로그인에 실패했습니다."]);
    }
  };

  const googleLogIn = async () => {
    try {
      await oAuthLogIn("google");
    } catch (error) {
      setErrorMessage(["구글 계정을 통한 로그인에 실패했습니다."]);
    }
  };

  const saveEmailHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setIsEmailSaved(e.target.checked);
    if (e.target.checked) {
      setCookie("savedEmail", email);
    } else {
      removeCookie("savedEmail");
    }
  };

  return (
    <div className={S.wrapper}>
      <header>
        <Link replace={true} href="/">
          <Image src={Logo} alt="logo" priority />
        </Link>
      </header>
      <main className={S.mainWrapper}>
        <form onSubmit={logInHandler} noValidate>
          <h2>로그인</h2>
          <div className={S.userform}>
            <div className={S.userField}>
              <label htmlFor="email">이메일</label>
              <input
                type="email"
                id="email"
                placeholder="이메일을 입력해주세요."
                autoComplete="off"
                autoFocus
                value={email}
                onChange={(e) => emailChangeHandler(e.target.value)}
                onFocus={emailFocusHandler}
                onBlur={() => setEmailMessage(validateEmail(email))}
                aria-invalid={emailMessage.length > 0}
                aria-describedby="email-message"
                required
              />
              <InputMessage id="email-message" text={emailMessage} />
            </div>
            <div className={S.userField}>
              <label htmlFor="password">비밀번호</label>
              <input
                type="password"
                id="password"
                placeholder="비밀번호를 입력해주세요."
                autoComplete="off"
                value={password}
                onChange={(e) => passwordChangeHandler(e.target.value)}
                onFocus={passwordFocusHandler}
                onBlur={() => setPasswordMessage(validatePassword(password))}
                aria-invalid={passwordMessage.length > 0}
                aria-describedby="password-message"
                required
              />
              <InputMessage id="password-message" text={passwordMessage} />
            </div>
            <div className={S.emailSave}>
              <p>
                <input type="checkbox" id="saveEmail" onChange={(e) => saveEmailHandler(e)} checked={isEmailSaved} />
                <label htmlFor="saveEmail">이메일 저장</label>
              </p>
              <Link replace={true} href="/register">
                회원가입
              </Link>
            </div>
            <ErrorMessage errorMessage={errorMessage} />
          </div>
          <div className={S.simpleLogin}>
            <h3>간편 로그인하기</h3>
            <ul>
              <li>
                <button type="button" onClick={kakaoLogIn}>
                  <Image src={KakaoLoginIcon} alt="카카오톡 로그인" />
                </button>
              </li>
              <li>
                <button type="button" onClick={googleLogIn}>
                  <Image src={GoogleLoginIcon} alt="구글 로그인" />
                </button>
              </li>
            </ul>
          </div>
          <button type="submit" className={S.loginButton} disabled={isSubmitting}>
            로그인
          </button>
        </form>
      </main>
    </div>
  );
};
export default LogIn;
