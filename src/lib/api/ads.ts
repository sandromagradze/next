const API_BASE = "https://dev.ipn.ge";

export interface AdItem {
  html: string;
  position: string;
}

export interface AdsResponse {
  ads?: AdItem[];
}

export async function fetchAds(
  lang: string,
): Promise<AdItem[]> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/ads/`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 1800,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Ads request failed: ${response.status}`,
    );
  }

  const data: AdsResponse =
    await response.json();

  return data.ads ?? [];
}