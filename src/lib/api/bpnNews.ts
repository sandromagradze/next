import type { SupportedLanguageCode } from "./i18n";
import { sortByPublicationDate } from "./publicationDate";

const API_BASE = "https://dev.ipn.ge";
const HOMEPAGE_POSITION = "main_page_center_column";

export interface BpnNewsImage {
  "170x96": string;
  "172x104": string;
  "206x116": string;
  "234x152": string;
  "288x162": string;
  "364x206": string;
}

export interface BpnNewsArticle {
  description: string;
  image: string;
  images: BpnNewsImage;
  link: string;
  original_image: string;
  pubDate: string | null;
  title: string;
}

interface BpnNewsBlock {
  domain: string;
  id: number;
  items: BpnNewsArticle[];
  logo: string | null;
  position: string;
  slicenum: number;
  title: string;
  view: string;
  visual: string;
}

interface BpnNewsResponse {
  blocks: BpnNewsBlock[];
}

export interface RssNewsData {
  bpn: BpnNewsData;
  sport: BpnNewsArticle[];
  palitra: BpnNewsBlock | null;
}

async function fetchRssBlocks(
  lang: SupportedLanguageCode,
): Promise<BpnNewsBlock[]> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/rss/collectors/fetch-active/`,
    {
      method: "POST",
      headers: {
        Accept: "*/*",
      },
      body: "",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `RSS collectors API error: ${response.status}`,
    );
  }

  const data: BpnNewsResponse = await response.json();

  return data.blocks.map((block) => ({
    ...block,
    items: sortByPublicationDate(
      block.items ?? [],
      (item) => item.pubDate,
    ),
  }));
}

export async function getRssNews(
  lang: SupportedLanguageCode,
): Promise<RssNewsData> {
  const blocks = await fetchRssBlocks(lang);
  const bpnBlock = blocks.find(
    (block) =>
      block.domain === "bpn.ge" &&
      block.position === HOMEPAGE_POSITION,
  );
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

  return {
    bpn: {
      articles: bpnBlock?.items ?? [],
      logo: bpnBlock?.logo ?? null,
    },
    sport: sportBlock?.items.slice(0, 4) ?? [],
    palitra: palitraBlock ?? null,
  };
}

export interface BpnNewsData {
  articles: BpnNewsArticle[];
  logo: string | null;
}

export async function getBpnNews(
  lang: SupportedLanguageCode,
): Promise<BpnNewsData> {
  const blocks = await fetchRssBlocks(lang);
  const bpnBlock = blocks.find(
    (block) =>
      block.domain === "bpn.ge" &&
      block.position === HOMEPAGE_POSITION,
  );

  if (!bpnBlock) {
    return {
      articles: [],
      logo: null,
    };
  }

  return {
    articles: bpnBlock.items,
    logo: bpnBlock.logo,
  };
}