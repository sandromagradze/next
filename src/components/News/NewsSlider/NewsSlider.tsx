"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { NewsSliderArticle } from "@/lib/api/newsSlider";

import "./NewsSlider.css";

interface NewsSliderProps {
  articles: NewsSliderArticle[];
  lang: string;
}

export default function NewsSlider({
  articles,
  lang,
}: NewsSliderProps) {
  const slides = articles.slice(0, 5);

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((current) =>
        current === slides.length - 1 ? 0 : current + 1
      );
    }, 20000);

    return () => clearInterval(interval);
  }, [slides.length]);

  if (slides.length === 0) {
    return null;
  }

  const currentArticle = slides[currentIndex];

  const imageUrl =
    currentArticle.image?.webp ||
    currentArticle.image?.original ||
    "";

  const articleUrl = currentArticle.url
    ? `/${lang}${currentArticle.url}`
    : `/${lang}/article/${currentArticle.id}`;

  const goToPrevious = () => {
    setCurrentIndex((current) =>
      current === 0 ? slides.length - 1 : current - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((current) =>
      current === slides.length - 1 ? 0 : current + 1
    );
  };

  return (
    <article className="news-slider">
      <Link
        href={articleUrl}
        className="news-slider__link"
      >
        <div className="news-slider__image">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={currentArticle.title}
              width={230}
              height={130}
            />
          )}
        </div>

        <time className="news-slider__time">
          {currentArticle.publish_up}
        </time>

        <h3 className="news-slider__title">
          {currentArticle.title}
        </h3>
      </Link>

      {slides.length > 1 && (
        <div className="news-slider__dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`news-slider__dot ${
                index === currentIndex
                  ? "news-slider__dot--active"
                  : ""
              }`}
              onClick={() => setCurrentIndex(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={
                index === currentIndex ? "true" : undefined
              }
            >
              {index + 1}
            </button>
          ))}

          <button
            type="button"
            className="news-slider__arrow news-slider__arrow--prev"
            onClick={goToPrevious}
            aria-label="Previous slide"
          >
            ‹
          </button>

          <button
            type="button"
            className="news-slider__arrow news-slider__arrow--next"
            onClick={goToNext}
            aria-label="Next slide"
          >
            ›
          </button>
        </div>
      )}
    </article>
  );
}