"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchAds, type AdItem } from "@/lib/api/ads";

export default function useAds(lang: string) {
  return useQuery<AdItem[]>({
    queryKey: ["ads", lang],

    queryFn: () => fetchAds(lang),

    staleTime: 30 * 60 * 1000,

    gcTime: 30 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: 1,

    enabled: Boolean(lang),
  });
}