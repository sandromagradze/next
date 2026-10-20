import { isSupportedLanguageCode } from "@/lib/api/i18n";
import { addAmbebiPublicationDates } from "@/lib/api/ambebiPublicationDates.server";
import { getCachedRssCollectors } from "@/lib/api/rssCollectors.server";

export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang");

  if (!lang || !isSupportedLanguageCode(lang)) {
    return Response.json(
      { error: "Unsupported language" },
      { status: 400 },
    );
  }

  try {
    const cachedBlocks = await getCachedRssCollectors(lang);
    const blocks = await addAmbebiPublicationDates(cachedBlocks);

    return Response.json(
      { blocks },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("[rss-blocks] Failed:", error);

    return Response.json(
      { error: "Failed to fetch RSS blocks" },
      { status: 502 },
    );
  }
}
