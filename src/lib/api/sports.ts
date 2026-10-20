import type { SupportedLanguageCode } from "./i18n";
import { sortByPublicationDate } from "./publicationDate";
import { getCachedRssCollectors } from "./rssCollectors.server";

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

export async function getSportArticles(
  lang: SupportedLanguageCode,
): Promise<SportArticle[]> {
  const blocks = await getCachedRssCollectors(lang);

  const sportBlock =
    (blocks as unknown as SportBlock[]).find(
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
