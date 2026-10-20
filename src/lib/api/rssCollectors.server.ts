import "server-only";
import { unstable_cache } from "next/cache";
import type { SupportedLanguageCode } from "./i18n";
import type { RssBlock } from "./rss";
import { sortByPublicationDate } from "./publicationDate";

const API_BASE = "https://dev.ipn.ge";
const CACHE_SECONDS = 30;

export interface RssCollectorItem {
  pubDate?: string | null;
  [key: string]: unknown;
}

export interface RssCollectorBlock {
  domain: string;
  id: number;
  items: RssCollectorItem[];
  logo?: string | null;
  position?: string | null;
  [key: string]: unknown;
}

interface RssCollectorsResponse {
  blocks: RssCollectorBlock[];
}

async function fetchRssCollectors(
  lang: SupportedLanguageCode,
): Promise<RssCollectorBlock[]> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/rss/collectors/fetch-active/`,
    {
      method: "POST",
      headers: { Accept: "*/*" },
      body: "",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `RSS collectors API error: ${response.status}`,
    );
  }

  const data =
    (await response.json()) as RssCollectorsResponse;

  if (!Array.isArray(data.blocks)) {
    throw new Error("Invalid RSS collectors response");
  }

  return data.blocks;
}

export function getCachedRssCollectors(
  lang: SupportedLanguageCode,
): Promise<RssCollectorBlock[]> {
  return unstable_cache(
    () => fetchRssCollectors(lang),
    ["rss-collectors-fetch-active", lang],
    {
      revalidate: CACHE_SECONDS,
      tags: [`rss-collectors-${lang}`],
    },
  )();
}

export async function getCachedRssBlocks(
  lang: SupportedLanguageCode,
): Promise<RssBlock[]> {
  const blocks = await getCachedRssCollectors(lang);

  return blocks.map((block) => ({
    ...block,
    items: sortByPublicationDate(
      block.items ?? [],
      (item) => item.pubDate,
    ),
  })) as unknown as RssBlock[];
}
