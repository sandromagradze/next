"use client";

import { useQuery } from "@tanstack/react-query";
import { getRates, type CurrencyResponse } from "@/lib/api/rates";

export default function useRates(lang: string) {
  return useQuery<CurrencyResponse>({
    queryKey: ["rates", lang],
    queryFn: () => getRates(lang),
    staleTime: 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: Boolean(lang),
  });
}