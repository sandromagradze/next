const API_BASE = "https://dev.ipn.ge";

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
  lang: string,
): Promise<SliderArticle[]> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/slider/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: "loaded=0",
    },
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