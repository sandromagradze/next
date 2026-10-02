import type { RssBlock, RssItem } from "./rss";

export type BtuAiArticle = RssItem;

export function getBtuAiArticles(
  blocks: RssBlock[],
): BtuAiArticle[] {
  const btuAiBlock = blocks.find(
    (block) =>
      block.domain?.trim().toLowerCase() === "btuai.ge" &&
      block.position === "main_page_right_column",
  );

  if (!btuAiBlock) {
    return [];
  }

  return btuAiBlock.items
    .filter(
      (item) =>
        Boolean(item.title?.trim()) &&
        Boolean(item.link?.trim()),
    )
    .slice(0, 3);
}