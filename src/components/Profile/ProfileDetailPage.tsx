import sanitizeHtml from "sanitize-html";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProfileArticlesExpandable from "@/components/Profile/ProfileArticlesExpandable";
import ProfileActions from "@/components/Profile/ProfileActions";
import ProfileBiography from "@/components/Profile/ProfileBiography";
import ProfilePageShell from "@/components/Profile/ProfilePageShell";
import ProfilePortrait from "@/components/Profile/ProfilePortrait";
import HomeProfileSection from "@/components/Home/HomeProfileSection/HomeProfileSection";
import "@/components/Profile/ProfileDetail.scss";
import {
  getProfileById,
  getProfileImage,
  getProfiles,
  type Profile,
  type ProfilePosition,
  type ProfileSource,
} from "@/lib/api/profiles";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import {
  absoluteUrl,
  localizedMetadata,
  localizedPath,
  stripHtml,
} from "@/lib/seo";

const PUBLIC_SITE_URL = "https://www.interpressnews.ge";

function getCanonicalSlug(profile: Profile): string {
  return `${profile.id}${profile.alias ? `-${profile.alias}` : ""}`;
}

function sanitizeProfileHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [
      "a",
      "b",
      "blockquote",
      "br",
      "div",
      "em",
      "figcaption",
      "figure",
      "h2",
      "h3",
      "h4",
      "i",
      "img",
      "li",
      "ol",
      "p",
      "span",
      "strong",
      "u",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "rel", "target", "title"],
      img: ["alt", "height", "src", "width"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    transformTags: {
      a: (tagName, attributes) => ({
        tagName,
        attribs: {
          ...attributes,
          ...(attributes.target === "_blank"
            ? { rel: "noopener noreferrer" }
            : {}),
        },
      }),
    },
  });
}

function getPositionLabel(position: ProfilePosition): string {
  if (typeof position === "string") {
    return position.trim();
  }

  const title =
    position.title ||
    position.position ||
    position.name ||
    "";
  const organization = position.organization || "";
  const description = position.description || "";
  const dates = [
    position.start_date,
    position.end_date,
  ].filter(Boolean).join(" – ");

  return [
    title,
    organization,
    dates,
    description,
  ].filter(Boolean).join(" — ");
}

function getSourceLabel(source: ProfileSource): {
  title: string;
  url: string | null;
} {
  if (typeof source === "string") {
    return { title: source.trim(), url: null };
  }

  const url = getSafeExternalUrl(source.url);
  return {
    title: source.title?.trim() || url || "",
    url,
  };
}

function getSafeExternalUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function getAdditionalDescriptions(profile: Profile): string[] {
  const descriptions = [
    profile.description,
    profile.biography,
    profile.short_description,
    profile.introtext,
  ]
    .filter(
      (value): value is string =>
        typeof value === "string" &&
        stripHtml(value).length > 0 &&
        stripHtml(value) !== stripHtml(profile.position),
    )
    .map(sanitizeProfileHtml);

  return Array.from(new Set(descriptions)).filter(
    (value) => stripHtml(value).length > 0,
  );
}

export async function generateProfileMetadata(
  lang: SupportedLanguageCode,
  slug: string,
): Promise<Metadata> {
  const path = `profiles/${slug}`;
  const profile = await getProfileById(lang, slug);

  if (!profile) {
    return localizedMetadata(
      lang,
      path,
      lang === "en" ? "Profile not found" : "პროფილი ვერ მოიძებნა",
      lang === "en"
        ? "The requested profile could not be found."
        : "მოთხოვნილი პროფილი ვერ მოიძებნა.",
      { robots: { index: false, follow: false } },
    );
  }

  const canonicalPath = `profiles/${getCanonicalSlug(profile)}`;
  const image = getProfileImage(profile);
  const metadata = localizedMetadata(
    lang,
    canonicalPath,
    profile.title,
    stripHtml(profile.short_description || profile.position) ||
      profile.title,
    {
      openGraph: {
        type: "profile",
        images: image
          ? [{ url: image, width: 198, height: 198, alt: profile.title }]
          : undefined,
      },
    },
  );

  metadata.alternates = {
    canonical: absoluteUrl(localizedPath(lang, canonicalPath)),
  };

  return metadata;
}

