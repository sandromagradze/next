const API_BASE = "https://dev.ipn.ge";

export interface SecondSideCardImage {
  original: string;
  thumb: string;
  webp: string;
  position?: [number, number];
}

export interface SecondSideCardArticle {
  alias: string;
  id: number;
  title: string;
  introtext: string;
  publish_up: string;
  pub_dt: string;
  image: SecondSideCardImage | null;
  url: string;
  video: string | null;
}

export interface SecondSideCardBlock {
  alias: string;
  id: number;
  title: string;
  position: string;
  visual: string;
  articles: SecondSideCardArticle[];
}

interface BlocksResponse {
  blocks: SecondSideCardBlock[];
}

export async function getSecondSideCard(
  lang: string
): Promise<SecondSideCardBlock | null> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/blocks/`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Blocks request failed: ${response.status}`
    );
  }

  const data: BlocksResponse =
    await response.json();

  const block = data.blocks?.find(
    (item) =>
      item.alias ===
        "mnishvnelovani-inpormacia" &&
      item.position ===
        "main_page_right_column" &&
      item.visual === "vertical"
  );

  return block ?? null;
}