"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import MainCard from "@/components/MainCard/MainCard";
import useSliderNews from "@/components/hooks/useSliderNews";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import type { SliderArticle } from "@/lib/api/slider";
import { stripHtml } from "@/lib/seo";

import "./SliderNews.css";

interface SliderNewsProps {
lang: SupportedLanguageCode;
compact?: boolean;
initialArticles?: SliderArticle[];
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
return `/${lang}/`;
}

if (
url.startsWith("http://") ||
url.startsWith("https://")
) {
return url;
}

return `/${lang}${url.startsWith("/") ? url : `/${url}`}`;
}

function getPreviewText(value: string): string {
return stripHtml(value)
  .replace(/&nbsp;|&#160;/gi, " ")
  .replace(/&ldquo;|&#8220;/gi, "\u201C")
  .replace(/&rdquo;|&#8221;/gi, "\u201D")
  .replace(/&lsquo;|&#8216;/gi, "\u2018")
  .replace(/&rsquo;|&#8217;/gi, "\u2019")
  .replace(/&quot;|&#34;/gi, '"')
  .replace(/&apos;|&#39;/gi, "'")
  .replace(/&amp;/gi, "&");
}

export default function SliderNews({
lang,
compact = false,
initialArticles = [],
}: SliderNewsProps) {
const {
data: articles = [],
isLoading,
isError,
error,
} = useSliderNews(lang, initialArticles);

const [activeIndex, setActiveIndex] =
useState(0);

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

const pagination = articles.length > 1 ? (
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
      <Image
        src="/arrowleft.svg"
        width={23}
        height={23}
        alt=""
        aria-hidden="true"
        loading="eager"
      />
    </button>

    <div className="slider-news-dots">
      {articles.map((article, index) => (
        <button
          type="button"
          key={article.id}
          onClick={() => setActiveIndex(index)}
          className={`slider-news-dot ${
            index === safeActiveIndex
              ? "slider-news-dot-active"
              : ""
          }`}
          aria-label={`Go to article ${index + 1}`}
          aria-current={
            index === safeActiveIndex ? "true" : undefined
          }
        >
          {index + 1}
        </button>
      ))}
    </div>

    <button
      type="button"
      onClick={handleNext}
      className="slider-arrow-button"
      aria-label="Next article"
    >
      <Image
        src="/arrowright.svg"
        width={23}
        height={23}
        alt=""
        aria-hidden="true"
      />
    </button>
  </div>
) : null;

return ( <div className={wrapperClassName}> <MainCard
     title={current.title}
     time={current.publish_up}
     image={imageUrl}
     preview={getPreviewText(current.introtext)}
     pagination={pagination}
     compact={compact}
     url={articleUrl}
       priority={!compact && safeActiveIndex === 0}
   />
</div>

);
}
