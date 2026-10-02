"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSliderNews,
  type SliderArticle,
} from "@/lib/api/slider";
import type { SupportedLanguageCode } from "@/lib/api/i18n";

export default function useSliderNews(
  lang: SupportedLanguageCode,
  initialArticles: SliderArticle[] = [],
) {
  return useQuery<SliderArticle[]>({
    queryKey: ["sliderNews", "production", lang],
    queryFn: () => fetchSliderNews(lang),
    initialData:
      initialArticles.length > 0
        ? initialArticles
        : undefined,

    staleTime: 0,
    gcTime: 30 * 60 * 1000,

    refetchOnMount: "always",

    refetchOnWindowFocus: true,
    retry: 1,

    enabled: Boolean(lang),
  });
}