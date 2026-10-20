import type { SupportedLanguageCode } from "./i18n";

const API_BASE_URL = "https://dev.ipn.ge";
const PROFILE_DETAILS_API_BASE_URL = "https://www.interpressnews.ge";
export const PROFILE_ARTICLES_PAGE_SIZE = 15;

export type ProfileApiOrigin = "dev" | "public";

export interface ProfileImages {
  "176x176": string | null;
  "198x198": string | null;
}

export interface ProfileHashtags {
  alias: string;
  id: number;
  keywords: string[];
  title: string;
}

export interface ProfileArticleImage {
  original?: string;
  thumb?: string;
  webp?: string;
  position?: [number, number] | [string, string];
}

export interface ProfileArticle {
  id: number;
  alias?: string;
  title: string;
  publish_up?: string;
  pub_dt?: string;
  url: string;
  image?: ProfileArticleImage | null;
  introtext?: string;
  hashtags?: ProfileHashtags[];
}

export interface ProfileArticlesCollection {
  count: number;
  result: ProfileArticle[];
}

export interface RelatedProfile {
  id: number;
  alias: string;
  title: string;
  position?: string;
  birthdate?: string;
  url?: string;
  images?: ProfileImages;
}

export interface Profile {
  id: number;
  alias: string;
  title: string;
  position: string;
  birthdate: string;
  birthdate_dt?: string | null;
  birth_date?: string | null;
  alternate_name?: string | null;
  biography?: string | null;
  description?: string | null;
  introtext?: string | null;
  short_description?: string | null;
  current_positions?: ProfilePosition[];
  former_positions?: ProfilePosition[];
  sources?: ProfileSource[];
  same_as?: string[];
  other_profiles?: RelatedProfile[];
  articles?: ProfileArticlesCollection;
  is_pub: boolean;
  url: string;
  apiOrigin?: ProfileApiOrigin;
  hashtags?: ProfileHashtags;
  image?: ProfileArticleImage | null;
  images?: ProfileImages;
}

export interface ProfileArticlesPage {
  page: number;
  results: ProfileArticle[];
  hasNext: boolean;
}

export type ProfilePosition =
  | string
  | {
      title?: string;
      position?: string;
      name?: string;
      organization?: string;
      description?: string;
      start_date?: string;
      end_date?: string;
    };

export type ProfileSource =
  | string
  | {
      title?: string;
      url?: string;
    };

interface ProfilesResponse {
  pagination?: {
    /** Total number of profile rows across all pages. */
    count: number;
    /** Current 1-based page. */
    page: number;
    /** Number of pages for the complete result. */
    total: number;
  };
  profiles: Profile[];
}

interface ProfileArticlesResponse {
  id: number;
  alias: string;
  title: string;
  pagination: {
    count?: number;
    page: number;
    total?: number;
  };
  results: ProfileArticle[];
}

function getImageUrl(
  image?: string | null,
  baseUrl = API_BASE_URL,
): string {
  if (!image) {
    return "";
  }

  const src = image.trim();

  if (!src) {
    return "";
  }

  if (src.startsWith("https://")) {
    return src;
  }

  if (src.startsWith("http://")) {
    return src.replace(
      /^http:\/\//,
      "https://",
    );
  }

  if (src.startsWith("/media/")) {
    return `${baseUrl}${src}`;
  }

  if (src.startsWith("media/")) {
    return `${baseUrl}/${src}`;
  }

  if (src.startsWith("/")) {
    return `${baseUrl}${src}`;
  }

  return `${baseUrl}/${src}`;
}

export function getProfileImage(
  profile: Profile,
): string {
  const image =
    profile.images?.["176x176"] ||
    profile.images?.["198x198"] ||
    "";

  return getImageUrl(
    image,
    profile.apiOrigin === "public"
      ? PROFILE_DETAILS_API_BASE_URL
      : API_BASE_URL,
  );
}

export async function getProfiles(
  lang: SupportedLanguageCode,
  page = 1,
): Promise<ProfilesResponse> {
  const response = await fetch(
    `${API_BASE_URL}/${lang}/api/profiles/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        page: String(page),
      }).toString(),
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Profiles API error: ${response.status}`,
    );
  }

  return response.json();
}

/**
 * იღებს ყველა პროფილს ყველა გვერდიდან.
 */
export async function getAllProfiles(
  lang: SupportedLanguageCode,
): Promise<Profile[]> {
  const firstPage = await getProfiles(
    lang,
    1,
  );

  if (!Array.isArray(firstPage.profiles)) {
    throw new Error("Invalid profiles response: profiles must be an array");
  }

  if (
    firstPage.pagination?.page !== undefined &&
    firstPage.pagination.page !== 1
  ) {
    throw new Error("Profiles API did not return the requested first page");
  }

  const reportedCount = firstPage.pagination?.count;
  const pageCount = firstPage.pagination?.total;

  if (
    typeof reportedCount !== "number" ||
    !Number.isSafeInteger(reportedCount) ||
    typeof pageCount !== "number" ||
    !Number.isSafeInteger(pageCount) ||
    reportedCount < 0 ||
    pageCount < 0
  ) {
    throw new Error("Invalid profiles pagination metadata");
  }

  const profilesById = new Map(
    firstPage.profiles.map((profile) => [
      profile.id,
      profile,
    ]),
  );

  let receivedRows = firstPage.profiles.length;
  let paginationChanged = false;

  for (let page = 2; page <= pageCount; page += 1) {
    const data = await getProfiles(lang, page);

    if (!Array.isArray(data.profiles)) {
      throw new Error(
        `Invalid profiles response for page ${page}: profiles must be an array`,
      );
    }

    const pagination = data.pagination;

    if (
      pagination?.page !== page ||
      typeof pagination.count !== "number" ||
      !Number.isSafeInteger(pagination.count) ||
      pagination.count < 0 ||
      typeof pagination.total !== "number" ||
      !Number.isSafeInteger(pagination.total) ||
      pagination.total < 0
    ) {
      throw new Error(
        `Profiles API returned invalid pagination metadata for page ${page}`,
      );
    }

    if (
      pagination.count !== reportedCount ||
      pagination.total !== pageCount
    ) {
      paginationChanged = true;
    }

    if (data.profiles.length === 0) {
      if (pagination.total < page) {
        continue;
      }

      throw new Error(
        `Profiles API returned no profiles for page ${page} of ${pageCount}`,
      );
    }

    receivedRows += data.profiles.length;
    for (const profile of data.profiles) {
      if (!profilesById.has(profile.id)) {
        profilesById.set(profile.id, profile);
      }
    }
  }

  if (paginationChanged) {
    console.warn(
      `[Profiles API] ${lang} pagination metadata changed during retrieval; keeping the profiles returned within the initial ${pageCount}-page range.`,
    );
  }

  if (profilesById.size !== reportedCount) {
    console.warn(
      `[Profiles API] ${lang} initially reported ${reportedCount} records, but ${receivedRows} rows (${profilesById.size} unique profile IDs) were returned. Metadata may have changed or duplicate IDs were removed.`,
    );
  }

  return Array.from(profilesById.values());
}

