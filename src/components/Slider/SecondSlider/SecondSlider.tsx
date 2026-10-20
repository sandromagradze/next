"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { BpnNewsArticle } from "@/lib/api/bpnNews";
import { parsePublicationDate } from "@/lib/api/publicationDate";

import "./SecondSlider.scss";

interface SecondSliderProps {
  articles: BpnNewsArticle[];
  logo: string | null;
}

export default function SecondSlider({
  articles,
  logo,
}: SecondSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalSlides = articles.length;

  useEffect(() => {
    if (totalSlides <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((current) => {
        if (current >= totalSlides - 1) {
          return 0;
        }

        return current + 1;
      });
    }, 20000);

    return () => {
      window.clearInterval(interval);
    };
  }, [totalSlides]);

  if (totalSlides === 0) {
    return null;
  }

  const safeCurrentIndex = Math.min(currentIndex, totalSlides - 1);
  const article = articles[safeCurrentIndex];

  /*
   * BPN-ის API-ში images["364x206"] აბრუნებს
   * dev.ipn.ge/media/__rss__/... მისამართს,
   * რომელიც ამ ეტაპზე 404-ს აბრუნებს.
   *
   * ამიტომ ვიყენებთ original_image-ს.
   */
  const normalizeExternalUrl = (
    value: string | null | undefined,
    baseUrl: string,
  ): string => {
    const normalized = value?.trim();
    if (!normalized) return "";

    try {
      const url = new URL(
        normalized.startsWith("//")
          ? `https:${normalized}`
          : normalized,
        baseUrl,
      );
      if (url.protocol !== "http:" && url.protocol !== "https:") return "";
      if (url.protocol === "http:") url.protocol = "https:";
      return url.href;
    } catch {
      return "";
    }
  };

  const imageCandidates = [
    article.original_image,
    article.image,
    article.images?.["364x206"],
    article.images?.["288x162"],
    article.images?.["234x152"],
    article.images?.["206x116"],
    article.images?.["172x104"],
    article.images?.["170x96"],
  ];
  const imageUrl = imageCandidates
    .map((candidate) => normalizeExternalUrl(candidate, "https://bpn.ge/"))
    .find(Boolean) ?? "";

  const logoUrl = normalizeExternalUrl(logo, "https://dev.ipn.ge/");
  const articleUrl = normalizeExternalUrl(article.link, "https://bpn.ge/");
  const publicationDate = article.pubDate?.trim();
  const hasValidPublicationDate = Boolean(
    publicationDate && Number.isFinite(parsePublicationDate(publicationDate)),
  );

  const goToPrevious = () => {
    setCurrentIndex((current) => {
      if (current <= 0) {
        return totalSlides - 1;
      }

      return current - 1;
    });
  };

  const goToNext = () => {
    setCurrentIndex((current) => {
      if (current >= totalSlides - 1) {
        return 0;
      }

      return current + 1;
    });
  };

  return (
    <section className="second-slider">
        <hr className="second-slider__separator"/>
      <div className="second-slider__heading">
        {logoUrl && (
          <Image
            src={logoUrl}
            alt="BPN"
            width={154}
            height={52}
            sizes="154px"
            className="second-slider__logo"
          />
        )}

        <span className="second-slider__heading-title">
          ბიზნესისა და ეკონომიკის სიახლეები
        </span>
      </div>

      <div className="second-slider__content">
        <a
          href={articleUrl || undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="second-slider__image-link"
        >
          <div className="second-slider__image">
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={article.title}
                width={364}
                height={206}
                sizes="(max-width: 768px) calc(100vw - 30px), (max-width: 1024px) calc((100vw - 30px) / 2), (max-width: 1200px) calc((100vw - 284px) / 2), 366px"
                className="second-slider__image-element"
              />
            )}
          </div>
        </a>

        <div className="second-slider__right">
          <div className="second-slider__info">
            {hasValidPublicationDate && (
              <time className="second-slider__time">
                {publicationDate}
              </time>
            )}

            <a
              href={articleUrl || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="second-slider__title"
            >
              {article.title}
            </a>
          </div>

          <div className="second-slider__controls">
            <button
              type="button"
              className="second-slider__arrow"
              onClick={goToPrevious}
              aria-label="წინა სლაიდი"
            >
              ‹
            </button>

            <div className="second-slider__pagination">
              {articles.map((item, index) => (
                <button
                  key={`${item.link}-${index}`}
                  type="button"
                  className={`second-slider__dot ${
                    index === safeCurrentIndex
                      ? "second-slider__dot--active"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                  }}
                  aria-label={`სლაიდი ${index + 1}`}
                  aria-current={
                    index === safeCurrentIndex
                      ? "true"
                      : undefined
                  }
                >
                  {index + 1}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="second-slider__arrow"
              onClick={goToNext}
              aria-label="შემდეგი სლაიდი"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
