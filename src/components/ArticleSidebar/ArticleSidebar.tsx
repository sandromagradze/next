import Image from "next/image";
import Link from "next/link";

import type {
  CategoryBlock,
  SidebarArticle,
} from "@/lib/api/articleSidebar";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import type { RssBlock } from "@/lib/api/rss";
import RssSidebar from "@/components/RssSidebar/RssSidebar";

import "./ArticleSidebar.css";

interface ArticleSidebarProps {
  blocks: CategoryBlock[];
  latestNews: SidebarArticle[];
  rssBlocks: RssBlock[];
  lang: SupportedLanguageCode;
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
}: {
  block: CategoryBlock;
  lang: string;
}) {
  const articles =
    getBlockArticles(block);

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
                      loading="lazy"
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
    </section>
  );
}

function VerticalImagelessBlock({
  block,
  lang,
}: {
  block: CategoryBlock;
  lang: string;
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
    </section>
  );
}

function CategoryBlocks({
  blocks,
  lang,
}: {
  blocks: CategoryBlock[];
  lang: string;
}) {
  const articleBlocks = blocks.filter(
    (block) =>
      block.alias === "interviu" ||
      block.alias === "presis-mimoxilva",
  );

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

        if (!hasImages) {
          return (
            <VerticalImagelessBlock
              key={block.id}
              block={block}
              lang={lang}
            />
          );
        }

        return (
          <VerticalBlock
            key={block.id}
            block={block}
            lang={lang}
          />
        );
      })}
    </>
  );
}

function LatestNews({
  articles,
  lang,
}: {
  articles: SidebarArticle[];
  lang: string;
}) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className="article-sidebar__latest">
      <header className="article-sidebar__block-header">
        <h2 className="article-sidebar__block-title">
          ბოლო სიახლეები
        </h2>
      </header>

      <div className="article-sidebar__latest-list">
        {articles.slice(0, 3).map((article) => {
          const articleUrl =
            getArticleUrl(
              lang,
              article.url,
            );

          return (
            <article
              key={article.id}
              className="article-sidebar__latest-item"
            >
              <Link
                href={articleUrl}
                className="article-sidebar__latest-link"
              >
                <h3 className="article-sidebar__article-title">
                  {article.title}
                </h3>
              </Link>
            </article>
          );
        })}
      </div>

      <Link
        href={`/${lang}/`}
        className="article-sidebar__view-all"
      >
        <span>ყველა სიახლე</span>
        <span aria-hidden="true">
          →
        </span>
      </Link>
    </section>
  );
}

export default function ArticleSidebar({
  blocks,
  latestNews,
  rssBlocks,
  lang,
}: ArticleSidebarProps) {
  return (
    <aside
      className="article-sidebar"
      aria-label="სიახლეები"
    >
      <LatestNews
        articles={latestNews}
        lang={lang}
      />

      <CategoryBlocks
        blocks={blocks}
        lang={lang}
      />

      <RssSidebar
        blocks={rssBlocks}
        position="inside_page_right_column"
      />
    </aside>
  );
}
