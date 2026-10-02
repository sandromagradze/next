import type { MetadataRoute } from "next";

import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { getLatestNews } from "@/lib/api/latestNews";
import {
  getAllProfiles,
  getProfileImage,
} from "@/lib/api/profiles";
import { absoluteUrl, localizedPath } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl(localizedPath("ka")),
      changeFrequency: "hourly",
      priority: 1,
    },
    {
      url: absoluteUrl(localizedPath("en")),
      changeFrequency: "hourly",
      priority: 1,
    },
  ];

  for (const lang of ["ka", "en"] as SupportedLanguageCode[]) {
    entries.push({
      url: absoluteUrl(localizedPath(lang, "profile")),
      changeFrequency: "daily",
      priority: 0.7,
    });

    try {
      const profiles = await getAllProfiles(lang);

      entries.push(
        ...profiles.map((profile) => {
          const image = getProfileImage(profile);

          return {
            url: absoluteUrl(
              localizedPath(lang, `profile/${profile.id}`),
            ),
            changeFrequency: "weekly" as const,
            priority: 0.5,
            ...(image ? { images: [image] } : {}),
          };
        }),
      );
    } catch {
      // Keep the core sitemap available when the profile API is unavailable.
    }

    try {
      const articles = await getLatestNews(
        lang,
        15,
        "revalidate",
      );

      entries.push(
        ...articles.map((article) => ({
          url: absoluteUrl(
            localizedPath(lang, article.url),
          ),
          changeFrequency: "hourly" as const,
          priority: 0.8,
          ...(article.image?.original
            ? { images: [article.image.original] }
            : {}),
        })),
      );
    } catch {
      // Keep the profile and homepage URLs available if latest news is unavailable.
    }
  }

  return entries;
}