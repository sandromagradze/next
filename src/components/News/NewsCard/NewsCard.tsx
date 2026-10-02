import Image from "next/image";
import Link from "next/link";

import type { LatestNewsItem } from "@/lib/api/latestNews";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

import "./NewsCard.css";

interface NewsCardProps {
  article: LatestNewsItem;
  lang: SupportedLanguageCode;
  eager?: boolean;
}

export default function NewsCard({
  article,
  lang,
  eager = false,
}: NewsCardProps) {
  const imageUrl =
    article.image?.webp ||
    article.image?.original ||
    "";

  const articleUrl = article.url
    ? `/${lang}${article.url}`
    : `/${lang}/article/${article.id}`;

  return (
    <article className="news-card">
      <Link
        href={articleUrl}
        className="news-card__link"
      >
        <div className="news-card__image">
          {imageUrl && (
            <Image
              src={imageUrl}
              alt={article.title}
              width={230}
              height={130}
              loading={eager ? "eager" : undefined}
              sizes="(max-width: 768px) calc(100vw - 32px), 230px"
            />
          )}
        </div>

        <time className="news-card__time">
          {article.publish_up}
        </time>

        <h3 className="news-card__title">
          {article.title}
        </h3>
      </Link>
    </article>
  );
}