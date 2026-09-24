export interface BpnNewsImage {
  "170x96": string;
  "172x104": string;
  "206x116": string;
  "234x152": string;
  "288x162": string;
  "364x206": string;
}

export interface BpnNewsArticle {
  description: string;
  image: string;
  images: BpnNewsImage;
  link: string;
  original_image: string;
  pubDate: string;
  title: string;
}

interface BpnNewsBlock {
  domain: string;
  id: number;
  items: BpnNewsArticle[];
  logo: string | null;
  position: string;
  slicenum: number;
  title: string;
  view: string;
  visual: string;
}

interface BpnNewsResponse {
  blocks: BpnNewsBlock[];
}

export interface BpnNewsData {
  articles: BpnNewsArticle[];
  logo: string | null;
}

export async function getBpnNews(
  lang: string
): Promise<BpnNewsData> {
  const response = await fetch(
    `https://dev.ipn.ge/${lang}/api/rss/collectors/fetch-active/`,
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
      `BPN news API error: ${response.status}`
    );
  }

  const data: BpnNewsResponse =
    await response.json();

  const bpnBlock = data.blocks.find(
    (block) => block.domain === "bpn.ge"
  );

  if (!bpnBlock) {
    return {
      articles: [],
      logo: null,
    };
  }

  return {
    articles: bpnBlock.items,
    logo: bpnBlock.logo,
  };
}
