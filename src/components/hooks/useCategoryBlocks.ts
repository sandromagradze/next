"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchCategoryBlocks,
  type CategoryBlock,
} from "@/lib/api/categoryBlocks";

export default function useCategoryBlocks(
  lang: string,
) {
  return useQuery<CategoryBlock[]>({
    queryKey: ["categoryblocks", lang],

    queryFn: () =>
      fetchCategoryBlocks(lang),

    staleTime: 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,

    enabled: Boolean(lang),
  });
}