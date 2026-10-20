import type { SupportedLanguageCode } from "@/lib/api/i18n";

interface CategoryRoute {
  path: string;
  ids: Record<SupportedLanguageCode, number>;
  menuAliases: Partial<Record<SupportedLanguageCode, string>>;
  apiAliases?: Partial<Record<SupportedLanguageCode, string>>;
}

const CATEGORY_ROUTES = [
  {
    path: "politics",
    ids: { ka: 5, en: 5 },
    menuAliases: { ka: "politika", en: "politics" },
  },
  {
    path: "economy",
    ids: { ka: 6, en: 6 },
    menuAliases: { ka: "ekonomika", en: "economics" },
  },
  {
    path: "region",
    ids: { ka: 7, en: 7 },
    menuAliases: { ka: "regioni", en: "region" },
  },
  {
    path: "military",
    ids: { ka: 8, en: 8 },
    menuAliases: { ka: "samkhedro", en: "military-matters" },
  },
  {
    path: "culture",
    ids: { ka: 9, en: 9 },
    menuAliases: { ka: "kultura", en: "culture" },
  },
  {
    path: "conflicts",
    ids: { ka: 10, en: 10 },
    menuAliases: { ka: "konpliktebi", en: "conflicts" },
  },
  {
    path: "law",
    ids: { ka: 11, en: 11 },
    menuAliases: { ka: "samartali", en: "justice" },
  },
  {
    path: "society",
    ids: { ka: 12, en: 12 },
    menuAliases: { ka: "sazogadoebaa", en: "society" },
    apiAliases: { ka: "sazogadoeba" },
  },
  {
    path: "world",
    ids: { ka: 13, en: 13 },
    menuAliases: { ka: "msoplio", en: "world" },
  },
  {
    path: "sport",
    ids: { ka: 14, en: 14 },
    menuAliases: { ka: "sporti", en: "sport" },
  },
  {
    path: "announcements",
    ids: { ka: 15, en: 15 },
    menuAliases: { ka: "anonsi", en: "announcements" },
  },
  {
    path: "exclusive",
    ids: { ka: 36, en: 36 },
    menuAliases: { ka: "ekskluzivi" },
  },
  {
    path: "interview",
    ids: { ka: 44, en: 43 },
    menuAliases: { ka: "interviu", en: "interview" },
  },
  {
    path: "viewpoint",
    ids: { ka: 48, en: 46 },
    menuAliases: { ka: "tvalsazrisi", en: "opinion" },
  },
] as const satisfies readonly CategoryRoute[];

const CATEGORY_BY_MENU_ALIAS = new Map<string, CategoryRoute>(
  CATEGORY_ROUTES.flatMap((category) =>
    Object.entries(category.menuAliases).map(
      ([lang, alias]) => [`${lang}:${alias}`, category] as const,
    ),
  ),
);

const CATEGORY_BY_ID = new Map<string, CategoryRoute>(
  CATEGORY_ROUTES.flatMap((category) =>
    Object.entries(category.ids).map(
      ([lang, id]) => [`${lang}:${id}`, category] as const,
    ),
  ),
);

const CATEGORY_BY_ALIAS = new Map<string, CategoryRoute>(
  CATEGORY_ROUTES.flatMap((category) => [
    [`${category.path}`, category] as const,
    ...Object.entries(category.menuAliases).map(
      ([lang, alias]) => [`${lang}:${alias}`, category] as const,
    ),
    ...Object.entries(
      "apiAliases" in category ? category.apiAliases : {},
    ).map(
      ([lang, alias]) => [`${lang}:${alias}`, category] as const,
    ),
  ]),
);

export function getCategoryIdByAlias(
  alias: string,
  lang: SupportedLanguageCode,
): number | null {
  const category =
    CATEGORY_BY_ALIAS.get(`${lang}:${alias}`) ??
    CATEGORY_BY_ALIAS.get(alias);

  return category?.ids[lang] ?? null;
}

export function isSupportedCategoryId(
  id: number,
  lang: SupportedLanguageCode,
): boolean {
  return CATEGORY_BY_ID.has(`${lang}:${id}`);
}

export function getLocalCategoryPath(
  menuAlias: string,
  link: string,
  lang: SupportedLanguageCode,
): string | null {
  const menuCategory = CATEGORY_BY_MENU_ALIAS.get(
    `${lang}:${menuAlias}`,
  );

  if (menuCategory) {
    return `/${lang}/${menuCategory.path}`;
  }

  try {
    const url = new URL(link, "https://www.interpressnews.ge");
    const isIpnHost =
      url.hostname === "interpressnews.ge" ||
      url.hostname.endsWith(".interpressnews.ge") ||
      url.hostname === "dev.ipn.ge";
    const categoryId = url.pathname.match(
      /\/category\/(\d+)-[^/]+\/?$/,
    )?.[1];
    const category = categoryId
      ? CATEGORY_BY_ID.get(`${lang}:${categoryId}`)
      : undefined;

    if (isIpnHost && category) {
      return `/${lang}/${category.path}`;
    }
  } catch {
    // Let the caller preserve its existing fallback for malformed links.
  }

  return null;
}
