import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import WrapperA from "@/components/WrapperA/WrapperA";
import ArticleSidebar from "@/components/ArticleSidebar/ArticleSidebar";
import RssSidebar from "@/components/RssSidebar/RssSidebar";
import Footer from "@/components/Footer/Footer";

import {
  getArticleById,
  type NewsArticle,
} from "@/lib/api/newsSlider";

import {
  getCategoryBlocks,
  getLatestNews,
} from "@/lib/api/articleSidebar";
import { getRssBlocks } from "@/lib/api/rss";

import type { SupportedLanguageCode } from "@/lib/api/i18n";

import {
  absoluteUrl,
  localizedMetadata,
  localizedPath,
  SITE_NAME,
  SITE_URL,
  stripHtml,
  JsonLd,
} from "@/lib/seo";

import "./ArticlePage.css";

interface ArticlePageProps {
  params: Promise<{
    lang: SupportedLanguageCode;
    slug: string;
  }>;
}

function getArticleId(
  slug: string,
): number | null {
  const match = slug.match(/^\d+/);

  const id = match
    ? Number(match[0])
    : NaN;

  return Number.isInteger(id) && id > 0
    ? id
    : null;
}

function getArticlePath(
  article: NewsArticle,
): string {
  const url = article.url?.trim() || "";

  return (
    url.replace(/^\/+/, "") ||
    `article/${article.id}`
  );
}

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { lang, slug } = await params;

  const id = getArticleId(slug);

  if (!id) {
    return {
      title:
        lang === "en"
          ? "Article not found"
          : "სტატია ვერ მოიძებნა",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const article =
    await getArticleById(lang, id);

  if (!article) {
    return localizedMetadata(
      lang,
      `article/${slug}`,
      lang === "en"
        ? "Article not found"
        : "სტატია ვერ მოიძებნა",
      lang === "en"
        ? "The requested article could not be found."
        : "მოთხოვნილი სტატია ვერ მოიძებნა.",
      {
        robots: {
          index: false,
          follow: false,
        },
      },
    );
  }

  const path = getArticlePath(article);

  const image =
    article.image?.original ||
    article.image?.webp ||
    undefined;

  const otherLanguage: SupportedLanguageCode =
    lang === "en"
      ? "ka"
      : "en";

  const alternateArticle =
    await getArticleById(
      otherLanguage,
      id,
    );

  const metadata = localizedMetadata(
    lang,
    path,
    article.title,
    stripHtml(
      article.introtext,
    ) || article.title,
    {
      openGraph: {
        type: "article",
        publishedTime:
          article.pub_dt ||
          undefined,
        images: image
          ? [
              {
                url: image,
                alt: article.title,
              },
            ]
          : undefined,
      },
    },
  );

  if (alternateArticle) {
    metadata.alternates = {
      canonical: absoluteUrl(
        localizedPath(
          lang,
          path,
        ),
      ),
      languages: {
        [lang]: absoluteUrl(
          localizedPath(
            lang,
            path,
          ),
        ),

        [otherLanguage]:
          absoluteUrl(
            localizedPath(
              otherLanguage,
              getArticlePath(
                alternateArticle,
              ),
            ),
          ),
      },
    };
  }

  return metadata;
}

export default async function ArticlePage({
  params,
}: ArticlePageProps) {
  const { lang, slug } =
    await params;

  const id = getArticleId(slug);

  if (!id) {
    notFound();
  }

  const [
    article,
    blocks,
    latestNews,
    rssBlocks,
  ] = await Promise.all([
    getArticleById(lang, id),

    getCategoryBlocks(lang),

    getLatestNews(
      lang,
      1,
      0,
    ),

    getRssBlocks(lang),
  ]);

  if (!article) {
    notFound();
  }

  const path =
    getArticlePath(article);

  const canonicalUrl =
    absoluteUrl(
      localizedPath(
        lang,
        path,
      ),
    );

  const image =
    article.image?.original ||
    article.image?.webp ||
    undefined;

  const articleSection =
    article.categories
      ?.map(
        (category) =>
          category.title,
      )
      .filter(
        (
          title,
        ): title is string =>
          Boolean(title),
      );

  return (
    <>
      <main className="article-page">
      <WrapperA>
        <div className="article-page__layout">

          {/* Main article content */}
          <article className="article-page__article">

            <header className="article-page__header">
              <div className="article-page__meta">
                {articleSection?.[0] && (
                  <div className="article-page__category">
                    {articleSection[0]}
                  </div>
                )}

                {article.publish_up && (
                  <time
                    className="article-page__date"
                    dateTime={
                      article.pub_dt ||
                      undefined
                    }
                  >
                    {article.publish_up}
                  </time>
                )}
              </div>

              <h1 className="article-page__title">
                {article.title}
              </h1>
            </header>

            {image && (
              <figure className="article-page__image-wrapper">
                <Image
                  className="article-page__image"
                  src={image}
                  alt={article.title}
                  width={724}
                  height={543}
                  priority
                  sizes="724px"
                />
              </figure>
            )}

            <div
              className="article-page__body"
              dangerouslySetInnerHTML={{
                __html:
                  article.fulltext ||
                  article.introtext ||
                  "",
              }}
            />

            <div className="article-page__rss">
              <RssSidebar
                blocks={rssBlocks}
                position="article_page_center_column"
              />
            </div>

          </article>

          {/* Right sidebar */}
          <ArticleSidebar
            blocks={blocks}
            latestNews={latestNews}
            rssBlocks={rssBlocks}
            lang={lang}
          />

        </div>
      </WrapperA>

      <JsonLd
        data={{
          "@context":
            "https://schema.org",

          "@type":
            "NewsArticle",

          headline:
            article.title,

          description:
            stripHtml(
              article.introtext,
            ) ||
            article.title,

          url: canonicalUrl,

          mainEntityOfPage: {
            "@type":
              "WebPage",

            "@id":
              canonicalUrl,
          },

          ...(image
            ? {
                image: [image],
              }
            : {}),

          ...(article.pub_dt
            ? {
                datePublished:
                  article.pub_dt,
              }
            : {}),

          ...(articleSection?.length
            ? {
                articleSection,
              }
            : {}),

          publisher: {
            "@type":
              "Organization",

            name:
              SITE_NAME,

            url:
              SITE_URL,

            logo: {
              "@type":
                "ImageObject",

              url:
                `${SITE_URL}/logo.svg`,
            },
          },
        }}
      />
      </main>
      <Footer lang={lang} />
    </>
  );
}
