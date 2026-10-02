import type { SupportedLanguageCode } from "./i18n";

const API_BASE = "https://dev.ipn.ge";

export interface ScriptsResponse {
  body_scripts: string;
  bottom_scripts: string;
  bottom_up_scripts: string;
  head_scripts: string;
}

export async function fetchScripts(
  langCode: SupportedLanguageCode,
): Promise<ScriptsResponse> {
  const response = await fetch(
    `${API_BASE}/${langCode}/api/scripts/`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Scripts request failed: ${response.status}`,
    );
  }

  return response.json();
}