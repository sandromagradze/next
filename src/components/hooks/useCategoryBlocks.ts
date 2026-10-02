"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchCategoryBlocks,
  type CategoryBlock,
} from "@/lib/api/categoryBlocks";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

export default function useCategoryBlocks(
  lang: SupportedLanguageCode,
) {
  return useQuery<CategoryBlock[]>({
    queryKey: ["categoryblocks", "production", lang],

    queryFn: () =>
      fetchCategoryBlocks(lang),

    staleTime: 0,

    gcTime: 30 * 60 * 1000,

    refetchOnMount: "always",

    refetchOnWindowFocus: true,

    retry: 1,

    enabled: Boolean(lang),
  });
}