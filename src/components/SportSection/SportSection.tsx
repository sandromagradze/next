import Image from "next/image";

import type { SportArticle } from "@/lib/api/sports";

import "./SportSection.css";

interface SportSectionProps {
  articles: SportArticle[];
}

export default function SportSection({
  articles,
}: SportSectionProps) {
  return (
    <section className="sport-section">
      <h2 className="sport-section__title">
        სპორტი
      </h2>

      <div className="sport-section__cards">
        {articles.map((article) => {
          const imageUrl = article.original_image.replace(
            "http://",
            "https://"
          );

          return (
            <article
              className="sport-card"
              key={article.link}
            >
              <a
                href={article.link}
                className="sport-card__link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="sport-card__image">
                  <Image
                    src={imageUrl}
                    alt={article.title}
                    width={170}
                    height={96}
                  />
                </div>

                <div className="sport-card__title">
                  {article.title}
                </div>
              </a>
            </article>
          );
        })}
      </div>

      <div className="sport-section__partner">
        <a
          href="http://sportall.ge"
          className="sport-section__partner-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          პარტნიორია sportall.ge
        </a>
      </div>
    </section>
  );
}