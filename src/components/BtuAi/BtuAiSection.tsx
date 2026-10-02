import Image from "next/image";

import type { BtuAiArticle } from "@/lib/api/btuAi";
import {
  getBestRssImage,
  getRssImageUrl,
  getRssItemTime,
} from "@/lib/api/rss";

import "./BtuAiSection.css";

interface BtuAiSectionProps {
  articles: BtuAiArticle[];
}

const BTU_AI_URL = "https://btuai.ge/";

const BTU_AI_LOGO =
  "https://dev.ipn.ge/static/img/btu_ai_logo.png";

function normalizeBtuImage(
  image: string,
): string {
  const value = image.trim();

  if (!value) {
    return "";
  }

  return getRssImageUrl(value);
}

export default function BtuAiSection({
  articles,
}: BtuAiSectionProps) {
  if (!articles.length) {
    return null;
  }

  return (
    <section className="btu-ai-section">
      <a
        href={BTU_AI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btu-ai-section__header"
        aria-label="ბიზნესისა და ტექნოლოგიების უნივერსიტეტი"
      >
        <Image
          src={BTU_AI_LOGO}
          alt="ბიზნესისა და ტექნოლოგიების უნივერსიტეტი"
          width={234}
          height={62}
          sizes="234px"
          className="btu-ai-section__logo"
        />

        <h2 className="btu-ai-section__university">
          ბიზნესისა და ტექნოლოგიების უნივერსიტეტი
        </h2>
      </a>

      <div className="btu-ai-section__items">
        {articles.map((article, index) => {
          const title =
            article.title?.trim() || "";

          const time =
            getRssItemTime(article);

          const rawImage =
            getBestRssImage(article);

          const image =
            rawImage
              ? normalizeBtuImage(rawImage)
              : "";

          if (
            !title ||
            !article.link
          ) {
            return null;
          }

          return (
            <article
              key={`${article.link}-${index}`}
              className="btu-ai-block"
            >
              <a
                href={article.link}
                target="_blank"
                rel="noopener noreferrer"
                className="btu-ai-block__link"
              >
                {image && (
                  <Image
                    src={image}
                    alt={title}
                    width={234}
                    height={302}
                    sizes="234px"
                    className="btu-ai-block__image"
                  />
                )}

                {time && (
                  <time className="btu-ai-time">
                    {time}
                  </time>
                )}

                <p className="btu-ai-title">
                  {title}
                </p>
              </a>
            </article>
          );
        })}
      </div>
    </section>
  );
}