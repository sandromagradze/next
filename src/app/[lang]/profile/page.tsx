import type { Metadata } from "next";

import ProfileListing from "@/components/Profile/ProfileListing";
import SideBarAd from "@/components/Ads/SideBarAd";
import ArticleSidebar from "@/components/ArticleSidebar/ArticleSidebar";
import WrapperA from "@/components/WrapperA/WrapperA";
import {
  getCategoryBlocks,
  getLatestNews as getSidebarLatestNews,
  type CategoryBlock,
  type SidebarArticle,
} from "@/lib/api/articleSidebar";
import { getCategoryNewsPage } from "@/lib/api/categoryNews.server";
import { getCategoryIdByAlias } from "@/lib/categoryRoutes";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import {
  getAllProfiles,
  getProfileImage,
  type Profile,
} from "@/lib/api/profiles";
import type { RssBlock } from "@/lib/api/rss";
import { getCachedRssBlocks } from "@/lib/api/rssCollectors.server";
import { localizedMetadata } from "@/lib/seo";

import "./ProfilePage.scss";

interface ProfilePageProps {
  params: Promise<{
    lang: SupportedLanguageCode;
  }>;
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
  }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { lang } = await params;
  const title = lang === "en" ? "Profiles" : "პროფილები";
  const description =
    lang === "en"
      ? "Profiles and biographies published by InterPressNews."
      : "ინტერპრესნიუსის მიერ გამოქვეყნებული პროფილები და ბიოგრაფიები.";

  return localizedMetadata(lang, "profile", title, description);
}

export default async function ProfilePage({
  params,
  searchParams,
}: ProfilePageProps) {
  const [{ lang }, query] = await Promise.all([params, searchParams]);

  let profiles: Profile[] = [];
  let latestNews: SidebarArticle[] = [];
  let categoryBlocks: CategoryBlock[] = [];
  let rssBlocks: RssBlock[] = [];
  let viewpointArticles: SidebarArticle[] = [];
  const viewpointCategoryId = getCategoryIdByAlias("viewpoint", lang);
  const [profilesResult, sidebarDataResult, rssResult, viewpointResult] = await Promise.allSettled([
    getAllProfiles(lang),
    Promise.all([
      getCategoryBlocks(lang),
      getSidebarLatestNews(lang, 1, 0),
    ]),
    getCachedRssBlocks(lang),
    viewpointCategoryId === null
      ? Promise.resolve(null)
      : getCategoryNewsPage(lang, viewpointCategoryId, 1),
  ]);

  if (profilesResult.status === "fulfilled") {
    profiles = profilesResult.value;
  } else {
    console.error("Failed to load profiles:", profilesResult.reason);
  }

  if (sidebarDataResult.status === "fulfilled") {
    [categoryBlocks, latestNews] = sidebarDataResult.value;
  } else {
    console.error("Failed to load profile sidebar data:", sidebarDataResult.reason);
  }

  if (rssResult.status === "fulfilled") {
    rssBlocks = rssResult.value;
  } else {
    console.error("Failed to load profile sidebar RSS blocks:", rssResult.reason);
  }

  if (viewpointResult.status === "fulfilled" && viewpointResult.value) {
    viewpointArticles = viewpointResult.value.results;
  } else if (viewpointResult.status === "rejected") {
    console.error("Failed to load viewpoint sidebar articles:", viewpointResult.reason);
  }

  const pageSize = 15;
  const pageCount = Math.max(1, Math.ceil(profiles.length / pageSize));
  const requestedPage = Array.isArray(query.page) ? query.page[0] : query.page;
  const parsedPage = Number(requestedPage ?? 1);
  const currentPage = Number.isInteger(parsedPage)
    ? Math.min(Math.max(parsedPage, 1), pageCount)
    : 1;
  const requestedQuery = Array.isArray(query.q) ? query.q[0] : query.q;
  const initialQuery = requestedQuery ?? "";
  return (
    <main className="profile-page">
      <WrapperA>
        <div className="profile-page__layout">
          <ProfileListing
            key={`${currentPage}:${initialQuery}`}
            profiles={profiles.map((profile) => ({
              id: profile.id,
              alias: profile.alias,
              image: getProfileImage(profile),
              title: profile.title,
              position: profile.position ?? "",
            }))}
            lang={lang}
            initialPage={currentPage}
            initialQuery={initialQuery}
          />

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

          <aside className="profile-page__ad" aria-label="Advertisement">
            <SideBarAd position="adword" lang={lang} />
          </aside>
        </div>
      </WrapperA>
    </main>
  );
}
