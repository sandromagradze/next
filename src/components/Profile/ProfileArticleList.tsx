import Image from "next/image";
import Link from "next/link";

import type { SupportedLanguageCode } from "@/lib/api/i18n";
import type { ProfileArticle } from "@/lib/api/profiles";

interface ProfileArticleListProps {
  articles: ProfileArticle[];
  lang: SupportedLanguageCode;
  page?: number;
  hasNext?: boolean;
  articlesHref?: string;
}

function getArticleHref(
  lang: SupportedLanguageCode,
  url: string,
  id: number,
): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  const path = url.trim() || `/article/${id}`;
  return `/${lang}${path.startsWith("/") ? path : `/${path}`}`;
}

function getArticleImage(
  article: ProfileArticle,
): string {
  const source =
    article.image?.thumb ||
    article.image?.webp ||
    article.image?.original ||
    "";

  return source.replace(/^http:\/\//i, "https://");
}

export default function ProfileArticleList({
  articles,
  lang,
  page,
  hasNext,
  articlesHref = "",
}: ProfileArticleListProps) {
  const uniqueArticles = Array.from(
    new Map(articles.map((article) => [article.id, article])).values(),
  );

  if (uniqueArticles.length === 0) {
    return (
      <>
        <p className="profile-articles__empty">
          {lang === "en"
            ? "No articles are currently available for this profile."
            : "ამ პროფილისთვის სტატიები ვერ მოიძებნა."}
        </p>
        {page !== undefined && page > 1 && (
          <nav
            className="profile-articles__pagination"
            aria-label={
              lang === "en"
                ? "Profile article pages"
                : "პროფილის სტატიების გვერდები"
            }
          >
            <Link href={`${articlesHref}?page=${page - 1}`} rel="prev">
              {lang === "en" ? "Previous" : "წინა"}
            </Link>
            <span>
              {lang === "en" ? `Page ${page}` : `${page}`}
            </span>
          </nav>
        )}
      </>
    );
  }

  return (
    <>
      <div className="profile-articles__list">
        {uniqueArticles.map((article) => {
          const image = getArticleImage(article);

          return (
            <article
              className="profile-article"
              key={article.id}
            >
              <Link
                className="profile-article__image-link"
                href={getArticleHref(lang, article.url, article.id)}
              >
                {image ? (
                  <Image
                    className="profile-article__image"
                    src={image}
                    alt={article.title}
                    width={262}
                    height={170}
                    sizes="(max-width: 768px) 100vw, 262px"
                  />
                ) : (
                  <span
                    className="profile-article__image-fallback"
                    aria-hidden="true"
                  />
                )}
              </Link>

              <div className="profile-article__content">
                {article.publish_up && (
                  <time
                    className="profile-article__date"
                    dateTime={article.pub_dt || undefined}
                  >
                    {article.publish_up}
                  </time>
                )}
                <h3 className="profile-article__title">
                  <Link
                    href={getArticleHref(lang, article.url, article.id)}
                  >
                    {article.title}
                  </Link>
                </h3>
              </div>
            </article>
          );
        })}
      </div>

      {page !== undefined && (
        <nav
          className="profile-articles__pagination"
          aria-label={
            lang === "en"
              ? "Profile article pages"
              : "პროფილის სტატიების გვერდები"
          }
        >
          {page > 1 && (
            <Link
              href={`${articlesHref}?page=${page - 1}`}
              rel="prev"
            >
              {lang === "en" ? "Previous" : "წინა"}
            </Link>
          )}
          <span>
            {lang === "en" ? `Page ${page}` : `${page}`}
          </span>
          {hasNext && (
            <Link
              href={`${articlesHref}?page=${page + 1}`}
              rel="next"
            >
              {lang === "en" ? "Next" : "შემდეგი"}
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
