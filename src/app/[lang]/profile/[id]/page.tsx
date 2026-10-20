import type { Metadata } from "next";

import ProfileDetailPage, {
  generateProfileMetadata,
} from "@/components/Profile/ProfileDetailPage";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import "@/app/[lang]/profile/ProfilePage.scss";

interface ProfileDetailRouteProps {
  params: Promise<{
    lang: SupportedLanguageCode;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProfileDetailRouteProps): Promise<Metadata> {
  const { lang, id } = await params;
  return generateProfileMetadata(lang, id);
}

export default async function ProfileDetailRoute({
  params,
}: ProfileDetailRouteProps) {
  const { lang, id } = await params;
  return <ProfileDetailPage lang={lang} slug={id} />;
}
