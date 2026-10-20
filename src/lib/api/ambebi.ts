import { parsePublicationDate } from "@/lib/api/publicationDate";
import type { RssBlock, RssItem } from "@/lib/api/rss";

export function getAmbebiHostname(value: string): string | null {
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function getAmbebiTimestamp(item: RssItem): number {
  const rssTimestamp = parsePublicationDate(item.pubDate);
  if (Number.isFinite(rssTimestamp)) return rssTimestamp;

  const value = item.datePublished?.trim();
  const match = value?.match(
    /^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2})(?::(\d{2}))?)?$/,
  );
  if (!match) return Number.NEGATIVE_INFINITY;

  const [, day, month, year, hour = "0", minute = "0", second = "0"] = match;
  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  const hourNumber = Number(hour);
  const minuteNumber = Number(minute);
  const secondNumber = Number(second);
  if (hourNumber > 23 || minuteNumber > 59 || secondNumber > 59) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = Date.UTC(
    yearNumber,
    monthNumber - 1,
    dayNumber,
    hourNumber,
    minuteNumber,
    secondNumber,
  );
  const parsed = new Date(timestamp);
  if (
    parsed.getUTCFullYear() !== yearNumber ||
    parsed.getUTCMonth() !== monthNumber - 1 ||
    parsed.getUTCDate() !== dayNumber
  ) {
    return Number.NEGATIVE_INFINITY;
  }

  // Ambebi datePublished values without a timezone are Georgian local time.
  return timestamp - 4 * 60 * 60 * 1000;
}

function getCanonicalArticleUrl(value?: string | null): string | null {
  if (!value?.trim()) return null;

  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;

    url.hash = "";
    for (const key of Array.from(url.searchParams.keys())) {
      if (/^(utm_.+|fbclid|gclid|yclid)$/i.test(key)) {
        url.searchParams.delete(key);
      }
    }
    url.searchParams.sort();
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return null;
  }
}

export function getLatestAmbebiItems(block: RssBlock | undefined): RssItem[] {
  if (!block) return [];

  const uniqueByUrl = new Map<string, { item: RssItem; timestamp: number }>();
  for (const item of block.items ?? []) {
    if (!item.title?.trim()) continue;

    const canonicalUrl = getCanonicalArticleUrl(item.link);
    const hostname = item.link ? getAmbebiHostname(item.link) : null;
    if (
      !canonicalUrl ||
      !hostname ||
      (hostname !== "ambebi.ge" && !hostname.endsWith(".ambebi.ge"))
    ) {
      continue;
    }

    const timestamp = getAmbebiTimestamp(item);
    const existing = uniqueByUrl.get(canonicalUrl);
    if (
      !existing ||
      timestamp > existing.timestamp ||
      (timestamp === existing.timestamp &&
        item.title.localeCompare(existing.item.title ?? "") < 0)
    ) {
      uniqueByUrl.set(canonicalUrl, { item, timestamp });
    }
  }

  return Array.from(uniqueByUrl.entries())
    .sort(([firstUrl, first], [secondUrl, second]) => {
      const firstDated = Number.isFinite(first.timestamp);
      const secondDated = Number.isFinite(second.timestamp);
      if (firstDated !== secondDated) return firstDated ? -1 : 1;
      if (firstDated && secondDated && first.timestamp !== second.timestamp) {
        return second.timestamp - first.timestamp;
      }
      return firstUrl.localeCompare(secondUrl);
    })
    .slice(0, 3)
    .map(([, value]) => value.item);
}

export function getAmbebiPublicationDateTime(item: RssItem): string | undefined {
  const timestamp = getAmbebiTimestamp(item);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}

export function formatAmbebiPublicationDate(item: RssItem): string {
  const timestamp = getAmbebiTimestamp(item);
  if (!Number.isFinite(timestamp)) {
    return item.pubDate?.trim() || item.datePublished?.trim() || "";
  }

  return new Intl.DateTimeFormat("ka-GE", {
    timeZone: "Asia/Tbilisi",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}
