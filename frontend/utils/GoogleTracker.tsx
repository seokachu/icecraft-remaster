"use client";
import { useEffect, useState } from "react";
import ReactGA from "react-ga4";
import { usePathname } from "next/navigation";

const GoogleTracker = () => {
  const pathname = usePathname();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS;

    // GA 키가 없으면(선택 env) 추적을 건너뛴다 — 없다고 앱이 죽으면 안 됨
    if (gaId && !window.location.href.includes("localhost")) {
      ReactGA.initialize(gaId);
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (initialized) {
      ReactGA.set({ page: pathname });
      ReactGA.send("pageview");
    }
  }, [initialized, pathname]);
  return null;
};

export default GoogleTracker;
