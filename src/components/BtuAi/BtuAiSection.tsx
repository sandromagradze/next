import type { BtuAiArticle } from "@/lib/api/btuAi";

import "./BtuAiSection.css";

interface BtuAiSectionProps {
  articles: BtuAiArticle[];
}

export default function BtuAiSection({
  articles,
}: BtuAiSectionProps) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="btu-ai-section">
      {articles.map((article) => (
        <article
          className="btu-ai-block"
          key={article.link}
        >
          <a
            href={article.link}
            target="_blank"
            rel="noopener noreferrer"
            className="btu-ai-block__link"
          >
            <div className="btu-ai-content">
              <div className="btu-ai-time">
                {article.pubDate}
              </div>

              <p className="btu-ai-title">
                {article.title}
              </p>
            </div>
          </a>
        </article>
      ))}
    </section>
  );
}