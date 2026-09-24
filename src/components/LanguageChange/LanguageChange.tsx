"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SUPPORTED_LANGUAGES } from "@/lib/api/i18n";

import "./LanguageChange.css";

interface LanguageChangeProps {
  currentLanguage: string;
}

function LanguageFlag({
  language,
}: {
  language: string;
}) {
  if (language === "ka") {
    return (
      <span
        className="language-flag language-flag-georgia"
        aria-hidden="true"
      >
        <span className="georgia-cross georgia-cross-horizontal" />
        <span className="georgia-cross georgia-cross-vertical" />

        <span className="georgia-small-cross georgia-small-cross-1" />
        <span className="georgia-small-cross georgia-small-cross-2" />
        <span className="georgia-small-cross georgia-small-cross-3" />
        <span className="georgia-small-cross georgia-small-cross-4" />
      </span>
    );
  }

  if (language === "en") {
    return (
      <span
        className="language-flag language-flag-uk"
        aria-hidden="true"
      >
        <span className="uk-white-diagonal uk-white-diagonal-1" />
        <span className="uk-white-diagonal uk-white-diagonal-2" />

        <span className="uk-red-diagonal uk-red-diagonal-1" />
        <span className="uk-red-diagonal uk-red-diagonal-2" />

        <span className="uk-white-cross uk-white-cross-horizontal" />
        <span className="uk-white-cross uk-white-cross-vertical" />

        <span className="uk-red-cross uk-red-cross-horizontal" />
        <span className="uk-red-cross uk-red-cross-vertical" />
      </span>
    );
  }

  return (
    <span
      className="language-flag language-flag-default"
      aria-hidden="true"
    >
      🌐
    </span>
  );
}

export default function LanguageChange({
  currentLanguage,
}: LanguageChangeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const pathname = usePathname();

  const currentLabel =
    currentLanguage === "en"
      ? "English"
      : "ქართული";

  function getLanguageUrl(language: string) {
    const segments = pathname.split("/");

    segments[1] = language;

    return segments.join("/") || `/${language}`;
  }

  return (
    <div className="language-change-container">
      <button
        type="button"
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        className="language-change-button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <LanguageFlag language={currentLanguage} />

        <span>{currentLabel}</span>

        <svg
          className={`language-change-arrow ${
            isOpen
              ? "language-change-arrow-open"
              : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className="language-change-menu"
          role="menu"
        >
          {SUPPORTED_LANGUAGES.map(
            ({ code }) => {
              const isCurrent =
                code === currentLanguage;

              const label =
                code === "en"
                  ? "English"
                  : "ქართული";

              return (
                <Link
                  key={code}
                  href={getLanguageUrl(code)}
                  className={`language-change-item ${
                    isCurrent
                      ? "language-change-item-active"
                      : ""
                  }`}
                  role="menuitem"
                  onClick={() =>
                    setIsOpen(false)
                  }
                >
                  <span className="language-change-item-left">
                    <LanguageFlag language={code} />

                    <span>{label}</span>
                  </span>

                  {isCurrent && (
                    <span className="language-change-dot" />
                  )}
                </Link>
              );
            },
          )}
        </div>
      )}
    </div>
  );
}
