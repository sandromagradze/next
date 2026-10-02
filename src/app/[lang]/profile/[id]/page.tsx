import WrapperA from "@/components/WrapperA/WrapperA";
import Image from "next/image";

import {
  getProfileById,
  getProfileImage,
} from "@/lib/api/profiles";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import type { Metadata } from "next";
import {
  absoluteUrl,
  localizedMetadata,
  localizedPath,
  stripHtml,
} from "@/lib/seo";

interface ProfileDetailPageProps {
  params: Promise<{
    lang: SupportedLanguageCode;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProfileDetailPageProps): Promise<Metadata> {
  const { lang, id } = await params;
  const profile = await getProfileById(lang, id);
  const path = `profile/${id}`;

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

  const otherLanguage: SupportedLanguageCode = lang === "en" ? "ka" : "en";
  const alternateProfile = await getProfileById(otherLanguage, id);
  const image = getProfileImage(profile);
  const metadata = localizedMetadata(
    lang,
    path,
    profile.title,
    stripHtml(profile.position) || profile.title,
    {
      openGraph: {
        type: "profile",
        images: image
          ? [{ url: image, width: 198, height: 198, alt: profile.title }]
          : undefined,
      },
    },
  );

  if (!alternateProfile) {
    metadata.alternates = {
      canonical: absoluteUrl(localizedPath(lang, path)),
    };
  }

  return metadata;
}

export default async function ProfileDetailPage({
  params,
}: ProfileDetailPageProps) {
  const { lang, id } = await params;

  const profile =
    await getProfileById(lang, id);

  if (!profile) {
    return (
      <main className="py-6">
        <WrapperA>
          <div className="p-6 text-center">
            პროფილი ვერ მოიძებნა.
          </div>
        </WrapperA>
      </main>
    );
  }

  const imageUrl =
    getProfileImage(profile);

  return (
    <main className="py-6">
      <WrapperA>
        <article className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            <div>
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={profile.title}
                  width={198}
                  height={198}
                  priority
                  className="w-[198px] h-[198px] object-cover"
                />
              ) : (
                <div className="w-[198px] h-[198px] bg-gray-200 flex items-center justify-center text-gray-400">
                  No Photo
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {profile.title}
              </h1>

              {profile.position && (
                <p className="mt-3 text-lg text-gray-600">
                  {profile.position}
                </p>
              )}

              {profile.birthdate && (
                <p className="mt-4">
                  {lang === "en" ? "Date of birth:" : "დაბადების თარიღი:"}{" "}
                  {profile.birthdate}
                </p>
              )}
            </div>
          </div>
        </article>
      </WrapperA>
    </main>
  );
}