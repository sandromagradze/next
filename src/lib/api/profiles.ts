const API_BASE_URL = "https://dev.ipn.ge";

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

export interface Profile {
  id: number;
  alias: string;
  title: string;
  position: string;
  birthdate: string;
  is_pub: boolean;
  url: string;
  hashtags?: ProfileHashtags;
  images?: ProfileImages;
}

interface ProfilesResponse {
  pagination?: {
    count: number;
    page: number;
    total: number;
  };
  profiles: Profile[];
}

function getImageUrl(image?: string | null): string {
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
    return src.replace(/^http:\/\//, "https://");
  }

  if (src.startsWith("/media/")) {
    return `${API_BASE_URL}${src}`;
  }

  if (src.startsWith("media/")) {
    return `${API_BASE_URL}/${src}`;
  }

  if (src.startsWith("/")) {
    return `${API_BASE_URL}${src}`;
  }

  return `${API_BASE_URL}/${src}`;
}

export function getProfileImage(profile: Profile): string {
  const image =
    profile.images?.["176x176"] ||
    profile.images?.["198x198"] ||
    "";

  return getImageUrl(image);
}

export async function getProfiles(
  lang: string,
  page = 1
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
    }
  );

  if (!response.ok) {
    throw new Error(
      `Profiles API error: ${response.status}`
    );
  }

  return response.json();
}

/**
 * იღებს ყველა პროფილს ყველა გვერდიდან.
 */
export async function getAllProfiles(
  lang: string
): Promise<Profile[]> {
  const firstPage = await getProfiles(lang, 1);

  const profiles = [
    ...(firstPage.profiles || []),
  ];

  const total =
    firstPage.pagination?.total ||
    profiles.length;

  const pageSize =
    firstPage.pagination?.count ||
    profiles.length;

  if (
    !pageSize ||
    profiles.length >= total
  ) {
    return profiles;
  }

  const totalPages = Math.ceil(
    total / pageSize
  );

  for (
    let page = 2;
    page <= totalPages;
    page++
  ) {
    const data = await getProfiles(
      lang,
      page
    );

    profiles.push(
      ...(data.profiles || [])
    );
  }

  return profiles;
}

/**
 * ერთი კონკრეტული პროფილის მოძებნა.
 */
export async function getProfileById(
  lang: string,
  id: string
): Promise<Profile | null> {
  const profiles =
    await getAllProfiles(lang);

  const profile = profiles.find(
    (item) =>
      String(item.id) === String(id) ||
      item.alias === id
  );

  return profile || null;
}