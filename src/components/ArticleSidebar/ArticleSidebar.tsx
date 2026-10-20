import Image from "next/image";
import Link from "next/link";

import type {
  CategoryBlock,
  SidebarArticle,
} from "@/lib/api/articleSidebar";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import type { RssBlock } from "@/lib/api/rss";
import { getBtuAiArticles } from "@/lib/api/btuAi";
import BtuAiSection from "@/components/BtuAi/BtuAiSection";
import RssSidebar from "@/components/RssSidebar/RssSidebar";
import ArticleSidebarLatestNews from "./ArticleSidebarLatestNews";

import "./ArticleSidebar.scss";

interface ArticleSidebarProps {
  blocks: CategoryBlock[];
  latestNews: SidebarArticle[];
  rssBlocks: RssBlock[];
  lang: SupportedLanguageCode;
  eagerFirstInterviewImage?: boolean;
  viewpointArticles?: SidebarArticle[];
  showLatestNewsDates?: boolean;
  showSectionLinks?: boolean;
  includeBtuAi?: boolean;
  includeRss?: boolean;
}

function getImageUrl(
  image: SidebarArticle["image"],
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
    src.startsWith("/media/__thumbs__/http://") ||
    src.startsWith("/media/__thumbs__/https://")
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

function getTime(
  article: SidebarArticle,
): string {
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
        ?.slice(0, 5) || ""
    );
  }

  const match = value.match(
    /\/\s*(\d{2}:\d{2})$/,
  );

  return match?.[1] || "";
}

function getDate(
  article: SidebarArticle,
): string {
  if (!article.publish_up) {
    return "";
  }

  if (article.publish_up.includes(" / ")) {
    return article.publish_up.split(
      " / ",
    )[0];
  }

  return article.publish_up;
}

function getBlockArticles(
  block: CategoryBlock,
): SidebarArticle[] {
  return Array.isArray(block.articles)
    ? block.articles
    : [];
}

