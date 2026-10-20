import type { SupportedLanguageCode } from "./i18n";
import {
  getCachedRssCollectors,
  type RssCollectorBlock,
  type RssCollectorItem,
} from "./rssCollectors.server";
import type { SportArticle } from "./sports";
import type { PalitraNewsBlock } from "./palitraNews";

const HOMEPAGE_POSITION = "main_page_center_column";

export interface BpnNewsImage {
  "170x96"?: string;
  "172x104"?: string;
  "206x116"?: string;
  "234x152"?: string;
  "288x162"?: string;
  "364x206"?: string;
  [size: string]: string | undefined;
}

export interface BpnNewsArticle {
  description?: string | null;
  image?: string | null;
  images?: BpnNewsImage | null;
  link: string;
  original_image?: string | null;
  pubDate: string | null;
  title: string;
}

export interface RssNewsData {
  bpn: BpnNewsData;
  sport: SportArticle[];
  palitra: PalitraNewsBlock | null;
}

function getBpnBlock(blocks: readonly RssCollectorBlock[]) {
  return blocks.find((block) => block.domain === "bpn.ge");
}

function getBpnArticles(
  items: readonly RssCollectorItem[],
): BpnNewsArticle[] {
  return items.flatMap((item) => {
    if (
      typeof item.title !== "string" ||
      !item.title.trim() ||
      typeof item.link !== "string" ||
      !item.link.trim()
    ) {
      return [];
    }

    const images = item.images;
    const normalizedImages =
      images && typeof images === "object" && !Array.isArray(images)
        ? Object.fromEntries(
            Object.entries(images).filter(([, value]) => typeof value === "string"),
          ) as BpnNewsImage
        : null;

    return [{
      title: item.title,
      link: item.link,
      pubDate: typeof item.pubDate === "string" ? item.pubDate : null,
      description: typeof item.description === "string" ? item.description : null,
      image: typeof item.image === "string" ? item.image : null,
      original_image: typeof item.original_image === "string" ? item.original_image : null,
      images: normalizedImages,
    }];
  });
}

export async function getRssNews(
  lang: SupportedLanguageCode,
): Promise<RssNewsData> {
  const blocks = await getCachedRssCollectors(lang);
  const bpnBlock = getBpnBlock(blocks);
  const sportBlock = blocks.find(
    (block) =>
      block.domain === "sportall.ge" &&
      block.position === HOMEPAGE_POSITION,
  );
  const palitraBlock = blocks.find(
    (block) =>
      block.domain === "palitranews.ge" &&
      block.position === HOMEPAGE_POSITION,
  );
  const palitra = palitraBlock
    ? palitraBlock as unknown as PalitraNewsBlock
    : null;

  return {
    bpn: {
      articles: bpnBlock ? getBpnArticles(bpnBlock.items) : [],
      logo: bpnBlock?.logo ?? null,
    },
    sport: (sportBlock?.items.slice(0, 4) ?? []) as unknown as SportArticle[],
    palitra,
  };
}

export interface BpnNewsData {
  articles: BpnNewsArticle[];
  logo: string | null;
}

export async function getBpnNews(
  lang: SupportedLanguageCode,
): Promise<BpnNewsData> {
  const blocks = await getCachedRssCollectors(lang);
  const bpnBlock = getBpnBlock(blocks);

  if (!bpnBlock) {
    return {
      articles: [],
      logo: null,
    };
  }

  return {
    articles: getBpnArticles(bpnBlock.items),
    logo: bpnBlock.logo ?? null,
  };
}