export default async function ProfileDetailPage({
  lang,
  slug,
}: {
  lang: SupportedLanguageCode;
  slug: string;
}) {
  const [profile, profilesResponse] = await Promise.all([
    getProfileById(lang, slug),
    getProfiles(lang, 1),
  ]);

  if (!profile) {
    notFound();
  }

  const imageUrl = getProfileImage(profile);
  const profileSlug = getCanonicalSlug(profile);
  const profilePath = localizedPath(lang, `profiles/${profileSlug}`);
  const shareUrl = new URL(profilePath, PUBLIC_SITE_URL).toString();
  const descriptions = getAdditionalDescriptions(profile);
  const currentPositions = (profile.current_positions || [])
    .map(getPositionLabel)
    .filter(Boolean);
  const formerPositions = (profile.former_positions || [])
    .map(getPositionLabel)
    .filter(Boolean);
  const sources = (profile.sources || [])
    .map(getSourceLabel)
    .filter((source) => source.title);
  const sameAs = (profile.same_as || [])
    .map((value) => getSafeExternalUrl(value))
    .filter((value): value is string => value !== null);
  const hasAdditionalDetails = Boolean(
    descriptions.length ||
    profile.alternate_name?.trim() ||
    currentPositions.length ||
    formerPositions.length ||
    sources.length ||
    sameAs.length,
  );

  return (
    <ProfilePageShell lang={lang} showFooter>
      <div className="profile-detail">
        <section className="profile-detail__section">
          <h2 className="profile-detail__eyebrow">
            {lang === "en" ? "Profile" : "პროფილი"}
          </h2>

          <header className="profile-detail__header">
            <div className="profile-detail__portrait">
              <ProfilePortrait imageUrl={imageUrl} title={profile.title} />
            </div>

            <div className="profile-detail__identity">
              <div className="profile-detail__summary">
                <h1 className="profile-detail__name">{profile.title}</h1>
                {profile.position && (
                  <div
                    className="profile-detail__position"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeProfileHtml(profile.position),
                    }}
                  />
                )}
              </div>
              {(profile.birthdate || profile.birth_date) && (
                <p className="profile-detail__birthdate">
                  {lang === "en" ? "Date of birth:" : "დაბადების თარიღი:"}{" "}
                  {profile.birthdate || profile.birth_date}
                </p>
              )}

              <ProfileBiography
                lang={lang}
                hasDetails={hasAdditionalDetails}
                alternateName={profile.alternate_name}
                descriptions={descriptions}
                currentPositions={currentPositions}
                formerPositions={formerPositions}
                sources={sources}
                sameAs={sameAs}
              />
            </div>
          </header>
        </section>

        <ProfileActions lang={lang} shareUrl={shareUrl} />

        <section className="profile-articles">
          <h2 className="profile-articles__heading">
            {lang === "en" ? "Profile articles" : "პროფილის სტატიები"}
          </h2>
          <ProfileArticlesExpandable
            key={`${lang}:${profile.id}`}
            apiOrigin={profile.apiOrigin}
            articles={profile.articles?.result || []}
            lang={lang}
            profileId={profile.id}
            totalArticles={
              typeof profile.articles?.count === "number" &&
              Number.isSafeInteger(profile.articles.count) &&
              profile.articles.count >= 0
                ? profile.articles.count
                : undefined
            }
          />
        </section>

        <HomeProfileSection
          lang={lang}
          localizedProfileCards={profilesResponse.profiles ?? []}
          showAllProfiles={false}
        />
      </div>
    </ProfilePageShell>
  );
}
