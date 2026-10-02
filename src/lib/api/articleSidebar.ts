import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { sortByPublicationDate } from "@/lib/api/publicationDate";

const API_BASE_URL = "https://dev.ipn.ge";
const CATEGORY_API_BASE_URL = "https://www.interpressnews.ge";

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

interface CategoryBlocksResponse {
  blocks?: CategoryBlock[];
}

interface LatestNewsResponse {
  results?: SidebarArticle[];
}

function getApiUrl(
  lang: SupportedLanguageCode,
  path: string,
): string {
  return `${API_BASE_URL}/${lang}${path}`;
}

export async function getCategoryBlocks(
  lang: SupportedLanguageCode,
): Promise<CategoryBlock[]> {
  try {
    const response = await fetch(
      `${CATEGORY_API_BASE_URL}/${lang}/api/categoryblocks/`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: "",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    const data =
      (await response.json()) as CategoryBlocksResponse;

    return Array.isArray(data.blocks)
      ? data.blocks
      : [];
  } catch {
    return [];
  }
}

export async function getLatestNews(
  lang: SupportedLanguageCode,
  page = 1,
  offset = 0,
): Promise<SidebarArticle[]> {
  try {
    const body = new URLSearchParams({
      offset: String(offset),
      page: String(page),
    });

    const response = await fetch(
      getApiUrl(lang, "/api/latestnews/"),
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: body.toString(),
        cache: "no-store",
      },
    );

    if (!response.ok) {
      return [];
    }

    const data =
      (await response.json()) as LatestNewsResponse;

    if (!Array.isArray(data.results)) {
      return [];
    }

    return sortByPublicationDate(
      data.results,
      (article) =>
        article.pub_dt || article.publish_up,
    );
  } catch {
    return [];
  }
}