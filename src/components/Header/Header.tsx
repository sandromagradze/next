"use client";

import Link from "next/link";
import Image from "next/image";

import WrapperA from "@/components/WrapperA/WrapperA"
import CurrencyTransfer from "@/components/CurrencyTransfer/CurrencyTransfer";
import LanguageChange from "@/components/LanguageChange/LanguageChange";
import SideBarAd from "@/components/Ads/SideBarAd";

import "./Header.css";
import WeatherInfo from "@/components/Weather/WeatherInfo";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

interface HeaderProps {
  lang: SupportedLanguageCode;
}

export default function Header({
  lang,
}: HeaderProps) {
  const handleLogoClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    const currentPath = window.location.pathname;
    const homePath = `/${lang}`;

    if (
      currentPath === homePath ||
      currentPath === `${homePath}/`
    ) {
      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    
    <header className="header">
      <WrapperA> 
      <div className="header__inner">
        {/* LOGO */}
        <div className="header__logo-wrapper">
          <Link
            href={`/${lang}`}
            onClick={handleLogoClick}
            aria-label="IPN"
            className="header__logo-link"
          >
            <Image
              src="/logo.svg"
              alt="IPN"
              width={150}
              height={74}
              className="header__logo"
            />
          </Link>
        </div>

        {/* HEADER AD */}
        <div
          className="header__ad"
          aria-label="Advertisement"
        >
          <SideBarAd
            position="top3"
            lang={lang}
            className="flex-shrink-0"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="header__right">
          <CurrencyTransfer
            lang={lang}
          />

          <div className="header__language">
            <LanguageChange
              currentLanguage={lang}
            />

            <WeatherInfo lang={lang} />
          </div>
        </div>
      </div>
      </WrapperA>
    </header>
    
  );
}