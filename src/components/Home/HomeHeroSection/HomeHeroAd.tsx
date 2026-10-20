"use client";

import { useCallback, useState } from "react";

import SideBarAd from "@/components/Ads/SideBarAd";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

interface HomeHeroAdProps {
  lang: SupportedLanguageCode;
}

export default function HomeHeroAd({ lang }: HomeHeroAdProps) {
  const [adState, setAdState] = useState({ lang, hasAd: false });
  const hasAd = adState.lang === lang && adState.hasAd;

  const handleAvailabilityChange = useCallback(
    (available: boolean) => {
      setAdState((current) =>
        current.lang === lang && current.hasAd === available
          ? current
          : { lang, hasAd: available },
      );
    },
    [lang],
  );

  return (
    <SideBarAd
      position="top1"
      lang={lang}
      className="home-hero__ad-container"
      hasAd={hasAd}
      onAvailabilityChange={handleAvailabilityChange}
    />
  );
}
