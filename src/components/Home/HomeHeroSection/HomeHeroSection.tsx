import SliderNews from "@/components/Slider/SliderNews/SliderNews";
import SideBarAd from "@/components/Ads/SideBarAd";

import "./HomeHeroSection.css";

interface HomeHeroSectionProps {
  lang: string;
}

export default function HomeHeroSection({
  lang,
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
        <SliderNews lang={lang} />

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