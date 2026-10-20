import type { Metadata } from "next";
import type { SupportedLanguageCode } from "@/lib/api/i18n";
import CategoryListingPage, {
  generateCategoryMetadata,
} from "@/components/CategoryListing/CategoryListingPage";

interface PageProps {
  params: Promise<{ lang: SupportedLanguageCode }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lang } = await params;
  return generateCategoryMetadata(lang, "15-anonsi", "announcements");
}

export default async function AnnouncementsPage({ params }: PageProps) {
  const { lang } = await params;
  return <CategoryListingPage lang={lang} id={15} alias="anonsi" />;
}
