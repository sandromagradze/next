import type { Metadata } from "next";

import ArticleSidebar from "@/components/ArticleSidebar/ArticleSidebar";
import Footer from "@/components/Footer/Footer";
import LatestNews from "@/components/LatestNews/LatestNews";
import SideBarAd from "@/components/Ads/SideBarAd";
import WrapperA from "@/components/WrapperA/WrapperA";
import { getCategoryBlocks, getLatestNews as getSidebarLatestNews } from "@/lib/api/articleSidebar";
import type { LatestNewsItem } from "@/lib/api/latestNews";
import { getCategoryNewsPage } from "@/lib/api/categoryNews.server";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { getCachedRssBlocks } from "@/lib/api/rssCollectors.server";
import { fetchMenu } from "@/lib/api/menu";
import { localizedMetadata } from "@/lib/seo";

import "./CategoryListingPage.scss";

interface CategoryIdentity {
  id: number;
  alias: string;
}

interface CategoryListingPageProps extends CategoryIdentity {
  lang: SupportedLanguageCode;
}

function getTitleFromStories(
  stories: LatestNewsItem[],
  categoryId: number,
): string | undefined {
  return stories
    .flatMap((story) => story.categories ?? [])
    .find((category) => Number(category.id) === categoryId)
    ?.title;
}

export async function getCategoryTitle(
  lang: SupportedLanguageCode,
  category: CategoryIdentity,
  stories: LatestNewsItem[] = [],
): Promise<string> {
  try {
    const menu = await fetchMenu(lang);
    const menuTitle = menu.menu.find((item) =>
      item.link.includes(`/category/${category.id}-`),
    )?.text.trim();

    if (menuTitle) {
      return menuTitle;
    }
  } catch {
    // Fall back to the article's localized category or URL alias.
  }

  return (
    getTitleFromStories(stories, category.id) ??
    category.alias.replace(/-/g, " ")
  );
}

export function parseCategorySlug(
  slug: string,
): CategoryIdentity | null {
  const match = slug.match(/^(\d+)-(.+)$/);
  const id = Number(match?.[1]);
  const alias = match?.[2];

  if (!Number.isInteger(id) || id < 1 || !alias) {
    return null;
  }

  return { id, alias };
}

export async function generateCategoryMetadata(
  lang: SupportedLanguageCode,
  slug: string,
  canonicalPath = `category/${slug}`,
): Promise<Metadata> {
  const category = parseCategorySlug(slug);

  if (!category) {
    return {};
  }

  const title = await getCategoryTitle(lang, category);

  return localizedMetadata(
    lang,
    canonicalPath,
    title,
    lang === "en"
      ? `The latest ${title} news.`
      : `${title} — უახლესი ამბები.`,
    { robots: { index: false, follow: true } },
  );
}

export default async function CategoryListingPage({
  lang,
  id,
  alias,
}: CategoryListingPageProps) {
  const [
    categoryNewsPage,
    sidebarBlocks,
    sidebarLatestNews,
    rssBlocks,
  ] = await Promise.all([
    getCategoryNewsPage(lang, id, 1),
    getCategoryBlocks(lang),
    getSidebarLatestNews(lang, 1, 0),
    getCachedRssBlocks(lang),
  ]);

  const initialArticles = Array.from(
    new Map(
      categoryNewsPage.results
        .filter((article) =>
          article.categories?.some(
            (category) =>
              Number(category.id) === Number(id) ||
              category.alias === alias,
          ) === true,
        )
        .map((article) => [article.id, article]),
    ).values(),
  );
  const title = await getCategoryTitle(
    lang,
    { id, alias },
    categoryNewsPage.results,
  );

  return (
    <>
      <main className="category-page">
        <WrapperA>
          <div className="category-page__layout">
            <section className="category-page__main">
              <h1 className="category-page__title">{title}</h1>
              <LatestNews
                key={`category-${lang}-${id}`}
                lang={lang}
                initialArticles={initialArticles}
                categoryId={id}
                categoryAlias={alias}
              />
            </section>

            <div className="category-page__sidebar">
              <ArticleSidebar
                blocks={sidebarBlocks}
                latestNews={sidebarLatestNews}
                rssBlocks={rssBlocks}
                lang={lang}
                eagerFirstInterviewImage
              />
            </div>

            <aside
              className="category-page__ad"
              aria-label="Advertisement"
            >
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
