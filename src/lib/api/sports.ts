import type { SupportedLanguageCode } from "./i18n";
import { sortByPublicationDate } from "./publicationDate";

const API_BASE = "https://dev.ipn.ge";
const HOMEPAGE_POSITION = "main_page_center_column";

export interface SportArticle {
  description: string;
  image: string;
  images: {
    "170x96": string;
    "172x104": string;
    "206x116": string;
    "234x152": string;
    "288x162": string;
    "364x206": string;
  };
  link: string;
  original_image: string;
  pubDate: string | null;
  title: string;
}

interface SportBlock {
  domain: string;
  id: number;
  items: SportArticle[];
  logo: string | null;
  position: string;
  slicenum: number;
  title: string;
  view: string;
  visual: string;
}

interface SportResponse {
  blocks: SportBlock[];
}

export async function getSportArticles(
  lang: SupportedLanguageCode,
): Promise<SportArticle[]> {
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
      `Sport RSS API error: ${response.status}`,
    );
  }

  const data: SportResponse =
    await response.json();

  const sportBlock = data.blocks.find(
    (block) =>
      block.domain === "sportall.ge" &&
      block.position === HOMEPAGE_POSITION,
  );

  if (!sportBlock) {
    return [];
  }

  return sortByPublicationDate(
    sportBlock.items,
    (article) => article.pubDate,
  ).slice(0, 4);
}