import "server-only";

import { unstable_cache } from "next/cache";

import type { CategoryNewsPage } from "./latestNews";
import type { SupportedLanguageCode } from "./i18n";
import { sortByPublicationDate } from "./publicationDate";

const API_BASE = "https://www.interpressnews.ge";
const CACHE_SECONDS = 30;

async function fetchCategoryNewsPage(
  lang: SupportedLanguageCode,
  categoryId: number,
  page: number,
): Promise<CategoryNewsPage> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/category/${categoryId}/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
        lang,
      },
      body: new URLSearchParams({ page: String(page) }).toString(),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Category news request failed: ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== "object") {
    throw new Error("Invalid category news response");
  }

  const result = data as Partial<CategoryNewsPage>;

  if (
    typeof result.alias !== "string" ||
    Number(result.id) !== categoryId ||
    !result.pagination ||
    Number(result.pagination.page) !== page ||
    !Array.isArray(result.results)
  ) {
    throw new Error("Invalid category news response");
  }

  return {
    alias: result.alias,
    id: Number(result.id),
    pagination: { page: Number(result.pagination.page) },
    results: sortByPublicationDate(
      result.results,
      (article) => article.pub_dt || article.publish_up,
    ),
  };
}

export function getCategoryNewsPage(
  lang: SupportedLanguageCode,
  categoryId: number,
  page: number,
): Promise<CategoryNewsPage> {
  return unstable_cache(
    () => fetchCategoryNewsPage(lang, categoryId, page),
    ["category-news", lang, String(categoryId), String(page)],
    {
      revalidate: CACHE_SECONDS,
      tags: [`category-news-${lang}-${categoryId}`],
    },
  )();
}
