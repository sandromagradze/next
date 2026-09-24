"use client";

import { useEffect, useState } from "react";

import MainCard from "@/components/MainCard/MainCard";
import useSliderNews from "@/components/hooks/useSliderNews";

import "./SliderNews.css";

interface SliderNewsProps {
lang: string;
compact?: boolean;
}

function getImageUrl(
image: {
original?: string;
thumb?: string;
webp?: string;
} | null,
): string {
if (!image) {
return "";
}

const src =
image.webp?.trim() ||
image.original?.trim() ||
image.thumb?.trim() ||
"";

if (!src) {
return "";
}

if (
src.startsWith("http://") ||
src.startsWith("https://")
) {
return src;
}

return `https://dev.ipn.ge/${src.replace(
    /^\/+/,
    "",
  )}`;
}

function getArticleUrl(
lang: string,
url: string,
): string {
if (!url) {
return `https://dev.ipn.ge/${lang}/`;
}

if (
url.startsWith("http://") ||
url.startsWith("https://")
) {
return url;
}

return `https://dev.ipn.ge/${lang}${url.startsWith("/") ? url : `/${url}`}`;
}

export default function SliderNews({
lang,
compact = false,
}: SliderNewsProps) {
const {
data: articles = [],
isLoading,
isError,
error,
} = useSliderNews(lang);

const [activeIndex, setActiveIndex] =
useState(0);

useEffect(() => {
setActiveIndex(0);
}, [lang]);

useEffect(() => {
if (articles.length <= 1) {
return;
}

const interval = window.setInterval(() => {
  setActiveIndex((prevIndex) => {
    return (
      (prevIndex + 1) %
      articles.length
    );
  });
}, 20000);

return () => {
  window.clearInterval(interval);
};

}, [articles.length]);

const wrapperClassName = [
"slider-news-wrapper",
compact
? "slider-news-wrapper--compact"
: "",
]
.filter(Boolean)
.join(" ");

if (isLoading) {
return ( <div className={wrapperClassName}> <div className="slider-news-status">
Loading... </div> </div>
);
}

if (isError) {
return ( <div className={wrapperClassName}> <div className="slider-news-status slider-news-status--error">
Slider error:{" "}
{error instanceof Error
? error.message
: "Failed to load slider"} </div> </div>
);
}

if (articles.length === 0) {
return ( <div className={wrapperClassName}> <div className="slider-news-status">
No slider articles found. </div> </div>
);
}

const safeActiveIndex = Math.min(
activeIndex,
articles.length - 1,
);

const current =
articles[safeActiveIndex];

const imageUrl = getImageUrl(
current.image,
);

const articleUrl = getArticleUrl(
lang,
current.url,
);

const handlePrev = () => {
setActiveIndex((prev) =>
prev === 0
? articles.length - 1
: prev - 1,
);
};

const handleNext = () => {
setActiveIndex((prev) =>
prev === articles.length - 1
? 0
: prev + 1,
);
};

return ( <div className={wrapperClassName}> <MainCard
     title={current.title}
     time={current.publish_up}
     image={imageUrl}
     compact={compact}
     url={articleUrl}
   />

  {articles.length > 1 && (
    <div
      className="slider-pagination-wrapper"
      aria-label="Slider controls"
    >
      <button
        type="button"
        onClick={handlePrev}
        className="slider-arrow-button"
        aria-label="Previous article"
      >
        <img
          src="/arrowleft.svg"
          alt=""
          aria-hidden="true"
        />
      </button>

      <div className="slider-news-dots">
        {articles.map(
          (article, index) => (
            <button
              type="button"
              key={article.id}
              onClick={() =>
                setActiveIndex(index)
              }
              className={`slider-news-dot ${
                index ===
                safeActiveIndex
                  ? "slider-news-dot-active"
                  : ""
              }`}
              aria-label={`Go to article ${
                index + 1
              }`}
              aria-current={
                index ===
                safeActiveIndex
                  ? "true"
                  : undefined
              }
            >
              {index + 1}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="slider-arrow-button"
        aria-label="Next article"
      >
        <img
          src="/arrowright.svg"
          alt=""
          aria-hidden="true"
        />
      </button>
    </div>
  )}
</div>

);
}
