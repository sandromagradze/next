import Link from "next/link";

import type { SidebarArticle } from "@/lib/api/articleSidebar";
import { formatPublicationDateTime } from "@/lib/formatSliderPublicationTime";

import "./ArticleSidebar.scss";

interface ArticleSidebarLatestNewsProps {
  articles: Pick<SidebarArticle, "id" | "title" | "url" | "publish_up" | "pub_dt">[];
  lang: string;
  showPublicationDate?: boolean;
}

function getArticleUrl(
  lang: string,
  id: number,
  url?: string,
): string {
  const slug = url?.match(/\/article\/([^/?#]+)/)?.[1];

  return `/${lang}/article/${slug || id}`;
}

export default function ArticleSidebarLatestNews({
  articles,
  lang,
  showPublicationDate = false,
}: ArticleSidebarLatestNewsProps) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className="article-sidebar__latest">
      <header className="article-sidebar__block-header">
        <h2 className="article-sidebar__block-title">
          დღის ბოლო სიახლეები
        </h2>
      </header>

      <div className="article-sidebar__latest-list">
        {articles.slice(0, 3).map((article) => {
          const articleUrl =
            getArticleUrl(
              lang,
              article.id,
              article.url,
            );
          const publicationDateLang = lang === "en" ? "en" : "ka";
          const publicationDate =
            formatPublicationDateTime(article.pub_dt, publicationDateLang) ||
            formatPublicationDateTime(article.publish_up, publicationDateLang);

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
                {showPublicationDate && publicationDate && (
                  <time className="todaynewsdate">
                    {publicationDate}
                  </time>
                )}
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
