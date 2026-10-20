import "server-only";
import { unstable_cache } from "next/cache";
import type { SupportedLanguageCode } from "./i18n";

const API_BASE = "https://www.interpressnews.ge";
const CACHE_SECONDS = 60;

export type HomepageSliderResponse = Record<string, unknown> & {
  top_big: unknown[];
  top_small: unknown[];
};

async function fetchHomepageSlider(
  lang: SupportedLanguageCode,
): Promise<HomepageSliderResponse> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/slider/`,
    {
      method: "POST",
      headers: { Accept: "*/*" },
      body: "",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Slider request failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    !Array.isArray((data as Record<string, unknown>).top_big) ||
    !Array.isArray((data as Record<string, unknown>).top_small)
  ) {
    throw new Error("Invalid slider response");
  }

  return data as HomepageSliderResponse;
}

export function getCachedHomepageSlider(
  lang: SupportedLanguageCode,
): Promise<HomepageSliderResponse> {
  return unstable_cache(
    () => fetchHomepageSlider(lang),
    ["homepage-slider", lang],
    {
      revalidate: CACHE_SECONDS,
      tags: [`homepage-slider-${lang}`],
    },
  )();
}
