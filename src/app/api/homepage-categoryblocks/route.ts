import { isSupportedLanguageCode } from "@/lib/api/i18n";
import { getCachedCategoryBlocks } from "@/lib/api/categoryBlocks.server";

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

  try {
    const data = await getCachedCategoryBlocks(lang);

    return Response.json(data, {
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error("[homepage-categoryblocks] Failed:", error);

    return Response.json(
      { error: "Category blocks request failed" },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}
