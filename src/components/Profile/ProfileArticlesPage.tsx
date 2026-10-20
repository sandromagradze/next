import Link from "next/link";
import { notFound } from "next/navigation";

import ProfileArticleList from "@/components/Profile/ProfileArticleList";
import ProfilePageShell from "@/components/Profile/ProfilePageShell";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import {
  getProfileArticlesPage,
  getProfileById,
} from "@/lib/api/profiles";
import { localizedPath } from "@/lib/seo";
import "@/components/Profile/ProfileDetail.scss";

export default async function ProfileArticlesPage({
  lang,
  slug,
  page,
}: {
  lang: SupportedLanguageCode;
  slug: string;
  page: number;
}) {
  const profile = await getProfileById(lang, slug);

  if (!profile) {
    notFound();
  }

  const articlePage = await getProfileArticlesPage(
    lang,
    profile.id,
    page,
    profile.articles?.count,
    profile.apiOrigin,
  );
  const profileSlug = `${profile.id}${profile.alias ? `-${profile.alias}` : ""}`;
  const profileHref = localizedPath(lang, `profiles/${profileSlug}`);
  const articlesHref = `${profileHref}/articles`;

  return (
    <ProfilePageShell lang={lang}>
      <section className="profile-articles-page">
        <Link
          className="profile-articles-page__back"
          href={profileHref}
        >
          {profile.title}
        </Link>
        <h1 className="profile-articles-page__title">
          {lang === "en" ? "Profile articles" : "პროფილის სტატიები"}
        </h1>
        <ProfileArticleList
          articles={articlePage.results}
          lang={lang}
          page={page}
          hasNext={articlePage.hasNext}
          articlesHref={articlesHref}
        />
      </section>
    </ProfilePageShell>
  );
}
