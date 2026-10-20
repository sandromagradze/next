import "server-only";
import { unstable_cache } from "next/cache";
import type { SupportedLanguageCode } from "./i18n";

const API_BASE = "https://www.interpressnews.ge";
const CACHE_SECONDS = 120;

export interface CategoryBlocksPayload {
  blocks: unknown[];
  [key: string]: unknown;
}

async function fetchCategoryBlocks(
  lang: SupportedLanguageCode,
): Promise<CategoryBlocksPayload> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/categoryblocks/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Category blocks request failed: ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray((data as { blocks?: unknown }).blocks)
  ) {
    throw new Error("Invalid category blocks response");
  }

  return data as CategoryBlocksPayload;
}

export function getCachedCategoryBlocks(
  lang: SupportedLanguageCode,
): Promise<CategoryBlocksPayload> {
  return unstable_cache(
    () => fetchCategoryBlocks(lang),
    ["category-blocks", lang],
    {
      revalidate: CACHE_SECONDS,
      tags: [`category-blocks-${lang}`],
    },
  )();
}
