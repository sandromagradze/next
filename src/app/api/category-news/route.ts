import { isSupportedLanguageCode } from "@/lib/api/i18n";
import { getCategoryNewsPage } from "@/lib/api/categoryNews.server";
import {
  getCategoryIdByAlias,
  isSupportedCategoryId,
} from "@/lib/categoryRoutes";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store",
};

export async function GET(request: Request) {
  const searchParams = new URL(request.url).searchParams;
  const lang = searchParams.get("lang");
  const rawId = searchParams.get("id");
  const alias = searchParams.get("alias");
  const pageValue = searchParams.get("page");
  const page = pageValue === null ? 1 : Number(pageValue);

  if (!lang || !isSupportedLanguageCode(lang)) {
    return Response.json(
      { error: "Invalid category news request" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  const id = rawId === null
    ? alias
      ? getCategoryIdByAlias(alias, lang)
      : null
    : Number(rawId);

  if (
    id === null ||
    !Number.isInteger(id) ||
    !isSupportedCategoryId(id, lang) ||
    !Number.isInteger(page) ||
    page < 1
  ) {
    return Response.json(
      { error: "Invalid category news request" },
      { status: 400, headers: NO_STORE_HEADERS },
    );
  }

  try {
    const categoryPage = await getCategoryNewsPage(lang, id, page);

    return Response.json(categoryPage, {
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    console.error("[category-news] Failed:", error);

    return Response.json(
      { error: "Category news request failed" },
      { status: 502, headers: NO_STORE_HEADERS },
    );
  }
}
