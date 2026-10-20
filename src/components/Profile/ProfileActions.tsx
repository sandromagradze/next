"use client";

import Image from "next/image";

import type { SupportedLanguageCode } from "@/lib/api/i18n";

export default function ProfileActions({
  lang,
  shareUrl,
}: {
  lang: SupportedLanguageCode;
  shareUrl: string;
}) {
  return (
    <div className="profile-detail__actions">
      <a
        className="profile-detail__share"
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={
          lang === "en"
            ? "Share this profile on Facebook"
            : "პროფილის Facebook-ზე გაზიარება"
        }
      >
        <Image
          src="/fbshare.png"
          alt="Facebook"
          width={40}
          height={32}
          unoptimized
        />
      </a>
      <button
        className="profile-detail__print"
        type="button"
        onClick={() => window.print()}
        aria-label={
          lang === "en"
            ? "Print this profile"
            : "პროფილის დაბეჭდვა"
        }
      >
        <Image
          src="/print.png"
          alt={lang === "en" ? "Print" : "დაბეჭდვა"}
          width={40}
          height={32}
          unoptimized
        />
      </button>
    </div>
  );
}
