"use client";

import React, { useRef, useState } from "react";
import S from "@/style/commons/commons.module.css";
import emailjs from "emailjs-com";
import { toast } from "react-toastify";
import { InputMessage } from "@/components/commons/InputMessage";

const TITLE_MAX_LENGTH = 50;

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

const validateTitle = (title: string) => {
  if (title.trim().length === 0) {
    return "제목을 입력해주세요.";
  }

  if (title.length > TITLE_MAX_LENGTH) {
    return `제목은 ${TITLE_MAX_LENGTH}자 이내로 입력해주세요.`;
  }

  return "";
};

const validateContent = (content: string) => {
  if (content.trim().length === 0) {
    return "내용을 입력해주세요.";
  }

  return "";
};

const InquiryPage = () => {
  const form = useRef<HTMLFormElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [title, setTitle] = useState("");
  const [titleMessage, setTitleMessage] = useState("");
  const [content, setContent] = useState("");
  const [contentMessage, setContentMessage] = useState("");

  // 입력 중에는 이미 떠 있는 에러만 갱신하고, 검사는 blur·전송 시점에 한다.
  const emailChangeHandler = (inputEmail: string) => {
    setEmail(inputEmail);

    if (emailMessage) {
      setEmailMessage(validateEmail(inputEmail));
    }
  };

  const titleChangeHandler = (inputTitle: string) => {
    setTitle(inputTitle);

    if (titleMessage) {
      setTitleMessage(validateTitle(inputTitle));
    }
  };

  const contentChangeHandler = (inputContent: string) => {
    setContent(inputContent);

    if (contentMessage) {
      setContentMessage(validateContent(inputContent));
    }
  };

  const sendEmail = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSending || !form.current) {
      return;
    }

    const nextEmailMessage = validateEmail(email);
    const nextTitleMessage = validateTitle(title);
    const nextContentMessage = validateContent(content);

    setEmailMessage(nextEmailMessage);
    setTitleMessage(nextTitleMessage);
    setContentMessage(nextContentMessage);

    if (nextEmailMessage || nextTitleMessage || nextContentMessage) {
      return;
    }

    setIsSending(true);

    emailjs
      .sendForm(
        process.env.NEXT_PUBLIC_EMAIL_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAIL_TEMPLATE_ID!,
        form.current,
        process.env.NEXT_PUBLIC_EMAIL_PUBLIC_KEY!
      )
      .then(
        (result) => {
          toast.success("문의가 성공적으로 전송되었습니다.");
          setEmail("");
          setTitle("");
          setContent("");
        },
        (error) => {
          toast.error("이메일 전송이 실패되었습니다. 다시 시도해 주세요.");
        }
      )
      .finally(() => {
        setIsSending(false);
      });
  };

  return (
    <section className={S.inquiryWrap}>
      <h2>문의사항</h2>
      <form ref={form} onSubmit={sendEmail} className={S.sendInner} noValidate>
        <div>
          <label htmlFor="user_email">
            답변 받으실 이메일 <span>*</span>
          </label>
          <input
            type="email"
            id="user_email"
            name="user_email"
            placeholder="ex) abc@example.com"
            value={email}
            onChange={(e) => emailChangeHandler(e.target.value)}
            onBlur={() => setEmailMessage(validateEmail(email))}
            aria-invalid={emailMessage.length > 0}
            aria-describedby="user_email-message"
            autoFocus
            required
          />
          <InputMessage id="user_email-message" text={emailMessage} />
        </div>
        <div>
          <label htmlFor="title">
            제목 <span>*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder={`제목을 입력해주세요.(${TITLE_MAX_LENGTH}자 이내)`}
            maxLength={TITLE_MAX_LENGTH}
            value={title}
            onChange={(e) => titleChangeHandler(e.target.value)}
            onBlur={() => setTitleMessage(validateTitle(title))}
            aria-invalid={titleMessage.length > 0}
            aria-describedby="title-message"
            required
          />
          <InputMessage id="title-message" text={titleMessage} />
        </div>
        <div>
          <label htmlFor="message">
            내용 <span>*</span>
          </label>
          <textarea
            id="message"
            name="message"
            placeholder="내용을 입력해주세요."
            value={content}
            onChange={(e) => contentChangeHandler(e.target.value)}
            onBlur={() => setContentMessage(validateContent(content))}
            aria-invalid={contentMessage.length > 0}
            aria-describedby="message-message"
            required
          />
          <InputMessage id="message-message" text={contentMessage} />
        </div>
        <button type="submit" disabled={isSending}>
          보내기
        </button>
      </form>
    </section>
  );
};

export default InquiryPage;
