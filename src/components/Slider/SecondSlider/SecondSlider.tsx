"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import type { BpnNewsArticle } from "@/lib/api/bpnNews";

import "./SecondSlider.css";

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

  const article = articles[currentIndex];

  /*
   * BPN-ის API-ში images["364x206"] აბრუნებს
   * dev.ipn.ge/media/__rss__/... მისამართს,
   * რომელიც ამ ეტაპზე 404-ს აბრუნებს.
   *
   * ამიტომ ვიყენებთ original_image-ს.
   */
  const imageUrl = article.original_image
    ? article.original_image.replace(
        "http://",
        "https://"
      )
    : "";

  const logoUrl = logo
    ? `https://dev.ipn.ge${logo}`
    : "";

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
          href={article.link}
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
                sizes="(max-width: 768px) 100vw, 364px"
                className="second-slider__image-element"
              />
            )}
          </div>
        </a>

        <div className="second-slider__right">
          <div className="second-slider__info">
            <time className="second-slider__time">
              {article.pubDate}
            </time>

            <a
              href={article.link}
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
                    index === currentIndex
                      ? "second-slider__dot--active"
                      : ""
                  }`}
                  onClick={() => {
                    setCurrentIndex(index);
                  }}
                  aria-label={`სლაიდი ${index + 1}`}
                  aria-current={
                    index === currentIndex
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
