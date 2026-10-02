"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getRssBlocks,
  type RssBlock,
} from "@/lib/api/rss";

import type { SupportedLanguageCode } from "@/lib/api/i18n";

export default function useRssBlocks(
  lang: SupportedLanguageCode,
) {
  return useQuery<RssBlock[]>({
    queryKey: ["rss-blocks", "homepage-placement-v2", lang],

    queryFn: () =>
      getRssBlocks(lang),

    staleTime: 0,

    gcTime: 30 * 60 * 1000,

    refetchOnMount: "always",

    refetchOnWindowFocus: true,

    retry: 1,

    enabled: Boolean(lang),
  });
}