export interface BtuAiImage {
  "170x96": string;
  "172x104": string;
  "206x116": string;
  "234x152": string;
  "288x162": string;
  "364x206": string;
}

export interface BtuAiArticle {
  description: string;
  image: string;
  images: BtuAiImage;
  link: string;
  original_image: string;
  pubDate: string;
  title: string;
}

interface BtuAiBlock {
  domain: string;
  id: number;
  items: BtuAiArticle[];
  logo: string | null;
  position: string;
  slicenum: number;
  title: string;
  view: string;
  visual: string;
}

interface BtuAiResponse {
  blocks: BtuAiBlock[];
}

export async function getBtuAiArticles(
  lang: string
): Promise<BtuAiArticle[]> {
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
      `BTU AI RSS API error: ${response.status}`
    );
  }

  const data: BtuAiResponse = await response.json();

  

  data.blocks.forEach((block) => {
    
  });

  const btuAiBlock = data.blocks.find(
    (block) =>
      block.domain?.toLowerCase().includes("btu") ||
      block.title?.toLowerCase().includes("btu")
  );

  

  if (!btuAiBlock) {
    

    

    return [];
  }

  return btuAiBlock.items;
}