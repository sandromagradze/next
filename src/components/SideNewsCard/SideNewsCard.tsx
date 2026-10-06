"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import BtuAiSection from "@/components/BtuAi/BtuAiSection";
import useCategoryBlocks from "@/components/hooks/useCategoryBlocks";
import useRssBlocks from "@/components/hooks/useRssBlocks";

import { getBtuAiArticles } from "@/lib/api/btuAi";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

import "./SideNewsCard.css";

interface SideNewsCardProps {
  lang: SupportedLanguageCode;
  blockAlias?: string;
  showRemaining?: boolean;
}

function getImageUrl(
  image:
    | {
        original?: string;
        thumb?: string;
        webp?: string;
      }
    | null
    | undefined,
): string {
  if (!image) {
    return "";
  }

  const src =
    image.webp?.trim() ||
    image.thumb?.trim() ||
    image.original?.trim() ||
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

  if (
    src.startsWith(
      "/media/__thumbs__/http://",
    ) ||
    src.startsWith(
      "/media/__thumbs__/https://",
    )
  ) {
    return src.slice(
      "/media/__thumbs__/".length,
    );
  }

  if (
    src.startsWith("/media/http://") ||
    src.startsWith("/media/https://")
  ) {
    return src.slice("/media/".length);
  }

  if (src.startsWith("/")) {
    return `https://dev.ipn.ge${src}`;
  }

  return `https://dev.ipn.ge/${src}`;
}

function getTime(article: {
  pub_dt?: string;
  publish_up?: string;
}): string {
  const value =
    article.pub_dt ||
    article.publish_up ||
    "";

  if (!value) {
    return "";
  }

  if (value.includes("T")) {
    return (
      value
        .split("T")[1]
        ?.slice(0, 5) ?? ""
    );
  }

  return value.slice(0, 5);
}

function getArticleUrl(
  lang: string,
  url?: string,
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

  return `/${lang}${
    url.startsWith("/")
      ? url
      : `/${url}`
  }`;
}

export default function SideNewsCard({
  lang,
  blockAlias,
  showRemaining = false,
}: SideNewsCardProps) {
  const {
    data: blocks = [],
    isLoading,
    isError,
  } = useCategoryBlocks(lang);

  const {
    data: rssBlocks = [],
  } = useRssBlocks(lang);

  const btuAiArticles = useMemo(
    () => getBtuAiArticles(rssBlocks),
    [rssBlocks],
  );
  const imageSizes = showRemaining
    ? "(max-width: 768px) calc(100vw - 30px), (max-width: 1024px) 210px, 234px"
    : "(max-width: 768px) calc(100vw - 30px), (max-width: 1024px) calc(100vw - 54px), 234px";

  /*
   * showRemaining-ზე ვაჩვენებთ ყველა დარჩენილ
   * CategoryBlock-ს, გარდა ინტერვიუსა და
   * პრესის მიმოხილვისა, რადგან ისინი ცალკე
   * SideNewsCard-ებით renderდება.
   */
  const visibleBlocks = useMemo(() => {
    if (showRemaining) {
      return blocks.filter(
        (block) =>
          block.alias !== "interviu" &&
          block.alias !==
            "presis-mimoxilva",
      );
    }

    if (blockAlias) {
      return blocks.filter(
        (block) =>
          block.alias === blockAlias,
      );
    }

    return [];
  }, [
    blocks,
    blockAlias,
    showRemaining,
  ]);

  /*
   * ამ კომპონენტისთვის მიღებული block-ები
   * renderდება ჩვეულებრივ.
   */
  const renderedBlocks = useMemo(() => {
    if (!blockAlias) {
      return visibleBlocks;
    }

    return visibleBlocks;
  }, [
    visibleBlocks,
    blockAlias,
  ]);

  if (
    isLoading &&
    !renderedBlocks.length &&
    !btuAiArticles.length
  ) {
    return (
      <aside className="side-news-card">
        <div className="side-news-card__loading">
          Loading...
        </div>
      </aside>
    );
  }

  if (
    isError &&
    !renderedBlocks.length &&
    !btuAiArticles.length
  ) {
    return (
      <aside className="side-news-card">
        <div className="side-news-card__error">
          Failed to load news
        </div>
      </aside>
    );
  }

  if (
    !renderedBlocks.length &&
    !btuAiArticles.length
  ) {
    return null;
  }

  return (
    <>
      {renderedBlocks.map((block) => (
        <aside
          key={
            block.id ?? block.alias
          }
          className="side-news-card"
        >
          <div className="side-news-card__title">
            {block.title}
          </div>

          <div className="side-news-card__list">
            {(block.articles ?? []).map(
              (article) => {
                const category =
                  article.categories?.[0]
                    ?.title || "";

                const imageUrl =
                  getImageUrl(
                    article.image,
                  );

                const articleUrl =
                  getArticleUrl(
                    lang,
                    article.url,
                  );

                const time =
                  getTime(article);

                return (
                  <article
                    key={article.id}
                    className="side-news-card__item"
                  >
                    <Link
                      href={articleUrl}
                      className="side-news-card__link"
                      aria-label={
                        article.title
                      }
                    >
                      {imageUrl ? (
                        <div className="side-news-card__image-wrapper">
                          <Image
                            src={imageUrl}
                            alt={article.title}
                            fill
                            sizes={imageSizes}
                            className="side-news-card__image"
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                      ) : null}

                      <div className="side-news-card__meta">
                        {category && (
                          <span className="side-news-card__category">
                            {category}
                          </span>
                        )}

                        {time && (
                          <time className="side-news-card__time">
                            {time}
                          </time>
                        )}
                      </div>

                      <h3 className="side-news-card__headline">
                        {article.title}
                      </h3>
                    </Link>
                  </article>
                );
              },
            )}
          </div>

          <div className="side-news-card__footer">
            <Link
              href={`/${lang}/`}
              className="side-news-card__view-all"
              aria-label="ყველა სიახლე"
            >
              <span>
                ყველა სიახლე
              </span>

              <span
                className="side-news-card__view-all-arrow"
                aria-hidden="true"
              >
                &gt;&gt;
              </span>
            </Link>
          </div>
        </aside>
      ))}

      {/*
       * BTU მხოლოდ პრესის მიმოხილვის შემდეგ.
       *
       * ეს კომპონენტი renderდება მხოლოდ მაშინ,
       * როცა მიმდინარე SideNewsCard არის
       * "presis-mimoxilva".
       */}
      {blockAlias ===
        "presis-mimoxilva" &&
        btuAiArticles.length > 0 && (
          <BtuAiSection
            articles={btuAiArticles}
          />
        )}
    </>
  );
}