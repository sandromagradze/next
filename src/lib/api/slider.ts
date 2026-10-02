import type { SupportedLanguageCode } from "./i18n";

export interface ArticleImage {
  original: string;
  thumb: string;
  webp: string;
  position: [number, number];
}

export interface SliderArticle {
  alias: string;
  id: number;
  title: string;
  introtext: string;
  publish_up: string;
  image: ArticleImage | null;
  video: string | null;
  show_ns: boolean;
  gallery: unknown;
  slider: string | null;
  url: string;
  pub_dt: string;
}

interface SliderResponse {
  top_big?: (SliderArticle | null)[];
}

export async function fetchSliderNews(
  lang: SupportedLanguageCode,
): Promise<SliderArticle[]> {
  const params = new URLSearchParams({ lang });
  const response = await fetch(
    `/api/homepage-slider?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!response.ok) {
    throw new Error(
      `Slider request failed: ${response.status}`,
    );
  }

  const data: SliderResponse =
    await response.json();

  return (data.top_big ?? [])
    .filter(
      (article): article is SliderArticle =>
        article !== null,
    )
    .slice(0, 19);
}