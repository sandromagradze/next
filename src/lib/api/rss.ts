import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { sortByPublicationDate } from "@/lib/api/publicationDate";

const API_BASE = "https://dev.ipn.ge";

export interface RssItemImages {
  "170x96"?: string;
  "172x104"?: string;
  "206x116"?: string;
  "234x152"?: string;
  "288x162"?: string;
  "364x206"?: string;
  [key: string]: string | undefined;
}

export interface RssItem {
  description?: string | null;
  image?: string | null;
  images?: RssItemImages | null;
  link?: string | null;
  original_image?: string | null;
  pubDate?: string | null;
  title?: string | null;
}

export interface RssBlock {
  domain: string;
  id: number;
  items: RssItem[];
  logo?: string | null;
  position?: string | null;
  slicenum?: number | null;
  title?: string | null;
  view?: string | null;
  visual?: string | null;
}

export interface RssResponse {
  blocks: RssBlock[];
}

function isRssResponse(
  value: unknown,
): value is RssResponse {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const data = value as {
    blocks?: unknown;
  };

  return Array.isArray(data.blocks);
}

export async function getRssBlocks(
  lang: SupportedLanguageCode,
): Promise<RssBlock[]> {
  const url =
    `${API_BASE}/${lang}/api/rss/collectors/fetch-active/`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "*/*",
      },
      body: "",
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `RSS request failed: ${response.status} ${response.statusText}`,
      );

      return [];
    }

    const data: unknown =
      await response.json();

    if (!isRssResponse(data)) {
      console.error(
        "RSS response has an unexpected structure.",
      );

      return [];
    }

    return data.blocks.map((block) => ({
      ...block,
      items: sortByPublicationDate(
        block.items ?? [],
        (item) => item.pubDate,
      ),
    }));
  } catch (error) {
    console.error(
      "Failed to fetch RSS blocks:",
      error,
    );

    return [];
  }
}

export function getRssImageUrl(
  image?: unknown,
): string {
  if (typeof image !== "string") {
    return "";
  }

  let value = image.trim().replace(
    /^['"]|['"]$/g,
    "",
  );

  if (!value) {
    return "";
  }

  if (
    /^(?:null|undefined|\[object object\])$/i.test(
      value,
    )
  ) {
    return "";
  }

  const proxiedExternalPrefix =
    "/media/__rss__/";

  if (
    value
      .toLowerCase()
      .startsWith(proxiedExternalPrefix)
  ) {
    value = value.slice(
      proxiedExternalPrefix.length,
    );
  } else if (
    value.startsWith("__rss__/")
  ) {
    value = `/media/${value}`;
  }

  if (value.startsWith("//")) {
    value = `https:${value}`;
  }

  try {
    const url = new URL(
      value,
      `${API_BASE}/`,
    );

    if (
      url.protocol !== "http:" &&
      url.protocol !== "https:"
    ) {
      return "";
    }

    return url.href;
  } catch {
    return "";
  }
}

export function getBestRssImage(
  item: RssItem,
  excludedUrls: readonly string[] = [],
): string | null {
  const preferredImageSizes = [
    "364x206",
    "288x162",
    "234x152",
    "206x116",
    "172x104",
    "170x96",
  ];

  const images =
    item.images &&
    typeof item.images === "object" &&
    !Array.isArray(item.images)
      ? item.images
      : null;

  const preferredImages = preferredImageSizes.map(
    (size) => images?.[size],
  );

  const otherImages = Object.entries(
    images ?? {},
  )
    .filter(
      ([size]) =>
        !preferredImageSizes.includes(size),
    )
    .map(([, image]) => image);

  const imageCandidates = [
    ...preferredImages,
    ...otherImages,
    item.original_image,
    item.image,
  ];

  for (const candidate of imageCandidates) {
    const imageUrl =
      getRssImageUrl(candidate);

    if (
      imageUrl &&
      !excludedUrls.includes(imageUrl)
    ) {
      return imageUrl;
    }
  }

  return null;
}

export function getRssItemTime(
  item: RssItem,
): string {
  const value =
    item.pubDate?.trim() || "";

  if (!value) {
    return "";
  }

  if (value.includes(" / ")) {
    const parts =
      value.split(" / ");

    return (
      parts[1]?.slice(0, 5) || ""
    );
  }

  if (value.includes("T")) {
    return (
      value
        .split("T")[1]
        ?.slice(0, 5) || ""
    );
  }

  return value.slice(0, 5);
}
