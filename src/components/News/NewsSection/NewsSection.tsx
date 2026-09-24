import NewsCard from "../NewsCard/NewsCard";
import NewsRow from "../NewsRow/NewsRow";
import NewsSlider from "../NewsSlider/NewsSlider";
import SportSection from "../../SportSection/SportSection";

import type { NewsSliderArticle } from "@/lib/api/newsSlider";
import type { SportArticle } from "@/lib/api/sports";

import "./NewsSection.css";

interface NewsSectionProps {
  sliderArticles: NewsSliderArticle[];
  cardArticles: NewsSliderArticle[];
  sportArticles: SportArticle[];
  lang: string;
}

export default function NewsSection({
  sliderArticles,
  cardArticles,
  sportArticles,
  lang,
}: NewsSectionProps) {
  return (
    <section className="news-section">
      <div className="news-section__inner">
        <NewsRow>
          <NewsSlider
            articles={sliderArticles}
            lang={lang}
          />

          {cardArticles[0] && (
            <NewsCard
              article={cardArticles[0]}
              lang={lang}
            />
          )}

          {cardArticles[1] && (
            <NewsCard
              article={cardArticles[1]}
              lang={lang}
            />
          )}
        </NewsRow>

        <NewsRow>
          {cardArticles[2] && (
            <NewsCard
              article={cardArticles[2]}
              lang={lang}
            />
          )}

          {cardArticles[3] && (
            <NewsCard
              article={cardArticles[3]}
              lang={lang}
            />
          )}

          {cardArticles[4] && (
            <NewsCard
              article={cardArticles[4]}
              lang={lang}
            />
          )}
        </NewsRow>

        <NewsRow>
          {cardArticles[5] && (
            <NewsCard
              article={cardArticles[5]}
              lang={lang}
            />
          )}

          {cardArticles[6] && (
            <NewsCard
              article={cardArticles[6]}
              lang={lang}
            />
          )}

          {cardArticles[7] && (
            <NewsCard
              article={cardArticles[7]}
              lang={lang}
            />
          )}
        </NewsRow>

        <SportSection
          articles={sportArticles}
        />
      </div>
    </section>
  );
}