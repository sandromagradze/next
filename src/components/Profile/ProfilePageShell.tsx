import type { ReactNode } from "react";

import SideBarAd from "@/components/Ads/SideBarAd";
import ArticleSidebar from "@/components/ArticleSidebar/ArticleSidebar";
import Footer from "@/components/Footer/Footer";
import WrapperA from "@/components/WrapperA/WrapperA";
import {
  getCategoryBlocks,
  getLatestNews as getSidebarLatestNews,
  type CategoryBlock,
  type SidebarArticle,
} from "@/lib/api/articleSidebar";
import { getCategoryNewsPage } from "@/lib/api/categoryNews.server";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { getCategoryIdByAlias } from "@/lib/categoryRoutes";
import type { RssBlock } from "@/lib/api/rss";
import { getCachedRssBlocks } from "@/lib/api/rssCollectors.server";

export default async function ProfilePageShell({
  children,
  showFooter = false,
  lang,
}: {
  children: ReactNode;
  showFooter?: boolean;
  lang: SupportedLanguageCode;
}) {
  let categoryBlocks: CategoryBlock[] = [];
  let latestNews: SidebarArticle[] = [];
  let rssBlocks: RssBlock[] = [];
  let viewpointArticles: SidebarArticle[] = [];

  const viewpointCategoryId = getCategoryIdByAlias(
    "viewpoint",
    lang,
  );
  const [
    sidebarDataResult,
    rssResult,
    viewpointResult,
  ] = await Promise.allSettled([
    Promise.all([
      getCategoryBlocks(lang),
      getSidebarLatestNews(lang, 1, 0),
    ]),
    getCachedRssBlocks(lang),
    viewpointCategoryId === null
      ? Promise.resolve(null)
      : getCategoryNewsPage(lang, viewpointCategoryId, 1),
  ]);

  if (sidebarDataResult.status === "fulfilled") {
    [categoryBlocks, latestNews] = sidebarDataResult.value;
  } else {
    console.error(
      "Failed to load profile sidebar data:",
      sidebarDataResult.reason,
    );
  }

  if (rssResult.status === "fulfilled") {
    rssBlocks = rssResult.value;
  } else {
    console.error(
      "Failed to load profile sidebar RSS blocks:",
      rssResult.reason,
    );
  }

  if (viewpointResult.status === "fulfilled" && viewpointResult.value) {
    viewpointArticles = viewpointResult.value.results;
  } else if (viewpointResult.status === "rejected") {
    console.error(
      "Failed to load viewpoint sidebar articles:",
      viewpointResult.reason,
    );
  }

  return (
    <>
      <main
        className={`profile-page${showFooter ? " profile-page--with-footer" : ""}`}
      >
        <WrapperA>
          <div className="profile-page__layout">
            <div className="profile-page__main">{children}</div>

            <aside className="profile-page__sidebar">
              <ArticleSidebar
                blocks={categoryBlocks}
                latestNews={latestNews}
                rssBlocks={rssBlocks}
                lang={lang}
                viewpointArticles={viewpointArticles}
                showLatestNewsDates
                showSectionLinks
                includeBtuAi
                includeRss={false}
              />
            </aside>

            <aside
              className="profile-page__ad"
              aria-label="Advertisement"
            >
              <SideBarAd position="adword" lang={lang} />
            </aside>
          </div>
        </WrapperA>
      </main>
      {showFooter && <Footer lang={lang} />}
    </>
  );
}
