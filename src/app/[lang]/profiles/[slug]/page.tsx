import type { Metadata } from "next";

import ProfileDetailPage, {
  generateProfileMetadata,
} from "@/components/Profile/ProfileDetailPage";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import "@/app/[lang]/profile/ProfilePage.scss";

interface ProfileRouteProps {
  params: Promise<{
    lang: SupportedLanguageCode;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProfileRouteProps): Promise<Metadata> {
  const { lang, slug } = await params;
  return generateProfileMetadata(lang, slug);
}

export default async function ProfileRoute({
  params,
}: ProfileRouteProps) {
  const { lang, slug } = await params;
  return <ProfileDetailPage lang={lang} slug={slug} />;
}
