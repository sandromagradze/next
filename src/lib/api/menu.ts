import type { SupportedLanguageCode } from "./i18n";

export interface MenuItem {
  alias: string;
  is_external: boolean;
  link: string;
  text: string;
}

export interface MenuResponse {
  footer: Record<string, unknown>;
  menu: MenuItem[];
}

const API_BASE = "https://dev.ipn.ge";

export async function fetchMenu(
  lang: SupportedLanguageCode,
): Promise<MenuResponse> {
  const response = await fetch(
    `${API_BASE}/${lang}/api/menu/`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Menu request failed: ${response.status}`,
    );
  }

  return response.json();
}