const API_BASE = "https://dev.ipn.ge";

export interface LatestNewsImage {
  original: string;
  thumb: string;
  webp: string;
  position?: [number, number];
}

export interface LatestNewsItem {
  alias: string;
  id: number;
  title: string;
  introtext: string;
  publish_up: string;
  image: LatestNewsImage | null;
  url: string;
}

interface LatestNewsResponse {
  results: (LatestNewsItem | null)[];
}

/**
 * ერთი API page-ის წამოღება.
 */
export async function getLatestNewsPage(
  lang: string,
  page: number
): Promise<LatestNewsItem[]> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/latestnews/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: `offset=0&page=${page}`,
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Latest news request failed: ${response.status}`
    );
  }

  const data: LatestNewsResponse =
    await response.json();

  return data.results.filter(
    (item): item is LatestNewsItem =>
      item !== null
  );
}

/**
 * მთავარ გვერდზე პირველი 15 სიახლის წამოღება.
 *
 * თუ API-ის ერთი page 15-ზე ნაკლებ სიახლეს აბრუნებს,
 * ავტომატურად შემდეგ page-ებსაც წამოიღებს.
 */
export async function getLatestNews(
  lang: string,
  visibleCount = 15
): Promise<LatestNewsItem[]> {
  const allNews: LatestNewsItem[] = [];

  let page = 1;

  while (allNews.length < visibleCount) {
    const news = await getLatestNewsPage(
      lang,
      page
    );

    if (news.length === 0) {
      break;
    }

    allNews.push(...news);

    page++;
  }

  const uniqueNews = Array.from(
    new Map(
      allNews.map((item) => [item.id, item])
    ).values()
  );

  return uniqueNews.slice(0, visibleCount);
}