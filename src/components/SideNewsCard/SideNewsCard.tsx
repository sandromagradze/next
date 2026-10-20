"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import BtuAiSection from "@/components/BtuAi/BtuAiSection";
import ArticleSidebarLatestNews from "@/components/ArticleSidebar/ArticleSidebarLatestNews";
import RssItemImage from "@/components/RssSidebar/RssItemImage";
import useCategoryBlocks from "@/components/hooks/useCategoryBlocks";
import useRssBlocks from "@/components/hooks/useRssBlocks";

import { getBtuAiArticles } from "@/lib/api/btuAi";
import {
  getRssImageUrl,
  type RssBlock,
  type RssItem,
} from "@/lib/api/rss";
import { formatPublicationDateTime } from "@/lib/formatSliderPublicationTime";
import type { LatestNewsItem } from "@/lib/api/latestNews";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

import "./SideNewsCard.scss";
import SideBarAd from "../Ads/SideBarAd";

interface SideNewsCardProps {
  lang: SupportedLanguageCode;
  blockAlias?: string;
  showRemaining?: boolean;
  latestNews?: LatestNewsItem[];
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

const nextImageHosts = new Set([
  "cdn3.ipn.ge",
  "cdn2.ipn.ge",
  "dev.ipn.ge",
  "sportall.ge",
  "www.bpn.ge",
  "bpn.ge",
  "video.ambebi.ge",
  "mshoblebi.ge",
]);

function canUseNextImage(src: string): boolean {
  try {
    const url = new URL(src);
    return (
      url.protocol === "https:" &&
      nextImageHosts.has(url.hostname) &&
      (url.hostname !== "mshoblebi.ge" ||
        url.pathname.startsWith("/media/"))
    );
  } catch {
    return false;
  }
}

function LowerSectionHeading({
  title,
  logo,
}: {
  title: string;
  logo?: string | null;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = getRssImageUrl(logo);

  return (
    <h2 className="side-news-card__title">
      {imageUrl && !imageFailed ? (
        canUseNextImage(imageUrl) ? (
          <Image
            src={imageUrl}
            alt={`${title} logo`}
            width={180}
            height={40}
            className="side-news-card__section-logo"
            onError={() => setImageFailed(true)}
          />
        ) : (
          // External RSS logo hosts outside remotePatterns must bypass Next image optimization.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={`${title} logo`}
            className="side-news-card__section-logo"
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        )
      ) : (
        title
      )}
    </h2>
  );
}

function LowerRssSection({
  block,
  title,
  lang,
  itemCount,
  items: suppliedItems,
}: {
  block: RssBlock;
  title: string;
  lang: SupportedLanguageCode;
  itemCount?: number;
  items?: RssItem[];
}) {
  const items = (suppliedItems ?? block.items ?? []).filter(
    (item): item is RssItem & { title: string; link: string } =>
      Boolean(item.title?.trim() && item.link?.trim()),
  );
  const visibleItems = itemCount ? items.slice(0, itemCount) : items;

  if (!visibleItems.length) return null;

  return (
    <section className="side-news-card side-news-card--lower">
      <LowerSectionHeading title={title} logo={block.logo} />
      <div className="side-news-card__list">
        {visibleItems.map((item, index) => {
          const publicationDate = formatPublicationDateTime(item.pubDate, lang);
          return (
            <article
              key={`${block.id}-${item.link}-${index}`}
              className="side-news-card__item"
            >
              <a href={item.link} target="_blank" rel="noopener noreferrer" className="side-news-card__link">
                <RssItemImage item={item} title={item.title} />
                {publicationDate && (
                  <time className="todaynewsdate">{publicationDate}</time>
                )}
                <h3 className="side-news-card__headline">{item.title}</h3>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default function SideNewsCard({
  lang,
  blockAlias,
  showRemaining = false,
  latestNews,
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
        (block) => block.title?.trim() === "მნიშვნელოვანი ინფორმაცია",
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
    !showRemaining &&
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
    !showRemaining &&
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
    !showRemaining &&
    !renderedBlocks.length &&
    !btuAiArticles.length
  ) {
    return null;
  }

  if (showRemaining) {
    const getSource = (block: RssBlock) =>
      `${block.domain} ${block.title ?? ""}`.toLowerCase();
    const radioBlock = rssBlocks.find((block) => {
      const source = getSource(block);
      return block.position === "main_page_right_column" &&
        source.includes("palitra") && source.includes("radio");
    });
    const palitraVideoBlock = rssBlocks.find((block) =>
      block.position === "main_page_right_column" &&
      getSource(block).includes("palitravideo.ge"),
    );
    const mkurnaliBlock = rssBlocks.find((block) =>
      block.position === "main_page_right_column" &&
      getSource(block).includes("mkurnali.ge"),
    );
    return (
      <div className="side-news-card__lower-content">
        {radioBlock && <LowerRssSection block={radioBlock} title="Palitra Radio" lang={lang} />}
        {renderedBlocks.map((block) => (
          <aside key={block.id ?? block.alias} className="side-news-card side-news-card--lower">
            <h2 className="side-news-card__title">{block.title}</h2>
            <div className="side-news-card__list">
              {(block.articles ?? []).map((article) => {
                const imageUrl = getImageUrl(article.image);
                const publicationDate =
                  formatPublicationDateTime(article.pub_dt, lang) ||
                  formatPublicationDateTime(article.publish_up, lang);
                return (
                  <article key={article.id} className="side-news-card__item">
                    <Link href={getArticleUrl(lang, article.url)} className="side-news-card__link">
                      {imageUrl && (
                        <div className="side-news-card__image-wrapper">
                          <Image src={imageUrl} alt={article.title} fill sizes={imageSizes} className="side-news-card__image" loading="lazy" />
                        </div>
                      )}
                      {publicationDate && (
                        <time className="todaynewsdate">{publicationDate}</time>
                      )}
                      <h3 className="side-news-card__headline">{article.title}</h3>
                    </Link>
                  </article>
                );
              })}
            </div>
          </aside>
        ))}
        {palitraVideoBlock && (
          <LowerRssSection block={palitraVideoBlock} title="Palitravideo.ge" lang={lang} itemCount={2} />
        )}
        {mkurnaliBlock && (
          <LowerRssSection block={mkurnaliBlock} title="Mkurnali.ge" lang={lang} itemCount={2} />
        )}
        <div className="side-news-card__lower-ad">
          <SideBarAd position="adword" lang={lang} />
        </div>
      </div>
    );
  }

  return (
    <>
      {latestNews && (
        <ArticleSidebarLatestNews
          articles={latestNews}
          lang={lang}
          showPublicationDate
        />
      )}

      {renderedBlocks.map((block) => (
        <aside
          key={
            block.id ?? block.alias
          }
          className="side-news-card"
        >
    <h2 className="side-news-card__title">
  {block.title?.trim() === "მნიშვნელოვანი ინფორმაცია" ? (
    <span className="side-news-card__title--important">
      {block.title}
    </span>
  ) : (
    block.title
  )}
</h2>

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

                const publicationDate =
                  formatPublicationDateTime(article.pub_dt, lang) ||
                  formatPublicationDateTime(article.publish_up, lang);

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

                      </div>

                      {publicationDate && (
                        <time className="todaynewsdate">{publicationDate}</time>
                      )}
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