function VerticalBlock({
  block,
  lang,
  eagerFirstImage,
  viewAllHref,
}: {
  block: CategoryBlock;
  lang: string;
  eagerFirstImage: boolean;
  viewAllHref?: string;
}) {
  const articles =
    getBlockArticles(block);
  const eagerImageArticleId = eagerFirstImage
    ? articles.find((article) => Boolean(getImageUrl(article.image)))?.id
    : undefined;

  if (!articles.length) {
    return null;
  }

  return (
    <section className="article-sidebar__block">
      <header className="article-sidebar__block-header">
        <h2 className="article-sidebar__block-title">
          {block.title}
        </h2>
      </header>

      <div className="article-sidebar__block-list">
        {articles.map((article) => {
          const imageUrl =
            getImageUrl(article.image);

          const articleUrl =
            getArticleUrl(
              lang,
              article.url,
            );

          const time =
            getTime(article);

          const date =
            getDate(article);

          return (
            <article
              key={`${block.id}-${article.id}`}
              className="article-sidebar__block-item"
            >
              <Link
                href={articleUrl}
                className="article-sidebar__article-link"
              >
                {imageUrl && (
                  <div className="article-sidebar__image">
                    <Image
                      src={imageUrl}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 280px"
                      loading={
                        article.id === eagerImageArticleId
                          ? "eager"
                          : "lazy"
                      }
                    />
                  </div>
                )}
                

                {(date || time) && (
                  <div className="article-sidebar__article-meta">
                    {date && (
                      <span>{date}</span>
                    )}

                    {time && (
                      <span>{time}</span>
                    )}
                  </div>
                )}

                <h3 className="article-sidebar__article-title">
                  {article.title}
                </h3>
              </Link>
            </article>
          );
        })}
      </div>
      {viewAllHref && (
        <Link className="article-sidebar__view-all" href={viewAllHref}>
          <span>{lang === "en" ? "All articles" : "ყველა სტატია"}</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}

function VerticalImagelessBlock({
  block,
  lang,
  viewAllHref,
}: {
  block: CategoryBlock;
  lang: string;
  viewAllHref?: string;
}) {
  const articles =
    getBlockArticles(block);

  const imagelessArticles =
    articles.filter(
      (article) =>
        !getImageUrl(article.image),
    );

  if (!imagelessArticles.length) {
    return null;
  }

  return (
    <section className="article-sidebar__block article-sidebar__block--imageless">
      <header className="article-sidebar__block-header">
        <h2 className="article-sidebar__block-title">
          {block.title}
        </h2>
      </header>

      <div className="article-sidebar__imageless-list">
        {imagelessArticles.map(
          (article) => {
            const articleUrl =
              getArticleUrl(
                lang,
                article.url,
              );

            return (
              <article
                key={`${block.id}-${article.id}`}
                className="article-sidebar__imageless-item"
              >
                <Link
                  href={articleUrl}
                  className="article-sidebar__imageless-link"
                >
                  <h3 className="article-sidebar__article-title">
                    {article.title}
                  </h3>
                </Link>
              </article>
            );
          },
        )}
      </div>
      {viewAllHref && (
        <Link className="article-sidebar__view-all" href={viewAllHref}>
          <span>{lang === "en" ? "All articles" : "ყველა სტატია"}</span>
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </section>
  );
}

function CategoryBlocks({
  blocks,
  lang,
  eagerFirstInterviewImage,
  viewpointArticles,
  showSectionLinks,
}: {
  blocks: CategoryBlock[];
  lang: string;
  eagerFirstInterviewImage: boolean;
  viewpointArticles: SidebarArticle[];
  showSectionLinks: boolean;
}) {
  const interviewBlocks = blocks.filter((block) =>
    ["interviu", "interview"].includes(block.alias),
  );
  const pressReviewBlocks = blocks.filter((block) =>
    ["presis-mimoxilva", "press-review"].includes(block.alias),
  );
  const viewpointBlock: CategoryBlock | null = viewpointArticles.length
    ? {
        id: lang === "ka" ? 48 : 46,
        alias: "viewpoint",
        title: lang === "en" ? "Viewpoint" : "თვალსაზრისი",
        articles: viewpointArticles,
      }
    : null;
  const articleBlocks = [
    ...interviewBlocks,
    ...(viewpointBlock ? [viewpointBlock] : []),
    ...pressReviewBlocks,
  ];

  if (!articleBlocks.length) {
    return null;
  }

  return (
    <>
      {articleBlocks.map((block) => {
        const articles =
          getBlockArticles(block);

        if (!articles.length) {
          return null;
        }

        const hasImages =
          articles.some((article) =>
            Boolean(
              getImageUrl(
                article.image,
              ),
            ),
          );
        const viewAllHref = showSectionLinks &&
          (block.alias === "interviu" || block.alias === "interview")
          ? `/${lang}/interview`
          : showSectionLinks && block.alias === "viewpoint"
            ? `/${lang}/viewpoint`
            : undefined;

        if (!hasImages) {
          return (
            <VerticalImagelessBlock
              key={block.id}
              block={block}
              lang={lang}
              viewAllHref={viewAllHref}
            />
          );
        }

        return (
          <VerticalBlock
            key={block.id}
            block={block}
            lang={lang}
            eagerFirstImage={
              eagerFirstInterviewImage &&
              block.alias === "interviu"
            }
            viewAllHref={viewAllHref}
          />
        );
      })}
    </>
  );
}

export default function ArticleSidebar({
  blocks,
  latestNews,
  rssBlocks,
  lang,
  eagerFirstInterviewImage = false,
  viewpointArticles = [],
  showLatestNewsDates = false,
  showSectionLinks = false,
  includeBtuAi = false,
  includeRss = true,
}: ArticleSidebarProps) {
  return (
    <aside
      className="article-sidebar"
      aria-label="სიახლეები"
    >
      <ArticleSidebarLatestNews
        articles={latestNews}
        lang={lang}
        showPublicationDate={showLatestNewsDates}
      />

      <CategoryBlocks
        blocks={blocks}
        lang={lang}
        eagerFirstInterviewImage={eagerFirstInterviewImage}
        viewpointArticles={viewpointArticles}
        showSectionLinks={showSectionLinks}
      />

      {includeBtuAi && (
        <BtuAiSection articles={getBtuAiArticles(rssBlocks)} />
      )}

      {includeRss && (
        <RssSidebar
          blocks={rssBlocks}
          position="inside_page_right_column"
        />
      )}
    </aside>
  );
}
