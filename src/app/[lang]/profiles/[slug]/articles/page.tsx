import type { Metadata } from "next";

import ProfileArticlesPage from "@/components/Profile/ProfileArticlesPage";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import { getProfileById } from "@/lib/api/profiles";
import {
  absoluteUrl,
  localizedMetadata,
  localizedPath,
} from "@/lib/seo";
import "@/app/[lang]/profile/ProfilePage.scss";

interface ProfileArticlesRouteProps {
  params: Promise<{
    lang: SupportedLanguageCode;
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string | string[];
  }>;
}

function parsePage(value?: string | string[]): number {
  const pageValue = Array.isArray(value) ? value[0] : value;
  const page = Number(pageValue ?? 1);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export async function generateMetadata({
  params,
}: ProfileArticlesRouteProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const profile = await getProfileById(lang, slug);

  if (!profile) {
    return localizedMetadata(
      lang,
      `profiles/${slug}/articles`,
      lang === "en" ? "Profile articles" : "პროფილის სტატიები",
      lang === "en"
        ? "Articles associated with this profile."
        : "ამ პროფილთან დაკავშირებული სტატიები.",
      { robots: { index: false, follow: false } },
    );
  }

  const profileSlug = `${profile.id}${profile.alias ? `-${profile.alias}` : ""}`;
  const path = `profiles/${profileSlug}/articles`;
  const metadata = localizedMetadata(
    lang,
    path,
    `${profile.title} | ${
      lang === "en" ? "Profile articles" : "პროფილის სტატიები"
    }`,
    lang === "en"
      ? `Articles associated with ${profile.title}.`
      : `${profile.title}-თან დაკავშირებული სტატიები.`,
  );
  metadata.alternates = {
    canonical: absoluteUrl(localizedPath(lang, path)),
  };

  return metadata;
}

export default async function ProfileArticlesRoute({
  params,
  searchParams,
}: ProfileArticlesRouteProps) {
  const [{ lang, slug }, query] = await Promise.all([
    params,
    searchParams,
  ]);

  return (
    <ProfileArticlesPage
      lang={lang}
      slug={slug}
      page={parsePage(query.page)}
    />
  );
}
