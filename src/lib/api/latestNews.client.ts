"use client";

import type { SupportedLanguageCode } from "./i18n";
import type { CategoryNewsPage, LatestNewsItem } from "./latestNews";
import { sortByPublicationDate } from "./publicationDate";

interface LatestNewsResponse {
  results: (LatestNewsItem | null)[];
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

  return sortByPublicationDate(
    data.results.filter(
      (item): item is LatestNewsItem =>
        item !== null,
    ),
    (item) => item.pub_dt || item.publish_up,
  );
}

export async function getCategoryNewsPageFromClient(
  lang: SupportedLanguageCode,
  categoryId: number,
  page: number,
): Promise<CategoryNewsPage> {
  const params = new URLSearchParams({
    lang,
    id: String(categoryId),
    page: String(page),
  });
  const response = await fetch(
    `/api/category-news?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      `Category news request failed: ${response.status}`,
    );
  }

  const data: CategoryNewsPage = await response.json();

  return {
    ...data,
    results: sortByPublicationDate(
      data.results,
      (article) => article.pub_dt || article.publish_up,
    ),
  };
}
