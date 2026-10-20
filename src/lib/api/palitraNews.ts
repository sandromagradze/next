import type { SupportedLanguageCode } from "./i18n";
import { getCachedRssCollectors } from "./rssCollectors.server";

const HOMEPAGE_POSITION = "main_page_center_column";

export interface PalitraNewsItem {
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

export interface PalitraNewsBlock {
  domain: string;
  id: number;
  items: PalitraNewsItem[];
  logo: string | null;
  position: string;
  slicenum: number;
  title: string;
  view: string;
  visual: string;
}

export async function getPalitraNews(
  lang: SupportedLanguageCode
): Promise<PalitraNewsBlock | null> {
  const blocks = await getCachedRssCollectors(lang);

  return (
    (blocks as unknown as PalitraNewsBlock[]).find(
      (block) =>
        block.domain === "palitranews.ge" &&
        block.position === HOMEPAGE_POSITION,
    ) ?? null
  );
}
