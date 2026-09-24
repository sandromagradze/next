const API_BASE = "https://dev.ipn.ge";

export interface CategoryImage {
  original?: string;
  thumb?: string;
  webp?: string;
  position?: [number, number];
}

export interface Category {
  id?: number;
  title: string;
  alias?: string;
}

export interface CategoryArticle {
  id: number;
  alias?: string;
  title: string;
  introtext?: string;
  publish_up?: string;
  pub_dt?: string;
  image?: CategoryImage | null;
  url?: string;
  categories?: Category[];
}

export interface CategoryBlock {
  id?: number;
  alias?: string;
  position?: string;
  title?: string;
  visual?: string;
  articles?: CategoryArticle[];
}

interface CategoryBlocksResponse {
  blocks?: CategoryBlock[];
}

export async function fetchCategoryBlocks(
  lang: string,
): Promise<CategoryBlock[]> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/categoryblocks/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: "",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Category blocks request failed: ${response.status}`,
    );
  }

  const data: CategoryBlocksResponse =
    await response.json();

  return (data.blocks ?? []).filter(
    (block) =>
      block.position ===
      "main_page_right_column",
  );
}