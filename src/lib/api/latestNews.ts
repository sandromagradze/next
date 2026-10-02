import type { SupportedLanguageCode } from "./i18n";
import { sortByPublicationDate } from "./publicationDate";

const API_BASE = "https://www.interpressnews.ge";

export interface LatestNewsImage {
  original: string;
  thumb: string;
  webp: string;
  position?: [number, number];
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
      ...(cacheMode === "revalidate"
        ? { next: { revalidate: 3600 } }
        : { cache: "no-store" as const }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Latest news request failed: ${response.status}`,
    );
  }

  const data: LatestNewsResponse =
    await response.json();

  return sortLatestNews(data.results);
}

export async function getLatestNewsPageFromClient(
  lang: SupportedLanguageCode,
  page: number,
): Promise<LatestNewsItem[]> {
  const params = new URLSearchParams({
    lang,
    page: String(page),
  });
  const response = await fetch(
    `/api/homepage-latestnews?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      `Latest news request failed: ${response.status}`,
    );
  }

  const data: LatestNewsResponse =
    await response.json();

  return sortLatestNews(data.results);
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