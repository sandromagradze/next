import { isSupportedLanguageCode } from "@/lib/api/i18n";
import { getCachedHomepageSlider } from "@/lib/api/homepageSlider.server";

export async function GET(request: Request) {
  const lang = new URL(request.url).searchParams.get("lang");

  if (!lang || !isSupportedLanguageCode(lang)) {
    return Response.json(
      { error: "Unsupported language" },
      {
        status: 400,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  try {
    const data = await getCachedHomepageSlider(lang);

    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[homepage-slider] Failed:", error);

    return Response.json(
      { error: "Unable to load slider" },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
