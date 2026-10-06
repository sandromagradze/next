import type { SupportedLanguageCode } from "./i18n";
import type { SliderArticle } from "./slider";

const API_BASE = "https://www.interpressnews.ge";
const SLIDER_API_BASE = "https://www.interpressnews.ge";

export interface NewsSliderImage {
  original: string;
  thumb: string;
  webp: string;
  position: [number, number];
}

export interface NewsSliderArticle {
  id: number;
  alias: string;
  title: string;
  publish_up: string;
  pub_dt: string;
  url: string;
  image: NewsSliderImage | null;
  introtext: string;
  video: unknown;
}

export interface NewsArticle extends NewsSliderArticle {
  fulltext?: string;
  categories?: { title?: string }[];
}

interface NewsSliderResponse {
  top_big?: SliderArticle[];
  top_small?: NewsSliderArticle[];
}

async function fetchSliderData(
  lang: SupportedLanguageCode,
): Promise<NewsSliderResponse> {
  const response = await fetch(
    `${SLIDER_API_BASE}/${lang}/api/slider/`,
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
      `News slider API error: ${response.status}`,
    );
  }

  const data: NewsSliderResponse =
    await response.json();

  return data;
}

export async function getSliderContent(
  lang: SupportedLanguageCode,
): Promise<NewsSliderResponse> {
  return fetchSliderData(lang);
}

export async function getNewsSliderArticles(
  lang: SupportedLanguageCode,
): Promise<NewsSliderArticle[]> {
  const data = await getSliderContent(lang);

  return data.top_small ?? [];
}

export async function getSliderNewsArticles(
  lang: SupportedLanguageCode,
): Promise<SliderArticle[]> {
  const data = await getSliderContent(lang);

  return data.top_big ?? [];
}

async function fetchArticle(
  lang: SupportedLanguageCode,
  id: number,
): Promise<NewsArticle | null> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/article/${id}/`,
    {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data: unknown = await response.json();

  if (!data || typeof data !== "object") {
    return null;
  }

  const article = data as Partial<NewsArticle>;

  if (
    typeof article.id !== "number" ||
    !Number.isInteger(article.id) ||
    article.id <= 0 ||
    typeof article.title !== "string" ||
    !article.title.trim()
  ) {
    return null;
  }

  return article as NewsArticle;
}

export async function getArticleById(
  lang: SupportedLanguageCode,
  id: number,
): Promise<NewsArticle | null> {
  return fetchArticle(lang, id);
}
