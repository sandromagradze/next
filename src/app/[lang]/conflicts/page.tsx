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
  return generateCategoryMetadata(lang, "10-konpliktebi", "conflicts");
}

export default async function ConflictsPage({ params }: PageProps) {
  const { lang } = await params;
  return <CategoryListingPage lang={lang} id={10} alias="konpliktebi" />;
}
