import { isSupportedLanguageCode } from "@/lib/api/i18n";
import {
  getProfileArticlesPage,
  type ProfileApiOrigin,
} from "@/lib/api/profiles";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const lang = searchParams.get("lang");
  const rawProfileId = searchParams.get("profileId");
  const rawPage = searchParams.get("page");
  const rawTotalArticles = searchParams.get("totalArticles");
  const rawApiOrigin = searchParams.get("apiOrigin");
  const profileId = Number(rawProfileId);
  const page = Number(rawPage);
  const totalArticles =
    rawTotalArticles === null ? undefined : Number(rawTotalArticles);
  const apiOrigin: ProfileApiOrigin =
    rawApiOrigin === "dev" ? "dev" : "public";

  if (
    !lang ||
    !isSupportedLanguageCode(lang) ||
    rawProfileId === null ||
    !Number.isSafeInteger(profileId) ||
    profileId <= 0 ||
    rawPage === null ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    (rawTotalArticles !== null &&
      (!Number.isSafeInteger(totalArticles) ||
        (totalArticles ?? -1) < 0)) ||
    (rawApiOrigin !== null &&
      rawApiOrigin !== "dev" &&
      rawApiOrigin !== "public")
  ) {
    return Response.json(
      { error: "Invalid profile articles request" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const articlePage = await getProfileArticlesPage(
      lang,
      profileId,
      page,
      totalArticles,
      apiOrigin,
    );

    return Response.json(articlePage, {
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error("[profile-articles] Failed:", error);

    return Response.json(
      { error: "Profile articles request failed" },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}
