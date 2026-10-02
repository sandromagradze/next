import { isSupportedLanguageCode } from "@/lib/api/i18n";

const API_BASE = "https://www.interpressnews.ge";
const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang");

  if (!lang || !isSupportedLanguageCode(lang)) {
    return Response.json(
      { error: "Unsupported language" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const response = await fetch(
    `${API_BASE}/${lang}/api/slider/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "loaded=0",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return Response.json(
      { error: `Slider request failed: ${response.status}` },
      { status: response.status, headers: NO_STORE_HEADERS },
    );
  }

  return Response.json(await response.json(), {
    headers: NO_STORE_HEADERS,
  });
}