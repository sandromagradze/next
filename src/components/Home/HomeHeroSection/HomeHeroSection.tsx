import SliderNews from "@/components/Slider/SliderNews/SliderNews";
import SideBarAd from "@/components/Ads/SideBarAd";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import type { SliderArticle } from "@/lib/api/slider";

import "./HomeHeroSection.css";

interface HomeHeroSectionProps {
  lang: SupportedLanguageCode;
  initialArticles: SliderArticle[];
}

export default function HomeHeroSection({
  lang,
  initialArticles,
}: HomeHeroSectionProps) {
  return (
    <section
      className="home-hero"
      aria-labelledby="main-news-heading"
    >
      <h2
        id="main-news-heading"
        className="sr-only"
      >
        Main news
      </h2>

      <div className="home-hero__slider">
        <SliderNews
          key={lang}
          lang={lang}
          initialArticles={initialArticles}
        />

        <div className="home-hero__ad-container">
          <SideBarAd
            position="b4"
            lang={lang}
          />
        </div>
      </div>
    </section>
  );
}