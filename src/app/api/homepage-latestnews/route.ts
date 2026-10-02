import { isSupportedLanguageCode } from "@/lib/api/i18n";
import { getLatestNewsPage } from "@/lib/api/latestNews";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const lang = searchParams.get("lang");
  const page = Number(searchParams.get("page"));

  if (
    !lang ||
    !isSupportedLanguageCode(lang) ||
    !Number.isInteger(page) ||
    page < 1
  ) {
    return Response.json(
      { error: "Invalid latest-news request" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const results = await getLatestNewsPage(lang, page);

    return Response.json(
      { results },
      { headers: NO_STORE_HEADERS },
    );
  } catch {
    return Response.json(
      { error: "Latest news request failed" },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}