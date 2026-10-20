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
  const id = lang === "ka" ? 48 : 46;
  const alias = lang === "ka" ? "tvalsazrisi" : "opinion";
  return generateCategoryMetadata(lang, `${id}-${alias}`, "viewpoint");
}

export default async function ViewpointPage({ params }: PageProps) {
  const { lang } = await params;
  const id = lang === "ka" ? 48 : 46;
  const alias = lang === "ka" ? "tvalsazrisi" : "opinion";
  return <CategoryListingPage lang={lang} id={id} alias={alias} />;
}
