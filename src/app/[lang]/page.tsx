import HomeHeroSection from "@/components/Home/HomeHeroSection/HomeHeroSection";
import HomeProfileSection from "@/components/Home/HomeProfileSection/HomeProfileSection";
import NewsSection from "@/components/News/NewsSection/NewsSection";
import SecondSlider from "@/components/Slider/SecondSlider/SecondSlider";
import SideNewsCard from "@/components/SideNewsCard/SideNewsCard";
import SideBarAd from "@/components/Ads/SideBarAd";
import WrapperA from "@/components/WrapperA/WrapperA";
import VideoCard from "@/components/Video/VideoCard/VideoCard";
import LatestNews from "@/components/LatestNews/LatestNews";
import Footer from "@/components/Footer/Footer";

import {
  getNewsCardArticles,
  getNewsSliderArticles,
} from "@/lib/api/newsSlider";

import { getProfiles } from "@/lib/api/profiles";
import { getSportArticles } from "@/lib/api/sports";
import { getBpnNews } from "@/lib/api/bpnNews";
import { getPalitraNews } from "@/lib/api/palitraNews";
import { getLatestNews } from "@/lib/api/latestNews";

import "./page.css";

interface HomePageProps {
  params: Promise<{
    lang: string;
  }>;
}

export default async function HomePage({
  params,
}: HomePageProps) {
  const { lang } = await params;

  const [
    profilesResponse,
    smallSliderArticles,
    cardArticles,
    sportArticles,
    bpnNews,
    palitraNews,
    latestNews,
  ] = await Promise.all([
    getProfiles(lang, 1),
    getNewsSliderArticles(lang),
    getNewsCardArticles(lang),
    getSportArticles(lang),
    getBpnNews(lang),
    getPalitraNews(lang),
    getLatestNews(lang, 15),
  ]);

  const profiles = profilesResponse.profiles ?? [];

  const totalCount =
    profilesResponse.pagination?.total ??
    profiles.length;

  return (
    <>
      <main className="home-page">
        <WrapperA>
          <div className="home-page__top">
            <div className="home-page__main">
              <HomeHeroSection
                lang={lang}
              />

              <NewsSection
                sliderArticles={smallSliderArticles}
                cardArticles={cardArticles}
                sportArticles={sportArticles}
                lang={lang}
              />

              <SecondSlider
                articles={bpnNews.articles}
                logo={bpnNews.logo}
              />
            </div>

            <aside className="home-page__sidebar">
              <SideNewsCard
                lang={lang}
                blockAlias="interviu"
              />

              <SideNewsCard
                lang={lang}
                blockAlias="presis-mimoxilva"
              />
            </aside>

            <aside className="home-page__ad">
              <SideBarAd
                position="adword"
                lang={lang}
              />
            </aside>
          </div>

          <HomeProfileSection
            lang={lang}
            localizedProfileCards={profiles}
            totalCount={totalCount}
          />
        </WrapperA>

        <VideoCard
          lang={lang}
          block={palitraNews}
        />

        <WrapperA>
          <div className="home-page__bottom-content">
            <section className="home-page__latest-news">
              <LatestNews
                lang={lang}
                initialArticles={latestNews}
              />
            </section>

            <aside className="home-page__remaining-blocks">
              <SideNewsCard
                lang={lang}
                showRemaining
              />
            </aside>

            <aside className="home-page__bottom-ad">
              <SideBarAd
                position="adword"
                lang={lang}
              />
            </aside>
          </div>
        </WrapperA>
      </main>

      <Footer lang={lang} />
    </>
  );
}