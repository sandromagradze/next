"use client";

import { useQuery } from "@tanstack/react-query";

import {
  fetchSliderNews,
  type SliderArticle,
} from "@/lib/api/slider";

export default function useSliderNews(
  lang: string,
) {
  return useQuery<SliderArticle[]>({
    queryKey: ["sliderNews", lang],
    queryFn: () => fetchSliderNews(lang),

    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,
    retry: 1,

    enabled: Boolean(lang),
  });
}