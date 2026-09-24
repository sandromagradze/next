import Image from "next/image";
import Link from "next/link";

import type { NewsSliderArticle } from "@/lib/api/newsSlider";

import "./NewsCard.css";

interface NewsCardProps {
  article: NewsSliderArticle;
  lang: string;
}

export default function NewsCard({
  article,
  lang,
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