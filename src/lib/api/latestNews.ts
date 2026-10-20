import "server-only";

import type { SupportedLanguageCode } from "./i18n";
import { unstable_cache } from "next/cache";
import { sortByPublicationDate } from "./publicationDate";

const API_BASE = "https://www.interpressnews.ge";
const CACHE_SECONDS = 30;

export interface LatestNewsImage {
  original: string;
  thumb: string;
  webp: string;
  position?: [number, number];
}

export interface LatestNewsCategory {
  id?: number;
  alias?: string;
  title?: string;
}

export interface LatestNewsItem {
  alias: string;
  id: number;
  title: string;
  introtext: string;
  publish_up: string;
  pub_dt?: string;
  image: LatestNewsImage | null;
  url: string;
  video?: unknown;
  categories?: LatestNewsCategory[];
}

export interface CategoryNewsPage {
  alias: string;
  id: number;
  pagination: {
    page: number;
  };
  results: LatestNewsItem[];
}

interface LatestNewsResponse {
  results: (LatestNewsItem | null)[];
}

type NewsCacheMode = "no-store" | "revalidate";

function sortLatestNews(
  results: (LatestNewsItem | null)[],
): LatestNewsItem[] {
  return sortByPublicationDate(
    results.filter(
      (item): item is LatestNewsItem =>
        item !== null,
    ),
    (item) => item.pub_dt || item.publish_up,
  );
}

/**
 * ერთი API page-ის წამოღება.
 */
export async function getLatestNewsPage(
  lang: SupportedLanguageCode,
  page: number,
  cacheMode: NewsCacheMode = "no-store",
): Promise<LatestNewsItem[]> {
  // The shared 30-second server cache is fresher than the sitemap's
  // previous one-hour fetch revalidation and is shared by all consumers.
  void cacheMode;

  const results = await getCachedLatestNewsPage(lang, page);
  return sortLatestNews(results);
}

async function fetchLatestNewsPage(
  lang: SupportedLanguageCode,
  page: number,
): Promise<(LatestNewsItem | null)[]> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/latestnews/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: `offset=0&page=${page}`,
      cache: "no-store",
    },
  );

  if (!response.ok) {
    console.error(
      `[LatestNews] Request failed: status=${response.status} statusText=${response.statusText} url=${response.url}`,
    );

    throw new Error(
      `Latest news request failed: ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray((data as LatestNewsResponse).results)
  ) {
    throw new Error("Invalid latest news response");
  }

  return (data as LatestNewsResponse).results;
}

function getCachedLatestNewsPage(
  lang: SupportedLanguageCode,
  page: number,
): Promise<(LatestNewsItem | null)[]> {
  return unstable_cache(
    () => fetchLatestNewsPage(lang, page),
    ["latest-news", lang, String(page)],
    {
      revalidate: CACHE_SECONDS,
      tags: [`latest-news-${lang}`],
    },
  )();
}

/**
 * Fetches the requested number of unique latest-news records.
 *
 * The API exposes page and record offset, but no page total, limit, or
 * ordering guarantee. Sorting guarantees newest-first only among the
 * records fetched; callers should keep pagination bounded.
 */
export async function getLatestNews(
  lang: SupportedLanguageCode,
  visibleCount = 15,
  cacheMode: NewsCacheMode = "no-store",
): Promise<LatestNewsItem[]> {
  const allNews: LatestNewsItem[] = [];

  let page = 1;

  while (
    new Set(allNews.map((item) => item.id)).size <
    visibleCount
  ) {
    const news = await getLatestNewsPage(
      lang,
      page,
      cacheMode,
    );

    if (news.length === 0) {
      break;
    }

    allNews.push(...news);

    page++;
  }

  const uniqueNews = Array.from(
    new Map(
      allNews.map((item) => [item.id, item]),
    ).values(),
  );

  return sortByPublicationDate(
    uniqueNews,
    (item) => item.pub_dt || item.publish_up,
  ).slice(0, visibleCount);
}
