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

import { getSliderContent } from "@/lib/api/newsSlider";

import { getProfiles } from "@/lib/api/profiles";
import { getRssNews } from "@/lib/api/bpnNews";
import {
  getLatestNews,
  getLatestNewsPage,
} from "@/lib/api/latestNews";
import { sortByPublicationDate } from "@/lib/api/publicationDate";

import "./page.css";

import type { SupportedLanguageCode } from "@/lib/api/i18n";
import type { Metadata } from "next";
import { HOME_SEO, localizedMetadata } from "@/lib/seo";

interface HomePageProps {
  params: Promise<{
    lang: SupportedLanguageCode;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { lang } = await params;
  const seo = HOME_SEO[lang];

  return localizedMetadata(
    lang,
    "",
    seo.title,
    seo.description,
  );
}

export default async function HomePage({
  params,
}: HomePageProps) {
  const { lang } = await params;

  const [
    profilesResponse,
    sliderContent,
    rssNews,
    latestNews,
  ] = await Promise.all([
    getProfiles(lang, 1),
    getSliderContent(lang),
    getRssNews(lang),
    getLatestNews(lang, 15),
  ]);

  const [
    smallSliderArticles,
    heroArticles,
  ] = [
    sliderContent.top_small ?? [],
    sliderContent.top_big ?? [],
  ];

  const editorialArticleIds = new Set([
    ...heroArticles.map((article) => article.id),
    ...smallSliderArticles.map((article) => article.id),
  ]);

  let cardCandidates = latestNews
    .filter((article) => !editorialArticleIds.has(article.id))
    ;

  if (cardCandidates.length < 8) {
    const nextPage = await getLatestNewsPage(lang, 2);
    const uniqueNews = Array.from(
      new Map(
        [...latestNews, ...nextPage].map((article) => [
          article.id,
          article,
        ]),
      ).values(),
    );

    cardCandidates = sortByPublicationDate(
      uniqueNews,
      (article) => article.pub_dt || article.publish_up,
    ).filter(
      (article) => !editorialArticleIds.has(article.id),
    );
  }

  const localizedCardArticles = cardCandidates.slice(0, 8);

  const profiles = profilesResponse.profiles ?? [];

  const totalCount =
    profilesResponse.pagination?.total ??
    profiles.length;

  return (
    <>
      <main className="home-page">
        <h1 className="sr-only">{HOME_SEO[lang].title}</h1>
        <WrapperA>
          <div className="home-page__top">
            <div className="home-page__main">
              <HomeHeroSection
                lang={lang}
                initialArticles={heroArticles}
              />

             

              <NewsSection
                sliderArticles={smallSliderArticles}
                cardArticles={localizedCardArticles}
                sportArticles={rssNews.sport}
                lang={lang}
              />

              <SecondSlider
                articles={rssNews.bpn.articles}
                logo={rssNews.bpn.logo}
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
          block={rssNews.palitra}
        />

        <WrapperA>
          <div className="home-page__bottom-content">
            <section className="home-page__latest-news">
              <LatestNews
                lang={lang}
                initialArticles={latestNews.slice(0, 15)}
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
                position="h1"
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