import "server-only";

import { unstable_cache } from "next/cache";
import type { RssCollectorBlock } from "./rssCollectors.server";

const AMBEBI_HOST = "ambebi.ge";
const DATE_CACHE_SECONDS = 1800;

function isAmbebiUrl(value?: string | null): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === AMBEBI_HOST ||
        url.hostname.endsWith(`.${AMBEBI_HOST}`))
    );
  } catch {
    return false;
  }
}

function extractPublishedDate(html: string): string | null {
  const patterns = [
    /["']datePublished["']\s*:\s*["']([^"']+)["']/i,
    /<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']+)["']/i,
  ];

  for (const pattern of patterns) {
    const value = html.match(pattern)?.[1]?.trim();
    if (value) return value;
  }

  return null;
}

function getCachedPublishedDate(url: string): Promise<string | null> {
  return unstable_cache(
    async () => {
      try {
        const response = await fetch(url, {
          headers: { Accept: "text/html" },
          next: { revalidate: DATE_CACHE_SECONDS },
          signal: AbortSignal.timeout(8000),
        });
        if (!response.ok) return null;
        return extractPublishedDate(await response.text());
      } catch {
        return null;
      }
    },
    ["ambebi-article-date", url],
    { revalidate: DATE_CACHE_SECONDS },
  )();
}

function isAmbebiBlock(block: RssCollectorBlock): boolean {
  if (block.position !== "main_page_fixed_right_column") return false;

  try {
    const value = /^https?:\/\//i.test(block.domain)
      ? block.domain
      : `https://${block.domain}`;
    const hostname = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return hostname === AMBEBI_HOST;
  } catch {
    return false;
  }
}

export async function addAmbebiPublicationDates(
  blocks: RssCollectorBlock[],
): Promise<RssCollectorBlock[]> {
  return Promise.all(
    blocks.map(async (block) => {
      if (!isAmbebiBlock(block)) return block;

      const items = await Promise.all(
        block.items.map(async (item) => {
          if (typeof item.pubDate === "string" && item.pubDate.trim()) {
            return item;
          }
          const url = typeof item.link === "string" ? item.link : "";
          if (!isAmbebiUrl(url)) return item;

          const datePublished = await getCachedPublishedDate(url);
          return datePublished ? { ...item, datePublished } : item;
        }),
      );

      return { ...block, items };
    }),
  );
}
