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

interface NewsSliderResponse {
  top_big?: NewsSliderArticle[];
  top_small?: NewsSliderArticle[];
}

async function fetchSliderData(
  lang: string
): Promise<NewsSliderResponse> {
  const response = await fetch(
    `https://dev.ipn.ge/${lang}/api/slider/`,
    {
      method: "POST",
      headers: {
        Accept: "*/*",
      },
      body: "",
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `News slider API error: ${response.status}`
    );
  }

  return response.json();
}

export async function getNewsSliderArticles(
  lang: string
): Promise<NewsSliderArticle[]> {
  const data = await fetchSliderData(lang);

  return data.top_small ?? [];
}

export async function getSliderNewsArticles(
  lang: string
): Promise<NewsSliderArticle[]> {
  const data = await fetchSliderData(lang);

  return data.top_big ?? [];
}

/**
 * ერთი სტატიის წამოღება ID-ით
 *
 * მაგალითად:
 * /api/article/88/
 */
async function fetchArticle(
  lang: string,
  id: number
): Promise<NewsSliderArticle | null> {
  const response = await fetch(
    `https://dev.ipn.ge/${lang}/api/article/${id}/`,
    {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

/**
 * შემდეგი სტატიის მოძებნა
 *
 * მაგალითად:
 * /api/article/88/next/
 */
async function fetchNextArticle(
  lang: string,
  id: number
): Promise<NewsSliderArticle | null> {
  const response = await fetch(
    `https://dev.ipn.ge/${lang}/api/article/${id}/next/`,
    {
      method: "GET",
      headers: {
        Accept: "*/*",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

/**
 * NewsCard-ებისთვის სტატიების მოძებნა.
 *
 * პირველი სტატია:
 * /article/88/
 *
 * შემდეგ:
 * /article/{წინა სტატიის id}/next/
 *
 * და ასე შემდეგ.
 */
export async function getNewsCardArticles(
  lang: string
): Promise<NewsSliderArticle[]> {
  const articles: NewsSliderArticle[] = [];

  const firstArticleId = 88;

  const firstArticle = await fetchArticle(
    lang,
    firstArticleId
  );

  if (!firstArticle) {
    return [];
  }

  articles.push(firstArticle);

  let currentId = firstArticle.id;

  const articlesToLoad = 8;

  for (
    let i = 1;
    i < articlesToLoad;
    i++
  ) {
    const nextArticle =
      await fetchNextArticle(
        lang,
        currentId
      );

    if (!nextArticle) {
      break;
    }

    articles.push(nextArticle);

    currentId = nextArticle.id;
  }

  return articles;
}