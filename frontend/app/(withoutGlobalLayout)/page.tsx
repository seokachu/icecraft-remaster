import React from "react";
import S from "@/style/Intropage/intro.module.css";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/assets/images/logo.svg";
import TextTyping from "@/utils/TextTyping";
import IntroBg from "@/assets/images/intro_bg.avif";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { baseUrl } from "@/utils/baseUrl";

const IntroPage = async () => {
  const supabase = createClient();

  const { data } = await supabase.auth.getSession();

  if (data.session?.user) {
    redirect("/main");
  }

  return (
    <div className={S.introWrapper}>
      <header>
        <Link replace={true} href="/">
          <Image src={Logo} alt="아이스 크래프트 홈페이지입니다." priority />
        </Link>
      </header>
      <section className={S.section}>
        <Image src={IntroBg} alt="ice craft" className={S.IntroImage} priority />
        <video
          className={S.video}
          src=" https://res.cloudinary.com/dknj7kdek/video/upload/v1723811735/mvcfkvewapiy0sbc7wxx.mp4"
          muted
          autoPlay
          loop
          playsInline
        ></video>
        <div className={S.introTitle}>
          <TextTyping />
          <Link replace={true} href="/main" className={S.mainButton}>
            Get Started
          </Link>
          <Link replace={true} href="/login" className={S.loginButton}>
            Login
          </Link>
          <div className={S.signUpButton}>
            <p>아직 IceCraft에 가입하지 않으셨나요?</p>
            <Link replace={true} href="/register">
              회원가입 하기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: "IceCraft",
  description: "into stunning space! 놀라운 공간 속으로!",
  keywords: ["IceCraft", "icecraft", "아이스 크레프트", "마피아 게임", "노래맞추기 게임"],
  creator: "IC company",
  openGraph: {
    title: "IceCraft",
    description: "into stunning space! 놀라운 공간 속으로!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1920,
        height: 818,
        alt: "IceCraft"
      }
    ],

    url: "/",
    siteName: "IceCraft",
    locale: "ko_KR",
    type: "website"
  }
};

export default IntroPage;
