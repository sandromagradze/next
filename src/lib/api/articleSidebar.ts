import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { getCachedCategoryBlocks } from "@/lib/api/categoryBlocks.server";
import { getLatestNewsPage } from "@/lib/api/latestNews";


export interface SidebarArticleImage {
  original?: string;
  thumb?: string;
  webp?: string;
  position?: [number, number];
}

export interface SidebarArticleCategory {
  id?: number;
  alias?: string;
  title?: string;
}

export interface SidebarArticle {
  id: number;
  alias?: string;
  title: string;
  introtext?: string;
  publish_up?: string;
  pub_dt?: string;
  url?: string;
  image?: SidebarArticleImage | null;
  categories?: SidebarArticleCategory[];
  video?: unknown;
  gallery?: unknown;
  show_ns?: boolean;
  slider?: unknown;
  hashtags?: unknown[];
}

export interface CategoryBlock {
  id: number;
  alias: string;
  title: string;
  position?: string;
  visual?: string;
  articles?: SidebarArticle[];
}

export async function getCategoryBlocks(
  lang: SupportedLanguageCode,
): Promise<CategoryBlock[]> {
  try {
    const data = await getCachedCategoryBlocks(lang);

    return data.blocks as CategoryBlock[];
  } catch {
    return [];
  }
}

export async function getLatestNews(
  lang: SupportedLanguageCode,
  page = 1,
  _offset = 0,
): Promise<SidebarArticle[]> {
  try {
    return await getLatestNewsPage(lang, page);
  } catch {
    return [];
  }
}