/**
 * ერთი კონკრეტული პროფილის მოძებნა.
 */
export async function getProfileById(
  lang: SupportedLanguageCode,
  slugOrId: string,
): Promise<Profile | null> {
  const match = slugOrId.match(/^(\d+)(?:-|$)/);
  const id = match ? Number(match[1]) : NaN;

  if (!Number.isSafeInteger(id) || id <= 0) {
    return null;
  }

  const profile =
    (await getProfileDetail(
      PROFILE_DETAILS_API_BASE_URL,
      "public",
      lang,
      id,
    )) ??
    (await getProfileDetail(API_BASE_URL, "dev", lang, id));

  return profile;
}

async function getProfileDetail(
  baseUrl: string,
  apiOrigin: ProfileApiOrigin,
  lang: SupportedLanguageCode,
  id: number,
): Promise<Profile | null> {
  const response = await fetch(
    `${baseUrl}/${lang}/api/profile/${id}/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "",
      next: {
        revalidate: 60,
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Profiles API error: ${response.status}`);
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("Invalid profile detail response");
  }

  if (Object.keys(data).length === 0) {
    return null;
  }

  const profile = data as Partial<Profile>;

  if (
    typeof profile.id !== "number" ||
    !Number.isSafeInteger(profile.id) ||
    typeof profile.alias !== "string" ||
    typeof profile.title !== "string"
  ) {
    throw new Error("Invalid profile detail response");
  }

  if (profile.id !== id) {
    throw new Error(
      `Profiles API returned profile ${profile.id} for requested ID ${id}`,
    );
  }

  return {
    ...profile,
    apiOrigin,
  } as Profile;
}

export async function getProfileArticlesPage(
  lang: SupportedLanguageCode,
  profileId: number,
  page: number,
  totalArticles?: number,
  apiOrigin: ProfileApiOrigin = "public",
): Promise<ProfileArticlesPage> {
  if (
    !Number.isSafeInteger(profileId) ||
    profileId <= 0 ||
    !Number.isSafeInteger(page) ||
    page < 1
  ) {
    throw new Error("Invalid profile article request");
  }

  const response = await fetch(
    `${apiOrigin === "public" ? PROFILE_DETAILS_API_BASE_URL : API_BASE_URL}/${lang}/api/profile/${profileId}/articles/`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        page: String(page),
      }).toString(),
      next: {
        revalidate: 60,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `Profile articles API error: ${response.status}`,
    );
  }

  const data: unknown = await response.json();

  if (
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  ) {
    throw new Error("Invalid profile articles response");
  }

  const result = data as Partial<ProfileArticlesResponse>;

  if (
    result.id !== profileId ||
    !result.pagination ||
    result.pagination.page !== page ||
    !Array.isArray(result.results)
  ) {
    throw new Error(
      `Profile articles API returned invalid data for page ${page}`,
    );
  }

  if (
    result.pagination.total !== undefined &&
    (!Number.isSafeInteger(result.pagination.total) ||
      result.pagination.total < 0)
  ) {
    throw new Error(
      `Profile articles API returned invalid page metadata for page ${page}`,
    );
  }

  if (
    result.pagination.count !== undefined &&
    (!Number.isSafeInteger(result.pagination.count) ||
      result.pagination.count < 0)
  ) {
    throw new Error(
      `Profile articles API returned invalid count metadata for page ${page}`,
    );
  }

  const articlesById = new Map<number, ProfileArticle>();

  for (const article of result.results) {
    if (
      !article ||
      typeof article.id !== "number" ||
      !Number.isSafeInteger(article.id) ||
      typeof article.title !== "string" ||
      typeof article.url !== "string"
    ) {
      throw new Error(
        `Profile articles API returned an invalid article on page ${page}`,
      );
    }

    if (!articlesById.has(article.id)) {
      articlesById.set(article.id, article);
    }
  }

  const totalPages = result.pagination.total;
  const recordCount =
    result.pagination.count ?? totalArticles;
  const hasFullPage =
    result.results.length === PROFILE_ARTICLES_PAGE_SIZE;

  return {
    page,
    results: Array.from(articlesById.values()),
    hasNext:
      result.results.length > 0 &&
      (totalPages !== undefined
        ? page < totalPages || hasFullPage
        : recordCount !== undefined
          ? page * PROFILE_ARTICLES_PAGE_SIZE < recordCount ||
            hasFullPage
          : hasFullPage),
  };
}
